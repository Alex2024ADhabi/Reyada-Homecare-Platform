import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Settings, Download, Filter, SortAsc, SortDesc, } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner, EmptyState } from "@/components/ui/loading-states";
export function DataTable({ columns, data, loading = false, searchKey, searchPlaceholder = "Search...", enableColumnVisibility = true, enableExport = false, onExport, className, emptyStateTitle = "No data available", emptyStateDescription = "There are no records to display.", pageSize = 10, enablePagination = true, enableSorting = true, enableFiltering = true, }) {
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState("");
    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: enablePagination
            ? getPaginationRowModel()
            : undefined,
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
            pagination: enablePagination
                ? {
                    pageIndex: 0,
                    pageSize,
                }
                : undefined,
        },
    });
    const handleExport = () => {
        if (onExport) {
            const filteredData = table
                .getFilteredRowModel()
                .rows.map((row) => row.original);
            onExport(filteredData);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "w-full", children: _jsx("div", { className: "flex items-center py-4", children: _jsx(LoadingSpinner, { text: "Loading data..." }) }) }));
    }
    return (_jsxs("div", { className: cn("w-full", className), children: [_jsxs("div", { className: "flex items-center justify-between py-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [enableFiltering && (_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: searchPlaceholder, value: globalFilter ?? "", onChange: (event) => setGlobalFilter(String(event.target.value)), className: "pl-8 max-w-sm" })] })), searchKey && enableFiltering && (_jsx(Input, { placeholder: `Filter by ${searchKey}...`, value: table.getColumn(searchKey)?.getFilterValue() ?? "", onChange: (event) => table.getColumn(searchKey)?.setFilterValue(event.target.value), className: "max-w-sm" }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [enableExport && (_jsxs(Button, { variant: "outline", size: "sm", onClick: handleExport, className: "ml-auto", children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Export"] })), enableColumnVisibility && (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", className: "ml-auto", children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), "View", _jsx(ChevronDown, { className: "ml-2 h-4 w-4" })] }) }), _jsx(DropdownMenuContent, { align: "end", children: table
                                            .getAllColumns()
                                            .filter((column) => column.getCanHide())
                                            .map((column) => {
                                            return (_jsx(DropdownMenuCheckboxItem, { className: "capitalize", checked: column.getIsVisible(), onCheckedChange: (value) => column.toggleVisibility(!!value), children: column.id }, column.id));
                                        }) })] }))] })] }), _jsx("div", { className: "rounded-md border", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: table.getHeaderGroups().map((headerGroup) => (_jsx(TableRow, { children: headerGroup.headers.map((header) => {
                                    return (_jsx(TableHead, { className: "relative", children: header.isPlaceholder ? null : (_jsxs("div", { className: cn("flex items-center space-x-2", header.column.getCanSort() &&
                                                "cursor-pointer select-none"), onClick: header.column.getToggleSortingHandler(), children: [flexRender(header.column.columnDef.header, header.getContext()), enableSorting && header.column.getCanSort() && (_jsx("div", { className: "flex flex-col", children: header.column.getIsSorted() === "asc" ? (_jsx(SortAsc, { className: "h-4 w-4" })) : header.column.getIsSorted() === "desc" ? (_jsx(SortDesc, { className: "h-4 w-4" })) : (_jsx("div", { className: "h-4 w-4 opacity-50", children: _jsx(Filter, { className: "h-4 w-4" }) })) }))] })) }, header.id));
                                }) }, headerGroup.id))) }), _jsx(TableBody, { children: table.getRowModel().rows?.length ? (table.getRowModel().rows.map((row) => (_jsx(TableRow, { "data-state": row.getIsSelected() && "selected", className: "hover:bg-muted/50", children: row.getVisibleCells().map((cell) => (_jsx(TableCell, { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))) }, row.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: columns.length, className: "h-24 text-center", children: _jsx(EmptyState, { title: emptyStateTitle, description: emptyStateDescription }) }) })) })] }) }), enablePagination && (_jsxs("div", { className: "flex items-center justify-between space-x-2 py-4", children: [_jsxs("div", { className: "flex-1 text-sm text-muted-foreground", children: [table.getFilteredSelectedRowModel().rows.length, " of", " ", table.getFilteredRowModel().rows.length, " row(s) selected."] }), _jsxs("div", { className: "flex items-center space-x-6 lg:space-x-8", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("p", { className: "text-sm font-medium", children: "Rows per page" }), _jsxs(Select, { value: `${table.getState().pagination.pageSize}`, onValueChange: (value) => {
                                            table.setPageSize(Number(value));
                                        }, children: [_jsx(SelectTrigger, { className: "h-8 w-[70px]", children: _jsx(SelectValue, { placeholder: table.getState().pagination.pageSize }) }), _jsx(SelectContent, { side: "top", children: [10, 20, 30, 40, 50].map((pageSize) => (_jsx(SelectItem, { value: `${pageSize}`, children: pageSize }, pageSize))) })] })] }), _jsxs("div", { className: "flex w-[100px] items-center justify-center text-sm font-medium", children: ["Page ", table.getState().pagination.pageIndex + 1, " of", " ", table.getPageCount()] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", className: "hidden h-8 w-8 p-0 lg:flex", onClick: () => table.setPageIndex(0), disabled: !table.getCanPreviousPage(), children: [_jsx("span", { className: "sr-only", children: "Go to first page" }), _jsx(ChevronsLeft, { className: "h-4 w-4" })] }), _jsxs(Button, { variant: "outline", className: "h-8 w-8 p-0", onClick: () => table.previousPage(), disabled: !table.getCanPreviousPage(), children: [_jsx("span", { className: "sr-only", children: "Go to previous page" }), _jsx(ChevronLeft, { className: "h-4 w-4" })] }), _jsxs(Button, { variant: "outline", className: "h-8 w-8 p-0", onClick: () => table.nextPage(), disabled: !table.getCanNextPage(), children: [_jsx("span", { className: "sr-only", children: "Go to next page" }), _jsx(ChevronRight, { className: "h-4 w-4" })] }), _jsxs(Button, { variant: "outline", className: "hidden h-8 w-8 p-0 lg:flex", onClick: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage(), children: [_jsx("span", { className: "sr-only", children: "Go to last page" }), _jsx(ChevronsRight, { className: "h-4 w-4" })] })] })] })] }))] }));
}
