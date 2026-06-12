"use client"


import { useState, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
    Bold,
    Italic,
    Heading2,
    List,
    ListOrdered,
    Quote,
    Link2,
    Eye,
    Pencil,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { proseMarkdownComponents } from "@/components/shared/admin/markdownComponents"

interface MarkdownEditorProps {
    name?: string
    defaultValue?: string
    placeholder?: string
    rows?: number
    className?: string
}



export function MarkdownEditor({
    name,
    defaultValue = "",
    placeholder,
    rows = 6,
    className,
}: MarkdownEditorProps) {
    const [value, setValue] = useState(defaultValue)
    const [mode, setMode] = useState<"write" | "preview">("write")
    const textareaRef = useRef<HTMLTextAreaElement>(null)


    function wrapSelection(before: string, after: string = before) {
        const textarea = textareaRef.current

        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selected = value.slice(start, end)
        const newValue = value.slice(0, start) + before + selected + after + value.slice(end)

        setValue(newValue)

        requestAnimationFrame(() => {
            textarea.focus()
            textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
        })
    }


    function insertLinePrefix(prefix: string) {
        const textarea = textareaRef.current

        if (!textarea) return

        const start = textarea.selectionStart
        const lineStart = value.lastIndexOf("\n", start - 1) + 1
        const newValue = value.slice(0, lineStart) + prefix + value.slice(lineStart)

        setValue(newValue)


        requestAnimationFrame(() => {
            textarea.focus()
            const cursor = start + prefix.length
            textarea.setSelectionRange(cursor, cursor)
        })
    }



    const toolbarButtons = [
        { icon: Bold, label: "Bold", action: () => wrapSelection("**") },
        { icon: Italic, label: "Italic", action: () => wrapSelection("*") },
        { icon: Heading2, label: "Heading", action: () => insertLinePrefix("## ") },
        { icon: List, label: "Bullet list", action: () => insertLinePrefix("- ") },
        { icon: ListOrdered, label: "Numbered list", action: () => insertLinePrefix("1. ") },
        { icon: Quote, label: "Quote", action: () => insertLinePrefix("> ") },
        { icon: Link2, label: "Link", action: () => wrapSelection("[", "](https://)") },
    ]



    return (
        <div className={cn("border border-gray-200 rounded-md overflow-hidden", className)}>
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-2 py-1">
                <div className="flex items-center gap-0.5">
                    {toolbarButtons.map(({ icon: Icon, label, action }) => (
                        <button
                            key={label}
                            type="button"
                            title={label}
                            onClick={action}
                            disabled={mode === "preview"}
                            className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                            <Icon size={14} />
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setMode("write")}
                        className={cn(
                            "flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors",
                            mode === "write"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <Pencil size={12} /> Write
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("preview")}
                        className={cn(
                            "flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors",
                            mode === "preview"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <Eye size={12} /> Preview
                    </button>
                </div>
            </div>

            {/* Body */}
            {mode === "write" ? (
                <textarea
                    ref={textareaRef}
                    name={name}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    rows={rows}
                    className="w-full p-3 text-sm focus:outline-none resize-y font-mono text-gray-900"
                />
            ) : (
                <div
                    className="p-3 overflow-y-auto"
                    style={{ minHeight: `${rows * 1.6}rem` }}
                >
                    {value.trim() ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={proseMarkdownComponents}>
                            {value}
                        </ReactMarkdown>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Nothing to preview yet.</p>
                    )}
                </div>
            )}

            {/* The textarea above unmounts in preview mode — this hidden input keeps
          the value in the form submission regardless of which mode is active. */}
            {mode === "preview" && <input type="hidden" name={name} value={value} />}
        </div>
    )
}