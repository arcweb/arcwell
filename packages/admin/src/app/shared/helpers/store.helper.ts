// Helper functions for signalStore functionality

// When removing an related object from a paginated table, there is a special case if the
// removed relation was the only one left on a page. This returns true if special case.
export function isRelationLastOnPage(
  totalCount: number,
  limit: number,
  pageIndex: number,
  offset: number,
) {
  const countAfterRemove = totalCount - 1;
  const maxPageIndex = Math.ceil(totalCount / limit) - 1;
  return (
    countAfterRemove !== 0 &&
    pageIndex === maxPageIndex &&
    countAfterRemove === offset
  );
}
