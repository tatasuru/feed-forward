<script setup lang="ts">
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

/******************************
 * TIPTAP EDITOR INITIALIZATION
 *****************************/
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    TiptapStarterKit,
    Placeholder.configure({ placeholder: "プロジェクトの説明..." }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-primary underline",
      },
    }),
  ],
  editable: true,
  onUpdate: ({ editor }) => {
    emit("update:modelValue", editor.getHTML());
  },
});

/******************************
 * BUTTONS
 *****************************/
const textFormatButtons = [
  {
    icon: "mdi:format-bold",
    action: () => editor.value?.chain().focus().toggleBold().run(),
    isActive: () => editor.value?.isActive("bold"),
    canRun: () => editor.value?.can().chain().focus().toggleBold().run(),
    label: "Bold",
  },
  {
    icon: "mdi:format-italic",
    action: () => editor.value?.chain().focus().toggleItalic().run(),
    isActive: () => editor.value?.isActive("italic"),
    canRun: () => editor.value?.can().chain().focus().toggleItalic().run(),
    label: "Italic",
  },
  {
    icon: "mdi:format-strikethrough",
    action: () => editor.value?.chain().focus().toggleStrike().run(),
    isActive: () => editor.value?.isActive("strike"),
    canRun: () => editor.value?.can().chain().focus().toggleStrike().run(),
    label: "Strike",
  },
  {
    icon: "mdi:code-braces",
    action: () => editor.value?.chain().focus().toggleCode().run(),
    isActive: () => editor.value?.isActive("code"),
    canRun: () => editor.value?.can().chain().focus().toggleCode().run(),
    label: "Code",
  },
];

const headingButtons = [
  {
    icon: "",
    action: () =>
      editor.value?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 1 }),
    canRun: () =>
      editor.value?.can().chain().focus().toggleHeading({ level: 1 }).run(),
    label: "H1",
  },
  {
    icon: "",
    action: () =>
      editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 2 }),
    canRun: () =>
      editor.value?.can().chain().focus().toggleHeading({ level: 2 }).run(),
    label: "H2",
  },
  {
    icon: "",
    action: () =>
      editor.value?.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 3 }),
    canRun: () =>
      editor.value?.can().chain().focus().toggleHeading({ level: 3 }).run(),
    label: "H3",
  },
  {
    icon: "",
    action: () =>
      editor.value?.chain().focus().toggleHeading({ level: 4 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 4 }),
    canRun: () =>
      editor.value?.can().chain().focus().toggleHeading({ level: 4 }).run(),
    label: "H4",
  },
  {
    icon: "",
    action: () =>
      editor.value?.chain().focus().toggleHeading({ level: 5 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 5 }),
    canRun: () =>
      editor.value?.can().chain().focus().toggleHeading({ level: 5 }).run(),
    label: "H5",
  },
  {
    icon: "",
    action: () =>
      editor.value?.chain().focus().toggleHeading({ level: 6 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 6 }),
    canRun: () =>
      editor.value?.can().chain().focus().toggleHeading({ level: 6 }).run(),
    label: "H6",
  },
];

const listButtons = [
  {
    icon: "mdi:format-list-bulleted",
    action: () => editor.value?.chain().focus().toggleBulletList().run(),
    isActive: () => editor.value?.isActive("bulletList"),
    canRun: () => editor.value?.can().chain().focus().toggleBulletList().run(),
    label: "Bullet List",
  },
  {
    icon: "mdi:format-list-numbers",
    action: () => editor.value?.chain().focus().toggleOrderedList().run(),
    isActive: () => editor.value?.isActive("orderedList"),
    canRun: () => editor.value?.can().chain().focus().toggleOrderedList().run(),
    label: "Ordered List",
  },
];

const blockButtons = [
  {
    icon: "mdi:format-quote-open",
    action: () => editor.value?.chain().focus().toggleBlockquote().run(),
    isActive: () => editor.value?.isActive("blockquote"),
    canRun: () => editor.value?.can().chain().focus().toggleBlockquote().run(),
    label: "Blockquote",
  },
  {
    icon: "mdi:code-braces",
    action: () => editor.value?.chain().focus().toggleCodeBlock().run(),
    isActive: () => editor.value?.isActive("codeBlock"),
    canRun: () => editor.value?.can().chain().focus().toggleCodeBlock().run(),
    label: "Code Block",
  },
];

