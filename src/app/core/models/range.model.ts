export interface Range<T> {
    from: T | null;
    to: T | null;
}

export function emptyRange<T>(): Range<T> {
  return { from: null, to: null };
}