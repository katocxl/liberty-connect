const defaultHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
};

export const jsonResponse = (payload: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(payload, null, init.headers ? undefined : 2), {
    ...init,
    headers: {
      ...defaultHeaders,
      ...(init.headers ?? {}),
    },
  });

export const errorResponse = (message: string, status = 400, details?: Record<string, unknown>) =>
  jsonResponse(
    {
      error: message,
      ...(details ?? {}),
    },
    { status },
  );

export const methodNotAllowed = (methods: string[]) =>
  errorResponse(`Method not allowed. Expected ${methods.join(', ')}`, 405, {
    allow: methods,
  });
