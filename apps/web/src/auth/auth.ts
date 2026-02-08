const STORAGE_KEY = "snaptask.v5.userId";

export const getUserId = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value && value.trim() ? value : null;
};

export const setUserId = (id: string): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, id.trim());
};

export const clearUserId = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};
