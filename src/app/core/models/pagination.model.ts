export interface PageRequest {
  pageIndex: number;
  pageSize: number;
}

export interface PageResult<T> {
  items: T[];
  total: number;
}