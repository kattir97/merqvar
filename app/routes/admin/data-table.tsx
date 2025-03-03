import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Pagination } from "./pagination";
import { useNavigation, useNavigate, Form, NavLink } from "react-router";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { Button } from "~/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalWords: number;
  page: number;
  pageSize: number;
  sorting: { sortBy: string; order: string };
  globalFilter: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalWords,
  page,
  pageSize,
  sorting,
  globalFilter,
}: DataTableProps<TData, TValue>) {
  const pageCount = Math.ceil(totalWords / pageSize);
  const [filter, setFilter] = useState(globalFilter);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    manualSorting: true,
    manualFiltering: true,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
      sorting: [{ id: sorting.sortBy, desc: sorting.order === "desc" }],
    },
  });

  // ===== PAGINATION ======  //
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const navigate = useNavigate();

  // Handle sorting by updating the URL when a column header is clicked
  const handleSort = (columnId: string) => {
    const column = table.getColumn(columnId);
    // Check if the column is sortable
    if (!column?.columnDef.enableSorting) {
      return; // If the column is not sortable, do nothing
    }

    const newSortOrder = sorting.order === "asc" ? "desc" : "asc";
    navigate(
      `?page=${page}&pageSize=${pageSize}&sortBy=${columnId}&order=${newSortOrder}&filter=${globalFilter}`
    );
  };

  // Handle global filter input change and update the URL
  const handleFilterChange = (event: React.FormEvent) => {
    event.preventDefault();
    // Update the URL with the new filter, maintaining page, pageSize, sortBy, and order
    navigate(
      `?page=${(page = 1)}&pageSize=${pageSize}&sortBy=${sorting.sortBy}&order=${
        sorting.order
      }&filter=${encodeURIComponent(filter)}`
    );

    // setFilter("");
  };

  return (
    <div className={isLoading ? "opacity-50" : "opacity-100"}>
      <div className="flex items-center justify-between py-4">
        <Form onSubmit={handleFilterChange} className="flex flex-1">
          <Input
            placeholder="Искать..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
            disabled={isLoading}
          />
        </Form>
        <NavLink to="add-word">
          <Button variant="default" disabled={isLoading}>
            Добавить слово
          </Button>
        </NavLink>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <button
                          // Ensure the button always renders, but handle client-side logic after hydration
                          onClick={() => handleSort(header.column.id)}
                          // Ensure sorting indicator is consistent
                          disabled={!header.column.columnDef.enableSorting} // Disable sorting on non-sortable columns
                          className="flex items-center"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {/* Sorting indicator only for client-side */}
                          {/* Always render arrows, but adjust visibility */}
                          <span className="ml-2">
                            {header.column.getIsSorted() === "asc" ? (
                              <ArrowUp size={20} />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown size={20} />
                            ) : (
                              <span className="opacity-0">
                                {/* Placeholder arrow to maintain DOM structure */}
                                <ArrowUp size={20} />
                              </span>
                            )}
                          </span>
                        </button>
                      )}
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
                  Ничего не найдено.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Pagination isLoading={isLoading} page={page} pageCount={pageCount} />
      </div>
    </div>
  );
}
