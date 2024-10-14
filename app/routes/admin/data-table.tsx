import { useNavigate, useNavigation } from "@remix-run/react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalWords: number;
  page: number;
  pageSize: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalWords,
  page,
  pageSize,
}: DataTableProps<TData, TValue>) {
  const navigate = useNavigate();
  const pageCount = Math.ceil(totalWords / pageSize);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    manualSorting: true,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
      sorting: {
        sorting,
      },
    },
    onSortingChange: setSorting,
  });

  const handlePageChange = (newPage: number) => {
    // Build the new URL with updated query params (page number)
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("page", String(newPage + 1));
    navigate(`${newUrl.pathname}?${newUrl.searchParams.toString()}`, {
      replace: true, // Update the URL without triggering a full page reload
    });
  };

  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <div className={isLoading ? "opacity-50" : "opacity-100"}>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("headword")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("headword")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 py-4 mr-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 2)}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <span>{`Page ${page} of ${pageCount}`}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page)}
            disabled={page >= pageCount || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
