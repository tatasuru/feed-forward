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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-vue-next";
import { valueUpdater } from "@/components/ui/table/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "vue-sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const { data: myFormFeedbacks } = await useAsyncData(
  `myFormFeedbacks`,
  async () => {
    try {
      const { data, error } = await supabase
        .from("form_responses")
        .select("*")
        .eq("form_id", route.params.id);

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error("Error fetching form feedbacks:", error);
      return [];
    }
  }
);

/******************************
 * For table view
 ******************************/
const tableData = computed<Feedback[]>(() => {
  return (
    myFormFeedbacks.value?.map((feedback) => ({
      id: feedback.id,
      feedback_1: feedback.response_data.items[0].rating,
      feedback_2: feedback.response_data.items[1].rating,
      feedback_3: feedback.response_data.items[2].rating,
      comment: feedback.response_data.comment || "",
      referrer_url:
        feedback.referrer_url === "unknown" ? "" : feedback.referrer_url,
      create_at: feedback.created_at,
    })) || []
  );
});

const feedbackHeaders = computed(() => {
  return (
    myFormsDetails.value?.feedback_items.map(
      (item: any) => item.name || `フィードバック項目`
    ) || []
  );
});

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
        class:
          "cursor-pointer data-[state=checked]:bg-purple data-[state=checked]:border-purple data-[state=indeterminate]:bg-purple data-[state=indeterminate]:border-purple text-white",
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value) => row.toggleSelected(!!value),
        ariaLabel: "Select row",
        class:
          "cursor-pointer data-[state=checked]:bg-purple data-[state=checked]:border-purple data-[state=indeterminate]:bg-purple text-white",
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
    cell: ({ row }) =>
      h("div", { class: "lowercase px-3" }, row.getValue("id")),
  },
  {
    accessorKey: "feedback_1",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          class: "cursor-pointer",
        },
        () => [
          feedbackHeaders.value[0] || "フィードバック項目 1",
          h(ArrowUpDown, { class: "ml-2 h-4 w-4" }),
        ]
      );
    },
    cell: ({ row }) =>
      h("div", { class: "lowercase px-3" }, row.getValue("feedback_1")),
  },
  {
    accessorKey: "feedback_2",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          class: "cursor-pointer",
        },
        () => [
          feedbackHeaders.value[1] || "フィードバック項目 2",
          h(ArrowUpDown, { class: "ml-2 h-4 w-4" }),
        ]
      );
    },
    cell: ({ row }) =>
      h("div", { class: "lowercase px-3" }, row.getValue("feedback_2")),
  },
  {
    accessorKey: "feedback_3",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          class: "cursor-pointer",
        },
        () => [
          feedbackHeaders.value[2] || "フィードバック項目 3",
          h(ArrowUpDown, { class: "ml-2 h-4 w-4" }),
        ]
      );
    },
    cell: ({ row }) =>
      h("div", { class: "lowercase px-3" }, row.getValue("feedback_3")),
  },
  {
    accessorKey: "comment",
    header: () => h("div", {}, "コメント"),
    cell: ({ row }) => {
      const comment = row.getValue("comment") as string;
      if (!comment) return h("div", {}, "");
      if (comment.length >= 50) {
        return h(
          Tooltip,
          {},
          {
            default: () => [
              h(
                TooltipTrigger,
                { asChild: true },
                {
                  default: () =>
                    h(
                      "div",
                      {
                        class:
                          "max-w-[400px] overflow-hidden text-ellipsis whitespace-nowrap cursor-help",
                      },
                      comment
                    ),
                }
              ),
              h(
                TooltipContent,
                { class: "max-w-[300px]" },
                {
                  default: () =>
                    h(
                      "p",
                      {
                        class: "w-full break-words",
                      },
                      comment
                    ),
                }
              ),
            ],
          }
        );
      } else {
        return h(
          "div",
          {
            class:
              "max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap",
          },
          comment
        );
      }
    },
  },
  {
    accessorKey: "referrer_url",
    header: () => h("div", {}, "参照元"),
    cell: ({ row }) =>
      h(
        "div",
        { class: "lowercase" },
        row.getValue("referrer_url")
          ? h(
              "a",
              {
                href: row.getValue("referrer_url"),
                target: "_blank",
                class: "text-blue-500 hover:underline",
              },
              row.getValue("referrer_url")
            )
          : "なし"
      ),
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
        { class: "lowercase  px-3" },
        new Date(row.getValue("create_at")).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return h(
        DropdownMenu,
        {},
        {
          default: () => [
            h(
              DropdownMenuTrigger,
              { asChild: true },
              {
                default: () =>
                  h(Button, { variant: "ghost", class: "cursor-pointer" }, () =>
                    h(MoreHorizontal, { class: "h-4 w-4" })
                  ),
              }
            ),
            h(
              DropdownMenuContent,
              {
                align: "end",
                sideOffset: -8,
                alignOffset: 0,
                class: "w-56",
              },
              {
                default: () =>
                  h(DropdownMenuGroup, {}, () =>
                    h(
                      DropdownMenuItem,
                      {
                        onClick: () => {
                          copyUrl(
                            `${baseUrl}/my-forms/${route.params.id}/feedbacks/${row.original.id}`
                          );
                        },
                        class: "cursor-pointer",
                      },
                      () =>
                        h("div", { class: "flex items-center gap-2 text-sm" }, [
                          "フィードバックのURLをコピー",
                        ])
                    )
                  ),
              }
            ),
          ],
        }
      );
    },
  },
];

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});
const expanded = ref<ExpandedState>({});

