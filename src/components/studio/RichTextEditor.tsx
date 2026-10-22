import { useRef } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { toast } from "sonner";
import { uploadFile } from "./shared";

interface Props {
  content: unknown;
  html?: string | null;
  placeholder?: string;
  onChange: (value: { json: unknown; html: string }) => void;
  compact?: boolean;
}

function ToolbarButton({ active, onClick, label, children }: { active?: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`grid h-8 min-w-8 place-items-center rounded-md px-2 text-sm font-semibold transition-colors ${
        active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const file = useRef<HTMLInputElement>(null);
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      link: e.isActive("link"),
      quote: e.isActive("blockquote"),
      ul: e.isActive("bulletList"),
      ol: e.isActive("orderedList"),
    }),
  });

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = async (f?: File) => {
    if (!f) return;
    const id = toast.loading("Uploading image…");
    try {
      const { url } = await uploadFile(f, "inline");
      const alt = window.prompt("Describe the image for screen readers (alt text)") ?? "";
      editor.chain().focus().setImage({ src: url, alt }).run();
      toast.success("Image added", { id });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed", { id });
    }
  };

  const c = () => editor.chain().focus();
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-border bg-card/95 p-2 backdrop-blur">
      <ToolbarButton label="Heading" active={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
      <ToolbarButton label="Subheading" active={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton label="Bold" active={s.bold} onClick={() => c().toggleBold().run()}><b>B</b></ToolbarButton>
      <ToolbarButton label="Italic" active={s.italic} onClick={() => c().toggleItalic().run()}><i className="font-serif">I</i></ToolbarButton>
      <ToolbarButton label="Link" active={s.link} onClick={setLink}>↗</ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton label="Pull quote" active={s.quote} onClick={() => c().toggleBlockquote().run()}>“ ”</ToolbarButton>
      <ToolbarButton label="Bulleted list" active={s.ul} onClick={() => c().toggleBulletList().run()}>•</ToolbarButton>
      <ToolbarButton label="Numbered list" active={s.ol} onClick={() => c().toggleOrderedList().run()}>1.</ToolbarButton>
      <ToolbarButton label="Section break" onClick={() => c().setHorizontalRule().run()}>■</ToolbarButton>
      <ToolbarButton label="Image" onClick={() => file.current?.click()}>▣</ToolbarButton>
      <input ref={file} type="file" accept="image/*" hidden onChange={(e) => addImage(e.target.files?.[0])} />
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton label="Undo" onClick={() => c().undo().run()}>↶</ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => c().redo().run()}>↷</ToolbarButton>
    </div>
  );
}

export default function RichTextEditor({ content, html, placeholder = "Start writing…", onChange, compact = false }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    // Prefer the editable JSON; fall back to stored HTML (e.g. imported content).
    content: (content as object | null) ?? html ?? "",
    editorProps: {
      attributes: {
        class: `prose-editorial max-w-none px-6 py-6 outline-none focus:outline-none ${compact ? "min-h-[200px]" : "min-h-[480px]"}`,
      },
    },
    onUpdate: ({ editor: e }) => onChange({ json: e.getJSON(), html: e.getHTML() }),
  });

  if (!editor) return <div className={`rounded-xl border border-border ${compact ? "h-[250px]" : "h-[530px]"}`} />;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card focus-within:border-foreground">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <style>{`.ProseMirror p.is-editor-empty:first-child::before{content:attr(data-placeholder);float:left;height:0;pointer-events:none;color:var(--ink-3)}`}</style>
    </div>
  );
}
