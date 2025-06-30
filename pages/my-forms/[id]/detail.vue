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
import { toast } from "vue-sonner";

export interface Feedback {
  id: string;
  feedback_1: number;
  feedback_2: number;
  feedback_3: number;
  comment: string;
  create_at: string;
}

const supabase = useSupabaseClient();
const route = useRoute();
const baseUrl = useRuntimeConfig().public.baseUrl;
const fullPublishUrl = computed(() => {
  if (!myFormsDetails.value?.publish_url) return "";
  return baseUrl + myFormsDetails.value.publish_url;
});

/******************************
 * For table view
 ******************************/
const data: Feedback[] = [
  {
    id: "1",
    feedback_1: 2,
    feedback_2: 3,
    feedback_3: 4,
    comment: "Great service!",
    create_at: "2023-10-01T12:00:00Z",
  },
  {
    id: "2",
    feedback_1: 2,
    feedback_2: 1,
    feedback_3: 4,
    comment: "Great service!",
    create_at: "2023-10-01T12:00:00Z",
  },
  {
    id: "3",
    feedback_1: 2,
    feedback_2: 4,
    feedback_3: 5,
    comment: "Great service!",
    create_at: "2023-10-01T12:00:00Z",
  },
  {
    id: "4",
    feedback_1: 1,
    feedback_2: 3,
    feedback_3: 2,
    comment: "Great service!",
    create_at: "2023-10-01T12:00:00Z",
  },
  {
    id: "5",
    feedback_1: 2,
    feedback_2: 5,
    feedback_3: 3,
    comment: "Great service!",
    create_at: "2023-10-01T12:00:00Z",
  },
];

const columns: ColumnDef<Feedback>[] = [
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
    id: "id",
    accessorKey: "id",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          class: "cursor-pointer",
        },
        () => ["ID", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", { class: "lowercase" }, row.getValue("id")),
  },
  {
    accessorKey: "feedback_1",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => "文字の大きさ"
      );
    },
    cell: ({ row }) =>
      h("div", { class: "lowercase" }, row.getValue("feedback_1")),
  },
  {
    accessorKey: "feedback_2",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => "色使い"
      );
    },
    cell: ({ row }) =>
      h("div", { class: "lowercase" }, row.getValue("feedback_2")),
  },
  {
    accessorKey: "feedback_3",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => "わかりやすさ"
      );
    },
    cell: ({ row }) =>
      h("div", { class: "lowercase" }, row.getValue("feedback_3")),
  },
  {
    accessorKey: "comment",
    header: () => h("div", {}, "Comment"),
    cell: ({ row }) => h("div", {}, row.getValue("comment")),
  },
  {
    accessorKey: "create_at",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          class: "cursor-pointer",
        },
        () => ["フィードバック日", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) =>
      h(
        "div",
        {},
        new Date(row.getValue("create_at")).toLocaleDateString("ja-JP")
      ),
  },
  // TODO: actions column
  // {
  //   id: "actions",
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const payment = row.original;

  //     return h("div", {
  //       payment,
  //       onExpand: row.toggleExpanded,
  //     });
  //   },
  // },
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

/******************************
 * fetch form details
 ******************************/
const { data: myFormsDetails } = await useAsyncData(
  `myFormsDetails`,
  async () => {
    try {
      const { data, error } = await supabase
        .from("my_forms")
        .select("*")
        .eq("id", route.params.id);

      if (error) throw new Error(error.message);
      return data[0];
    } catch (error) {
      console.error("Error fetching form templates:", error);
      return [];
    }
  }
);

const isCopied = ref<boolean>(false);
const copyUrl = async (text: string) => {
  if (!text) {
    console.error("コピーするURLがありません");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    isCopied.value = true;

    // 2秒後にアイコンを元に戻す
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);

    // 必要に応じてトースト通知を追加
    toast.success("URLがコピーされました！");
  } catch (error) {
    console.error("コピーに失敗しました:", error);
  }
};
</script>

<template>
  <div
    id="create-project"
    class="grid grid-rows-[auto_1fr] w-full h-full gap-4"
  >
    <div class="flex items-center justify-between">
      <PageTitle
        title="フォーム詳細"
        description="フォームの詳細を確認できます。"
        size="large"
      />

      <div class="flex items-center gap-2">
        <Button variant="mainOutline" type="button" as-child>
          <NuxtLink
            :to="`/my-forms/${$route.params.id}/preview`"
            class="flex items-center gap-1"
            target="_blank"
          >
            <Icon name="mdi:eye" />
            フォームプレビュー
          </NuxtLink>
        </Button>
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
    </div>

    <Tabs default-value="analytics" class="w-full gap-4">
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
        <div class="w-full flex flex-col gap-2">
          <!-- header -->
          <div class="flex items-center mb-2">
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
                <Button variant="outline" class="ml-auto cursor-pointer">
                  行の表示
                  <ChevronDown class="ml-2 h-4 w-4" />
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
          <div class="flex items-center justify-end space-x-2">
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
                前へ
              </Button>
              <Button
                variant="outline"
                size="sm"
                :disabled="!table.getCanNextPage()"
                @click="table.nextPage()"
              >
                次へ
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <Tabs
          default-value="share"
          class="flex-row gap-12 h-full"
          orientation="vertical"
        >
          <TabsList
            class="w-full max-w-[200px] bg-background flex-col border-none justify-start rounded-none p-0 relative"
          >
            <TabsTrigger
              value="share"
              class="w-full justify-start bg-none text-purple hover:bg-purple/20 data-[state=active]:bg-purple/20 data-[state=active]:text-purple rounded-[3px] flex-0 cursor-pointer shadow-none hover:shadow-none data-[state=active]:shadow-none"
            >
              共有設定
            </TabsTrigger>
          </TabsList>
          <Separator orientation="vertical" class="h-full border-border" />
          <TabsContent value="share" class="flex flex-col gap-4">
            <PageTitle
              title="共有設定"
              description="フォームの共有設定を行います。"
              size="medium"
            />

            <!-- publish url -->
            <Card>
              <CardHeader>
                <CardTitle>フォームの専用リンク（URL）</CardTitle>
                <CardDescription>
                  フォームの専用リンクをコピーして、他の人と共有できます。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="w-full relative">
                  <Input class="w-full pr-16" :value="fullPublishUrl" readonly>
                    {{ fullPublishUrl }}
                  </Input>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="absolute top-0 right-0 h-full rounded-l-none cursor-pointer"
                    @click="copyUrl(fullPublishUrl)"
                  >
                    <Icon name="mdi:content-copy" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <!-- iframe -->
            <Card>
              <CardHeader>
                <CardTitle>埋め込みコード</CardTitle>
                <CardDescription>
                  フォームをウェブサイトに埋め込むためのコードです。
                  <br />
                  iFrameのwidthとheightは必要に応じて調整してください。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="w-full relative">
                  <Input
                    class="w-full pr-16"
                    :value="`<iframe src='${fullPublishUrl}' width='100%' height='500px' frameborder='0'></iframe>`"
                    readonly
                  >
                    {{ `<iframe
                      src="${fullPublishUrl}"
                      width="100%"
                      height="500px"
                      frameborder="0"
                    >
                    </iframe
                    >` }}
                  </Input>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="absolute top-0 right-0 h-full rounded-l-none cursor-pointer"
                    @click="
                      copyUrl(
                        `<iframe src='${fullPublishUrl}' width='100%' height='500px' frameborder='0'></iframe>`
                      )
                    "
                  >
                    <Icon name="mdi:content-copy" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  </div>
</template>
