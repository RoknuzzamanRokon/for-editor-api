"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

const TOOLBAR_BUTTON =
  "flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800";
const TOOLBAR_BUTTON_ACTIVE = "bg-primary/10 text-primary";

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
    editorProps: {
      attributes: {
        class:
          "rte-content min-h-[180px] px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  // Keep the editor in sync when the parent resets `value` (e.g. after send,
  // or when switching which contact a reply targets) without fighting the
  // user's own typing on every keystroke.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="min-h-[220px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40" />
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/60">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${TOOLBAR_BUTTON} ${editor.isActive("bold") ? TOOLBAR_BUTTON_ACTIVE : ""}`}
          title="Bold"
        >
          <span className="material-symbols-outlined text-[18px]">format_bold</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${TOOLBAR_BUTTON} ${editor.isActive("italic") ? TOOLBAR_BUTTON_ACTIVE : ""}`}
          title="Italic"
        >
          <span className="material-symbols-outlined text-[18px]">format_italic</span>
        </button>
        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${TOOLBAR_BUTTON} ${editor.isActive("heading", { level: 2 }) ? TOOLBAR_BUTTON_ACTIVE : ""}`}
          title="Heading"
        >
          <span className="material-symbols-outlined text-[18px]">title</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${TOOLBAR_BUTTON} ${editor.isActive("bulletList") ? TOOLBAR_BUTTON_ACTIVE : ""}`}
          title="Bullet list"
        >
          <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${TOOLBAR_BUTTON} ${editor.isActive("orderedList") ? TOOLBAR_BUTTON_ACTIVE : ""}`}
          title="Numbered list"
        >
          <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
        </button>
        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
        <button
          type="button"
          onClick={setLink}
          className={`${TOOLBAR_BUTTON} ${editor.isActive("link") ? TOOLBAR_BUTTON_ACTIVE : ""}`}
          title="Link"
        >
          <span className="material-symbols-outlined text-[18px]">link</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className={TOOLBAR_BUTTON}
          title="Clear formatting"
        >
          <span className="material-symbols-outlined text-[18px]">format_clear</span>
        </button>
      </div>
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}
