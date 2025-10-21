import { ENV } from '../constants/env';
import { supabase } from './supabase';

type Method = 'POST' | 'GET' | 'PUT' | 'DELETE';

const buildQueryString = (params: Record<string, unknown>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    query.set(key, String(value));
  });
  return query.toString();
};

type Serializable = string | Blob | ArrayBuffer | FormData | ReadableStream<Uint8Array<ArrayBufferLike>>;

const isSerializableBody = (value: unknown): value is Serializable => {
  if (
    typeof value === 'string' ||
    value instanceof Blob ||
    value instanceof ArrayBuffer ||
    value instanceof FormData
  ) {
    return true;
  }

  return typeof ReadableStream !== 'undefined' && value instanceof ReadableStream;
};

export const callEdgeFunction = async <TResponse, TPayload = Record<string, unknown>>(
  name: string,
  payload?: TPayload,
  options: { method?: Method } = {},
): Promise<TResponse> => {
  const method = options.method ?? 'POST';

  if (method === 'GET') {
    const url = new URL(`${ENV.supabaseUrl}/functions/v1/${name}`);
    if (payload && typeof payload === 'object') {
      const queryString = buildQueryString(payload as Record<string, unknown>);
      if (queryString) {
        url.search = queryString;
      }
    }

    const { data: session } = await supabase.auth.getSession();

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.session?.access_token
          ? { Authorization: `Bearer ${session.session.access_token}` }
          : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Edge function ${name} failed (${response.status})`);
    }

    return (await response.json()) as TResponse;
  }

  const body = payload === undefined ? undefined : isSerializableBody(payload) ? payload : JSON.stringify(payload);
  const headers =
    body !== undefined && typeof body === 'string' && !isSerializableBody(payload)
      ? { 'Content-Type': 'application/json' }
      : undefined;

  const { data, error } = await supabase.functions.invoke<TResponse>(name, {
    method,
    body,
    headers,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Edge function returned no data');
  }

  return data;
};
