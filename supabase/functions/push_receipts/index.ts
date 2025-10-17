import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

import {
  createServiceClient,
  errorResponse,
  getExpoReceipts,
  jsonResponse,
  methodNotAllowed,
} from '../_shared/mod.ts';

interface ReceiptDescriptor {
  id?: string;
  token?: string;
}

interface ReceiptPayload {
  receipts?: ReceiptDescriptor[];
}

serve(async (request) => {
  if (request.method !== 'POST') {
    return methodNotAllowed(['POST']);
  }

  const supabase = createServiceClient();

  try {
    const payload = request.bodyUsed
      ? ((await request.json()) as ReceiptPayload)
      : { receipts: [] };

    const receipts = (payload.receipts ?? []).filter(
      (item): item is { id: string; token: string } => Boolean(item.id && item.token),
    );

    if (receipts.length === 0) {
      return jsonResponse({
        status: 'ok',
        processed: 0,
        disabled_tokens: [],
      });
    }

    const receiptMap = await getExpoReceipts(receipts.map((item) => item.id));

    const tokensToDisable = new Set<string>();
    const results: Record<string, unknown>[] = [];

    for (const receipt of receipts) {
      const details = receiptMap[receipt.id];
      if (!details) {
        results.push({
          id: receipt.id,
          token: receipt.token,
          status: 'missing',
        });
        continue;
      }

      const entry = {
        id: receipt.id,
        token: receipt.token,
        status: details.status,
        message: details.message,
        details: details.details,
      };

      results.push(entry);

      if (
        details.status === 'error' &&
        details.details?.error === 'DeviceNotRegistered'
      ) {
        tokensToDisable.add(receipt.token);
      }
    }

    if (tokensToDisable.size > 0) {
      const { error } = await supabase
        .from('device_tokens')
        .update({ disabled_at: new Date().toISOString() })
        .in('token', Array.from(tokensToDisable));

      if (error) {
        console.error('device_tokens.update', error, { tokens: tokensToDisable.size });
        return errorResponse('Failed to disable tokens', 500);
      }
    }

    return jsonResponse({
      status: 'ok',
      processed: receipts.length,
      disabled_tokens: Array.from(tokensToDisable),
      receipts: results,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error(error);
    return errorResponse('Unexpected error', 500);
  }
});
