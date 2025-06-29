<script setup lang="ts">
import type {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { ArrowUpDown, ChevronDown } from "lucide-vue-next";
import { h, ref } from "vue";
import { valueUpdater } from "@/components/ui/table/utils";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import DropdownAction from "./DataTableDemoColumn.vue";

export interface Payment {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
}

const data: Payment[] = [
  {
    id: "m5gr84i9",
    amount: 316,
    status: "success",
    email: "ken99@yahoo.com",
  },
  {
    id: "3u1reuv4",
    amount: 242,
    status: "success",
    email: "Abe45@gmail.com",
  },
  {
    id: "derv1ws0",
    amount: 837,
    status: "processing",
    email: "Monserrat44@gmail.com",
  },
  {
    id: "5kma53ae",
    amount: 874,
    status: "success",
    email: "Silas22@gmail.com",
  },
  {
    id: "bhqecj4p",
    amount: 721,
    status: "failed",
    email: "carmella@hotmail.com",
  },
];

const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(Checkbox, {
        modelValue:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate"),
        "onUpdate:modelValue": (value) =>
          table.toggleAllPageRowsSelected(!!value),
        ariaLabel: "Select all",
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value) => row.toggleSelected(!!value),
        ariaLabel: "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      h("div", { class: "capitalize" }, row.getValue("status")),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Email", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", { class: "lowercase" }, row.getValue("email")),
  },
  {
    accessorKey: "amount",
    header: () => h("div", { class: "text-right" }, "Amount"),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("amount"));

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return h("div", { class: "text-right font-medium" }, formatted);
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      // return h(DropdownAction, {
      //   payment,
      //   onExpand: row.toggleExpanded,
      // });
    },
  },
];

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});
const expanded = ref<ExpandedState>({});

const table = useVueTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, rowSelection),
  onExpandedChange: (updaterOrValue) => valueUpdater(updaterOrValue, expanded),
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
    get expanded() {
      return expanded.value;
    },
  },
});
</script>

<template>
  <div id="create-project" class="grid w-full gap-4">
    <div class="flex items-center justify-between">
      <PageTitle
        title="フォーム詳細"
        description="フォームの詳細を確認できます。"
        size="large"
      />
      <Button variant="main" type="button" as-child>
        <NuxtLink
          :to="`/my-forms/${$route.params.id}/edit`"
          class="flex items-center gap-1"
        >
          <Icon name="mdi:pencil" />
          フォームを編集する
        </NuxtLink>
      </Button>
    </div>

    <Tabs default-value="analytics" class="w-full">
      <TabsList
        class="w-full bg-background border-b border-border justify-start rounded-none p-0 relative"
      >
        <TabsTrigger
          value="analytics"
          class="w-fit border-t-0 border-l-0 border-r-0 border-b-0 rounded-none flex-0 cursor-pointer shadow-none hover:shadow-none data-[state=active]:shadow-none data-[state=active]:border-b-purple data-[state=active]:border-b-2 -mb-1 data-[state=active]:relative data-[state=active]:z-10"
        >
          <Icon name="mdi:google-analytics" class="!size-4" />
          アナリティクス
        </TabsTrigger>
        <TabsTrigger
          value="feedbacks"
          class="w-fit border-t-0 border-l-0 border-r-0 border-b-0 rounded-none flex-0 cursor-pointer shadow-none hover:shadow-none data-[state=active]:shadow-none data-[state=active]:border-b-purple data-[state=active]:border-b-2 -mb-1 data-[state=active]:relative data-[state=active]:z-10"
        >
          <Icon name="mdi:comment-arrow-left-outline" class="!size-4" />
          フィードバック
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          class="w-fit border-t-0 border-l-0 border-r-0 border-b-0 rounded-none flex-0 cursor-pointer shadow-none hover:shadow-none data-[state=active]:shadow-none data-[state=active]:border-b-purple data-[state=active]:border-b-2 -mb-1 data-[state=active]:relative data-[state=active]:z-10"
        >
          <Icon name="mdi:cog-outline" class="!size-4" />
          設定
        </TabsTrigger>
      </TabsList>
      <TabsContent value="analytics"> analytics </TabsContent>
      <TabsContent value="feedbacks">
        <div class="w-full">
          <!-- header -->
          <div class="flex items-center py-4">
            <Input
              class="max-w-sm"
              placeholder="Filter emails..."
              :model-value="table.getColumn('email')?.getFilterValue() as string"
              @update:model-value="
                table.getColumn('email')?.setFilterValue($event)
              "
            />
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" class="ml-auto">
                  Columns <ChevronDown class="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  v-for="column in table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())"
                  :key="column.id"
                  class="capitalize"
                  :model-value="column.getIsVisible()"
                  @update:model-value="
                    (value: any) => {
                      column.toggleVisibility(!!value);
                    }
                  "
                >
                  {{ column.id }}
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <!-- table -->
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow
                  v-for="headerGroup in table.getHeaderGroups()"
                  :key="headerGroup.id"
                >
                  <TableHead
                    v-for="header in headerGroup.headers"
                    :key="header.id"
                  >
                    <FlexRender
                      v-if="!header.isPlaceholder"
                      :render="header.column.columnDef.header"
                      :props="header.getContext()"
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template v-if="table.getRowModel().rows?.length">
                  <template
                    v-for="row in table.getRowModel().rows"
                    :key="row.id"
                  >
                    <TableRow :data-state="row.getIsSelected() && 'selected'">
                      <TableCell
                        v-for="cell in row.getVisibleCells()"
                        :key="cell.id"
                      >
                        <FlexRender
                          :render="cell.column.columnDef.cell"
                          :props="cell.getContext()"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow v-if="row.getIsExpanded()">
                      <TableCell :colspan="row.getAllCells().length">
                        {{ JSON.stringify(row.original) }}
                      </TableCell>
                    </TableRow>
                  </template>
                </template>

                <TableRow v-else>
                  <TableCell :colspan="columns.length" class="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <!-- footer -->
          <div class="flex items-center justify-end space-x-2 py-4">
            <div class="flex-1 text-sm text-muted-foreground">
              {{ table.getFilteredSelectedRowModel().rows.length }} of
              {{ table.getFilteredRowModel().rows.length }} row(s) selected.
            </div>
            <div class="space-x-2">
              <Button
                variant="outline"
                size="sm"
                :disabled="!table.getCanPreviousPage()"
                @click="table.previousPage()"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                :disabled="!table.getCanNextPage()"
                @click="table.nextPage()"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="settings"> settings </TabsContent>
    </Tabs>
  </div>
</template>