const otherButtons = [
  {
    icon: "mdi:format-clear",
    action: () => editor.value?.chain().focus().unsetAllMarks().run(),
    isActive: () => editor.value?.isActive("clear"),
    canRun: () => editor.value?.can().chain().focus().unsetAllMarks().run(),
    label: "Clear Formatting",
  },
  {
    icon: "mdi:format-vertical-align-top",
    action: () => editor.value?.chain().focus().setHorizontalRule().run(),
    isActive: () => editor.value?.isActive("horizontalRule"),
    canRun: () => editor.value?.can().chain().focus().setHorizontalRule().run(),
    label: "Horizontal Rule",
  },
  {
    icon: "mdi:rewind",
    action: () => editor.value?.chain().focus().undo().run(),
    isActive: () => editor.value?.isActive("undo"),
    canRun: () => editor.value?.can().chain().focus().undo().run(),
    label: "Undo",
  },
  {
    icon: "mdi:fast-forward",
    action: () => editor.value?.chain().focus().redo().run(),
    isActive: () => editor.value?.isActive("redo"),
    canRun: () => editor.value?.can().chain().focus().redo().run(),
    label: "Redo",
  },
];

/******************************
 * HELPERS
 *****************************/
const focusEditor = () => {
  if (editor.value) {
    editor.value.commands.focus();
  }
};

const insertLink = () => {
  if (!editor.value) return;

  const url = prompt("URL", "https://");

  if (url) {
    editor.value.chain().focus().setLink({ href: url }).run();
  }
};

/******************************
 * Lifecycle hooks
 *****************************/
onBeforeUnmount(() => {
  unref(editor)?.destroy();
});

watch(
  () => props.modelValue,
  (newValue) => {
    const editorContent = editor.value?.getHTML() || "";

    // Only update if the content is different to avoid cursor jumping
    if (newValue !== editorContent && editor.value) {
      editor.value.commands.setContent(newValue, false);
    }
  }
);
</script>

<template>
  <div class="w-full flex flex-col gap-2">
    <div v-if="editor" class="w-full flex gap-1 items-center flex-wrap">
      <TipTapButton
        v-for="(button, index) in textFormatButtons"
        :key="index"
        :editor="editor"
        :action="button.action"
        :disabled="!button.canRun()"
        :class="{
          'bg-purple text-white dark:bg-purple/30 dark:text-purple':
            button.isActive(),
        }"
        :label="button.label"
        :icon="button.icon"
      />

      <TipTapButton
        v-for="(button, index) in headingButtons"
        :key="index"
        :editor="editor"
        :action="button.action"
        :disabled="!button.canRun()"
        :class="{
          'bg-purple text-white dark:bg-purple/30 dark:text-purple':
            button.isActive(),
        }"
        :label="button.label"
        :icon="button.icon"
      />

      <TipTapButton
        :editor="editor"
        :action="insertLink"
        :class="{ 'bg-purple text-white': editor.isActive('link') }"
        label="Insert Link"
        icon="mdi:link"
      />

      <TipTapButton
        v-for="(button, index) in listButtons"
        :key="index"
        :editor="editor"
        :action="button.action"
        :disabled="!button.canRun()"
        :class="{
          'bg-purple text-white dark:bg-purple/30 dark:text-purple':
            button.isActive(),
        }"
        :label="button.label"
        :icon="button.icon"
      />

      <TipTapButton
        v-for="(button, index) in blockButtons"
        :key="index"
        :editor="editor"
        :action="button.action"
        :disabled="!button.canRun()"
        :class="{
          'bg-purple text-white dark:bg-purple/30 dark:text-purple':
            button.isActive(),
        }"
        :label="button.label"
        :icon="button.icon"
      />

      <TipTapButton
        v-for="(button, index) in otherButtons"
        :key="index"
        :editor="editor"
        :action="button.action"
        :disabled="!button.canRun()"
        :class="{ 'bg-purple text-white': button.isActive() }"
        :label="button.label"
        :icon="button.icon"
      />
    </div>

    <TiptapEditorContent
      :editor="editor"
      class="prose prose-sm project-description min-h-[300px] max-w-none p-4 border rounded-md"
      @click="focusEditor"
    />
  </div>
</template>
