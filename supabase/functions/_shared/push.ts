import { errorResponse } from './http.ts';

export interface ExpoPushMessage {
  to: string;
  title?: string;
  body?: string;
  sound?: 'default' | null;
  data?: Record<string, unknown>;
  ttl?: number;
  expiration?: number | null;
  priority?: 'default' | 'normal' | 'high';
}

export interface ExpoPushTicket {
  id?: string;
  status: 'ok' | 'error';
  message?: string;
  details?: Record<string, unknown>;
}

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
const EXPO_RECEIPTS_ENDPOINT = 'https://exp.host/--/api/v2/push/getReceipts';

export const chunkMessages = <T>(items: T[], size: number): T[][] => {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
};

const buildHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Encoding': 'gzip, deflate',
  };

  const accessToken = Deno.env.get('EXPO_ACCESS_TOKEN');
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
};

export const sendExpoPushMessages = async (
  messages: ExpoPushMessage[],
): Promise<{ tickets: ExpoPushTicket[] }> => {
  if (messages.length === 0) {
    return { tickets: [] };
  }

  const headers = buildHeaders();
  const batches = chunkMessages(messages, 90);
  const tickets: ExpoPushTicket[] = [];

  for (const batch of batches) {
    const response = await fetch(EXPO_PUSH_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      throw errorResponse(
        `Expo push request failed (${response.status})`,
        502,
        { body: await response.text() },
      );
    }

    const payload = (await response.json()) as { data?: ExpoPushTicket[] };
    if (payload.data) {
      tickets.push(...payload.data);
    }
  }

  return { tickets };
};

export interface ExpoReceipt {
  status: 'ok' | 'error';
  message?: string;
  details?: {
    error?: string;
    [key: string]: unknown;
  };
}

export const getExpoReceipts = async (
  receiptIds: string[],
): Promise<Record<string, ExpoReceipt>> => {
  if (receiptIds.length === 0) {
    return {};
  }

  const response = await fetch(EXPO_RECEIPTS_ENDPOINT, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ ids: receiptIds }),
  });

  if (!response.ok) {
    throw errorResponse(
      `Expo receipt request failed (${response.status})`,
      502,
      { body: await response.text() },
    );
  }

  const payload = (await response.json()) as {
    data?: Record<string, ExpoReceipt>;
  };

  return payload.data ?? {};
};
