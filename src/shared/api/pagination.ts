// The shape every paged list in the API answers with.
export type Paginated<Item> = {
  items: Item[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

export function pageQuery(page: number, pageSize: number): string {
  return new URLSearchParams({ page: String(page), pageSize: String(pageSize) }).toString();
}
