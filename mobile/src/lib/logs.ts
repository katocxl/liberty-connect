export const debug = (...args: unknown[]) => {
  if (__DEV__) {
    console.log('[debug]', ...args);
  }
};

export const warn = (...args: unknown[]) => {
  console.warn('[warn]', ...args);
};

export const error = (...args: unknown[]) => {
  console.error('[error]', ...args);
};
