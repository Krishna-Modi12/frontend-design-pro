// Runtime stub for `@tanstack/react-table`. See ./README.md for why these exist.
//
// Headless by design, so a stub can be faithful cheaply: it reads the caller's
// `data` and `columns` and hands back real rows and cells. That matters — the
// table golds assert on rendered row content, and a stub returning empty models
// would let a broken column definition pass.
import * as React from 'react';

type AnyProps = Record<string, unknown>;

export const flexRender = (component: unknown, props: AnyProps) =>
  typeof component === 'function'
    ? React.createElement(component as React.ComponentType<AnyProps>, props)
    : (component as React.ReactNode);

// Row-model factories are opaque options in real usage; nothing reads them here.
export const getCoreRowModel = () => () => ({ rows: [] });
export const getSortedRowModel = () => () => ({ rows: [] });
export const getFilteredRowModel = () => () => ({ rows: [] });
export const getPaginationRowModel = () => () => ({ rows: [] });
export const getExpandedRowModel = () => () => ({ rows: [] });

export const useReactTable = (opts: AnyProps) => {
  const data = (opts?.data as unknown[]) ?? [];
  const columns = (opts?.columns as AnyProps[]) ?? [];

  const headers = columns.map((c, i) => {
    const column = {
      id: String(c.id ?? c.accessorKey ?? i),
      columnDef: c,
      getCanSort: () => true,
      getIsSorted: () => false as const,
      getCanHide: () => true,
      getIsVisible: () => true,
      toggleSorting: () => {},
      toggleVisibility: () => {},
      getToggleSortingHandler: () => () => {},
    };
    // `header` may be a render function, and `flexRender` passes it whatever
    // `getContext()` returns. An empty object here is what made a sortable
    // column's header crash on `column.getIsSorted()` — the context is the
    // contract, not a formality.
    const header = { id: column.id, isPlaceholder: false, colSpan: 1, column, getContext: () => ({}) };
    header.getContext = () => ({ header, column, table: undefined as unknown });
    return header;
  });

  const rows = data.map((row, i) => ({
    id: String(i),
    index: i,
    original: row,
    getIsSelected: () => false,
    toggleSelected: () => {},
    getVisibleCells: () =>
      columns.map((c, j) => ({
        id: `${i}_${j}`,
        column: { id: String(c.id ?? c.accessorKey ?? j), columnDef: c },
        row: { original: row, index: i, getValue: (k: string) => (row as AnyProps)?.[k] },
        getValue: () => (row as AnyProps)?.[String(c.accessorKey ?? c.id ?? '')],
        getContext: () => ({
          row: { original: row, index: i, getValue: (k: string) => (row as AnyProps)?.[k] },
          column: { id: String(c.id ?? c.accessorKey ?? j), columnDef: c },
          getValue: () => (row as AnyProps)?.[String(c.accessorKey ?? c.id ?? '')],
        }),
      })),
  }));

  return {
    getHeaderGroups: () => [{ id: 'headerGroup_0', headers }],
    getFooterGroups: () => [],
    getRowModel: () => ({ rows, flatRows: rows, rowsById: {} }),
    getAllColumns: () => headers.map((h) => h.column),
    getAllLeafColumns: () => headers.map((h) => h.column),
    getState: () => ({
      sorting: [],
      columnFilters: [],
      columnVisibility: {},
      rowSelection: {},
      pagination: { pageIndex: 0, pageSize: 10 },
    }),
    setPageIndex: () => {},
    setPageSize: () => {},
    nextPage: () => {},
    previousPage: () => {},
    getCanNextPage: () => false,
    getCanPreviousPage: () => false,
    getPageCount: () => 1,
    getFilteredRowModel: () => ({ rows }),
    getFilteredSelectedRowModel: () => ({ rows: [] }),
    resetRowSelection: () => {},
  };
};