const table = useVueTable({
  data: tableData,
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
  <TooltipProvider>
    <div
      id="create-project"
      class="grid grid-rows-[auto_1fr] w-full h-full gap-4"
    >
      <div class="flex items-center justify-between">
        <PageTitle
          :title="myFormsDetails?.title"
          :description="myFormsDetails?.description"
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

      <Tabs default-value="feedbacks" class="w-full gap-4">
        <TabsList
          class="w-full bg-background border-b border-border justify-start rounded-none p-0 relative"
        >
          <TabsTrigger
            value="feedbacks"
            class="w-fit border-t-0 border-l-0 border-r-0 border-b-0 rounded-none flex-0 cursor-pointer shadow-none hover:shadow-none data-[state=active]:shadow-none data-[state=active]:border-b-purple data-[state=active]:dark:border-b-purple data-[state=active]:border-b-2 -mb-1 data-[state=active]:relative data-[state=active]:z-10"
          >
            <Icon name="mdi:comment-arrow-left-outline" class="!size-4" />
            フィードバック
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            class="w-fit border-t-0 border-l-0 border-r-0 border-b-0 rounded-none flex-0 cursor-pointer shadow-none hover:shadow-none data-[state=active]:shadow-none data-[state=active]:border-b-purple data-[state=active]:dark:border-b-purple data-[state=active]:border-b-2 -mb-1 data-[state=active]:relative data-[state=active]:z-10"
          >
            <Icon name="mdi:cog-outline" class="!size-4" />
            設定
          </TabsTrigger>
        </TabsList>
        <TabsContent value="feedbacks">
          <div class="w-full flex flex-col gap-2">
            <!-- header -->
            <div class="flex items-center mb-2">
              <Input
                class="max-w-sm"
                placeholder="コメントを検索..."
                :model-value="table.getColumn('comment')?.getFilterValue() as string"
                @update:model-value="
                  table.getColumn('comment')?.setFilterValue($event)
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
                    <TableCell
                      :colspan="columns.length"
                      class="h-24 text-center"
                    >
                      フィードバックはまだありません。
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <!-- footer -->
            <div class="flex items-center justify-end space-x-2">
              <div class="flex-1 text-sm text-muted-foreground">
                {{ table.getFilteredSelectedRowModel().rows.length }} /
                {{ table.getFilteredRowModel().rows.length }} 件のフィードバック
              </div>
              <div class="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="!table.getCanPreviousPage()"
                  @click="table.previousPage()"
                  class="cursor-pointer"
                >
                  <Icon name="mdi:chevron-left" />
                  前へ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="!table.getCanNextPage()"
                  @click="table.nextPage()"
                  class="cursor-pointer"
                >
                  次へ
                  <Icon name="mdi:chevron-right" />
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
                class="w-full justify-start bg-none text-purple hover:bg-purple/20 data-[state=active]:bg-purple/20 data-[state=active]:text-purple rounded-[3px] flex-0 cursor-pointer shadow-none hover:shadow-none data-[state=active]:shadow-none dark:text-white hover:dark:bg-purple/20 data-[state=active]:dark:bg-purple/40 data-[state=active]:dark:text-white"
              >
                <Icon name="mdi:share-variant" class="!size-4" />
                共有設定
              </TabsTrigger>
            </TabsList>
            <Separator orientation="vertical" class="h-full border-border" />
            <TabsContent value="share" class="flex flex-col gap-4">
              <PageTitle
                title="共有設定"
                description="フォームの共有設定を行います。"
                size="small"
              />

              <div class="flex flex-col gap-3">
                <!-- publish url -->
                <Card
                  class="flex flex-col gap-4 shadow-none border-purple border-dashed rounded-sm py-4"
                >
                  <CardHeader class="px-4">
                    <CardTitle class="text-sm">
                      フォームの専用リンク（URL）
                    </CardTitle>
                    <CardDescription class="text-xs text-muted-foreground">
                      フォームの専用リンクをコピーして、他の人と共有できます。
                    </CardDescription>
                  </CardHeader>
                  <CardContent class="px-4">
                    <div class="w-full relative">
                      <Input
                        class="w-full pr-16"
                        :value="fullPublishUrl"
                        readonly
                      >
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
                <Card
                  class="flex flex-col gap-4 shadow-none border-purple border-dashed rounded-sm py-4"
                >
                  <CardHeader class="px-4">
                    <CardTitle class="text-sm">埋め込みコード</CardTitle>
                    <CardDescription class="text-xs text-muted-foreground">
                      フォームをウェブサイトに埋め込むためのコードです。
                      iFrameのwidthとheightは必要に応じて調整してください。
                    </CardDescription>
                  </CardHeader>
                  <CardContent class="px-4">
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
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  </TooltipProvider>
</template>
