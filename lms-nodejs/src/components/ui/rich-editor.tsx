'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import CodeBlock from '@tiptap/extension-code-block'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import '@/components/rich-editor/style/editor.css'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Code as CodeIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Code2,
  Table as TableIcon,
  Undo2,
  Redo2,
  Maximize,
  Minimize,
  CaseSensitive,
  ChevronDown,
  Ban,
} from 'lucide-react'
import {
  IconQuote,
  IconTextColor,
  IconTextHighlight,
  IconYoutube,
} from '@/components/rich-editor/icons'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ─────────────────────────────────────────────────────────────────────────────
// Color Palettes (exact match with Laravel LMS)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_COLORS = [
  '#000000', '#343434', '#545454', '#737373', '#9A9A9A',
  '#d0021b', '#f5a623', '#f8e71c', '#8b572a', '#417505',
  '#bd10e0', '#9013fe', '#4a90e2', '#50e3c2', '#b8e986',
  '#ffffff',
]

const MORE_COLORS = [
  '#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf',
  '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#a1a1aa',
]

const HIGHLIGHT_COLORS = [
  '#fef9c3', '#fef08a', '#fde68a', '#fed7aa', '#fca5a5',
  '#f0abfc', '#c4b5fd', '#a5b4fc', '#93c5fd', '#67e8f9',
  '#6ee7b7', '#86efac', '#d4d4d4', '#ffffff',
]

// ─────────────────────────────────────────────────────────────────────────────
// Heading Options
// ─────────────────────────────────────────────────────────────────────────────

const HEADING_OPTIONS = [
  { label: 'Paragraph', value: 'p' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Heading 4', value: 'h4' },
]

export interface RichEditorProps {
  value?: string
  initialContent?: string
  onChange?: (html: string) => void
  onContentChange?: (html: string) => void
  placeholder?: { paragraph?: string; imageCaption?: string } | string
  disabled?: boolean
  readonly?: boolean
  className?: string
  containerClass?: string
  minHeight?: number | string
  contentMinHeight?: number | string
  contentMaxHeight?: number | string
  change?: boolean
  hideMenuBar?: boolean
  hideStatusBar?: boolean
  ssr?: boolean
  output?: 'html' | 'json'
}

export default function RichEditor({
  value,
  initialContent,
  onChange,
  onContentChange,
  placeholder = 'Write your blog content here...',
  disabled = false,
  readonly = false,
  className,
  containerClass,
  minHeight = 220,
  contentMinHeight,
  contentMaxHeight,
  change = false,
  hideMenuBar = false,
  hideStatusBar = false,
}: RichEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [linkOpen, setLinkOpen] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)
  const [youtubeOpen, setYoutubeOpen] = useState(false)
  const [colorOpen, setColorOpen] = useState(false)
  const [hlOpen, setHlOpen] = useState(false)
  const [alignOpen, setAlignOpen] = useState(false)
  const [moreMarkOpen, setMoreMarkOpen] = useState(false)
  const [customColor, setCustomColor] = useState('')

  const isEditable = !disabled && !readonly

  const placeholderText =
    typeof placeholder === 'string'
      ? placeholder
      : placeholder?.paragraph || 'Write your blog content here...'

  const effectiveMinHeight =
    typeof contentMinHeight === 'number'
      ? contentMinHeight
      : typeof minHeight === 'number'
        ? minHeight
        : 220

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Youtube.configure({ width: 480, height: 270 }),
      CodeBlock,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
      Subscript,
      Superscript,
      Placeholder.configure({
        placeholder: placeholderText,
      }),
    ],
    content: value ?? initialContent ?? '',
    editable: isEditable,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      const html = ed.isEmpty ? '' : ed.getHTML()
      onChange?.(html)
      onContentChange?.(html)
    },
  })

  // Synchronize incoming external changes
  useEffect(() => {
    if (!editor) return
    const current = editor.isEmpty ? '' : editor.getHTML()
    const target = value ?? initialContent ?? ''
    if (target !== current && target !== undefined) {
      editor.commands.setContent(target)
    }
  }, [value, initialContent, editor])

  const getHeadingLabel = () => {
    if (!editor) return 'Paragraph'
    for (let i = 1; i <= 4; i++) {
      if (editor.isActive('heading', { level: i })) return `Heading ${i}`
    }
    return 'Paragraph'
  }

  const applyHeading = (val: string) => {
    if (!editor) return
    if (val === 'p') {
      editor.chain().focus().setParagraph().run()
    } else {
      const level = parseInt(val.replace('h', '')) as 1 | 2 | 3 | 4
      editor.chain().focus().toggleHeading({ level }).run()
    }
  }

  const getCurrentAlignIcon = () => {
    if (!editor) return AlignLeft
    if (editor.isActive({ textAlign: 'center' })) return AlignCenter
    if (editor.isActive({ textAlign: 'right' })) return AlignRight
    if (editor.isActive({ textAlign: 'justify' })) return AlignJustify
    return AlignLeft
  }

  const currentColor = editor?.getAttributes('textStyle').color || 'DEFAULT'
  const currentHlColor = editor?.getAttributes('highlight').color || 'DEFAULT'

  const insertLink = () => {
    if (!editor || !linkUrl.trim()) return
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run()
    setLinkUrl('')
    setLinkOpen(false)
  }

  const insertImage = () => {
    if (!editor || !imageUrl.trim()) return
    editor.chain().focus().setImage({ src: imageUrl.trim() }).run()
    setImageUrl('')
    setImageOpen(false)
  }

  const insertYoutube = () => {
    if (!editor || !youtubeUrl.trim()) return
    editor.commands.setYoutubeVideo({ src: youtubeUrl.trim() })
    setYoutubeUrl('')
    setYoutubeOpen(false)
  }

  const insertTable = () => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const words = editor?.storage.characterCount?.words() ?? 0
  const chars = editor?.storage.characterCount?.characters() ?? 0
  const AlignCurrentIcon = getCurrentAlignIcon()

  if (!editor) return null

  return (
    <div
      className={cn(
        'rte-editor rounded-lg border border-input shadow-xs transition-[color,box-shadow]',
        change
          ? 'selection:bg-primary selection:text-primary-foreground focus-within:border-ring focus-within:ring-1 focus-within:ring-ring hover:border-ring'
          : 'selection:bg-zinc-900 selection:text-zinc-50 focus-within:border-zinc-900 focus-within:ring-1 focus-within:ring-zinc-900 hover:border-zinc-900 dark:selection:bg-zinc-50 dark:selection:text-zinc-900 dark:focus-within:border-zinc-50 dark:focus-within:ring-zinc-50 dark:hover:border-zinc-50',
        isFullScreen && 'rte-editor--fullscreen',
        className,
        containerClass,
      )}
    >
      {/* ── TOP MENU BAR ────────────────────────────────────────────── */}
      {!hideMenuBar && (
        <div className="rte-menu-bar">
          <div className="rte-toolbar rte-toolbar--dense">
            {/* Undo / Redo */}
            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              disabled={!editor.can().undo()}
              onClick={() => editor.chain().focus().undo().run()}
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              disabled={!editor.can().redo()}
              onClick={() => editor.chain().focus().redo().run()}
              title="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </button>

            {/* Divider */}
            <div className="rte-toolbar__divider bg-neutral-200 dark:bg-neutral-800" />

            {/* Heading Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rte-button rte-button--ghost rte-menu__button min-w-[6.5rem] justify-between text-xs font-normal"
                >
                  <span className="rte-button__text">{getHeadingLabel()}</span>
                  <span className="rte-icon-arrow ml-1">
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rte-dropdown rte-heading-dropdown">
                {HEADING_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    data-heading={opt.value}
                    data-active={
                      (opt.value === 'p' && editor.isActive('paragraph')) ||
                      (opt.value.startsWith('h') &&
                        editor.isActive('heading', {
                          level: parseInt(opt.value.replace('h', '')),
                        }))
                        ? true
                        : undefined
                    }
                    className="rte-dropdown__item cursor-pointer"
                    onClick={() => applyHeading(opt.value)}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Divider */}
            <div className="rte-toolbar__divider bg-neutral-200 dark:bg-neutral-800" />

            {/* Bold, Italic, Underline */}
            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              data-active={editor.isActive('bold') || undefined}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              data-active={editor.isActive('italic') || undefined}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              data-active={editor.isActive('underline') || undefined}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </button>

            {/* More Marks Popover (Aa) */}
            <Popover open={moreMarkOpen} onOpenChange={setMoreMarkOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="rte-button rte-button--ghost rte-menu__button !px-1.5"
                  title="More format"
                >
                  <CaseSensitive className="h-4 w-4" />
                  <span className="rte-icon-arrow ml-0.5">
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="rte-popover w-auto p-1">
                <div className="rte-toolbar rte-toolbar--dense flex items-center gap-0.5">
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={editor.isActive('strike') || undefined}
                    onClick={() => {
                      editor.chain().focus().toggleStrike().run()
                      setMoreMarkOpen(false)
                    }}
                    title="Strikethrough"
                  >
                    <Strikethrough className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={editor.isActive('superscript') || undefined}
                    onClick={() => {
                      editor.chain().focus().toggleSuperscript().run()
                      setMoreMarkOpen(false)
                    }}
                    title="Superscript"
                  >
                    <SuperscriptIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={editor.isActive('subscript') || undefined}
                    onClick={() => {
                      editor.chain().focus().toggleSubscript().run()
                      setMoreMarkOpen(false)
                    }}
                    title="Subscript"
                  >
                    <SubscriptIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={editor.isActive('code') || undefined}
                    onClick={() => {
                      editor.chain().focus().toggleCode().run()
                      setMoreMarkOpen(false)
                    }}
                    title="Inline Code"
                  >
                    <CodeIcon className="h-4 w-4" />
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Divider */}
            <div className="rte-toolbar__divider bg-neutral-200 dark:bg-neutral-800" />

            {/* Text Color Button */}
            <Popover open={colorOpen} onOpenChange={setColorOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button relative"
                  title="Text color"
                >
                  <IconTextColor size={18} />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      left: 4,
                      right: 4,
                      height: 3,
                      borderRadius: 2,
                      backgroundColor:
                        currentColor === 'DEFAULT'
                          ? 'var(--rte-fg, #1f2328)'
                          : currentColor,
                    }}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="rte-popover rte-cp w-64 p-3">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Text Color
                </p>
                <div className="grid grid-cols-8 gap-1.5 mb-2">
                  {DEFAULT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="rte-color__btn"
                      style={{ backgroundColor: c }}
                      data-active={c === currentColor || undefined}
                      onClick={() => {
                        editor.chain().focus().setColor(c).run()
                        setColorOpen(false)
                      }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-1.5 mb-3">
                  {MORE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="rte-color__btn"
                      style={{ backgroundColor: c }}
                      data-active={c === currentColor || undefined}
                      onClick={() => {
                        editor.chain().focus().setColor(c).run()
                        setColorOpen(false)
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Input
                    className="h-7 text-xs font-mono"
                    placeholder="#000000"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => {
                      if (customColor) {
                        editor.chain().focus().setColor(customColor).run()
                        setCustomColor('')
                        setColorOpen(false)
                      }
                    }}
                  >
                    Apply
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs px-2"
                    title="Remove color"
                    onClick={() => {
                      editor.chain().focus().unsetColor().run()
                      setColorOpen(false)
                    }}
                  >
                    <Ban className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Text Highlight Button */}
            <Popover open={hlOpen} onOpenChange={setHlOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button relative"
                  title="Highlight color"
                >
                  <IconTextHighlight size={18} />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      left: 4,
                      right: 4,
                      height: 3,
                      borderRadius: 2,
                      backgroundColor:
                        currentHlColor === 'DEFAULT'
                          ? '#fde68a'
                          : currentHlColor,
                    }}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="rte-popover rte-cp w-60 p-3">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Highlight Color
                </p>
                <div className="grid grid-cols-7 gap-1.5 mb-3">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="rte-color__btn"
                      style={{ backgroundColor: c }}
                      data-active={c === currentHlColor || undefined}
                      onClick={() => {
                        editor.chain().focus().setHighlight({ color: c }).run()
                        setHlOpen(false)
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-end pt-2 border-t border-border">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => {
                      editor.chain().focus().unsetHighlight().run()
                      setHlOpen(false)
                    }}
                  >
                    Remove Highlight
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Divider */}
            <div className="rte-toolbar__divider bg-neutral-200 dark:bg-neutral-800" />

            {/* Text Align Popover */}
            <Popover open={alignOpen} onOpenChange={setAlignOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="rte-button rte-button--ghost rte-menu__button !px-1.5"
                  title="Text alignment"
                >
                  <AlignCurrentIcon className="h-4 w-4" />
                  <span className="rte-icon-arrow ml-0.5">
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="rte-popover w-auto p-1">
                <div className="rte-toolbar rte-toolbar--dense flex items-center gap-0.5">
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={
                      editor.isActive({ textAlign: 'left' }) || undefined
                    }
                    onClick={() => {
                      editor.chain().focus().setTextAlign('left').run()
                      setAlignOpen(false)
                    }}
                    title="Align Left"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={
                      editor.isActive({ textAlign: 'center' }) || undefined
                    }
                    onClick={() => {
                      editor.chain().focus().setTextAlign('center').run()
                      setAlignOpen(false)
                    }}
                    title="Align Center"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={
                      editor.isActive({ textAlign: 'right' }) || undefined
                    }
                    onClick={() => {
                      editor.chain().focus().setTextAlign('right').run()
                      setAlignOpen(false)
                    }}
                    title="Align Right"
                  >
                    <AlignRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={
                      editor.isActive({ textAlign: 'justify' }) || undefined
                    }
                    onClick={() => {
                      editor.chain().focus().setTextAlign('justify').run()
                      setAlignOpen(false)
                    }}
                    title="Justify"
                  >
                    <AlignJustify className="h-4 w-4" />
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Bullet List & Ordered List */}
            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              data-active={editor.isActive('bulletList') || undefined}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet list"
            >
              <List className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              data-active={editor.isActive('orderedList') || undefined}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered list"
            >
              <ListOrdered className="h-4 w-4" />
            </button>

            {/* Divider */}
            <div className="rte-toolbar__divider bg-neutral-200 dark:bg-neutral-800" />

            {/* Blockquote */}
            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              data-active={editor.isActive('blockquote') || undefined}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Blockquote"
            >
              <IconQuote size={18} />
            </button>

            {/* Link */}
            <Popover open={linkOpen} onOpenChange={setLinkOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                  data-active={editor.isActive('link') || undefined}
                  title="Insert Link"
                >
                  <Link2 className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="rte-popover w-72 p-3">
                <Label className="text-xs font-medium">Link URL</Label>
                <Input
                  className="mt-1 h-8 text-xs"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                />
                <div className="mt-2 flex gap-2 justify-end">
                  {editor.isActive('link') && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => {
                        editor.chain().focus().unsetLink().run()
                        setLinkOpen(false)
                      }}
                    >
                      Remove
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={insertLink}
                  >
                    Insert Link
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Image */}
            <Popover open={imageOpen} onOpenChange={setImageOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                  title="Insert Image"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="rte-popover w-72 p-3">
                <Label className="text-xs font-medium">Image URL</Label>
                <Input
                  className="mt-1 h-8 text-xs"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && insertImage()}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={insertImage}
                  >
                    Insert Image
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* YouTube */}
            <Popover open={youtubeOpen} onOpenChange={setYoutubeOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                  title="Embed YouTube Video"
                >
                  <IconYoutube size={18} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="rte-popover w-72 p-3">
                <Label className="text-xs font-medium">YouTube Video URL</Label>
                <Input
                  className="mt-1 h-8 text-xs"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && insertYoutube()}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={insertYoutube}
                  >
                    Embed Video
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Code Block */}
            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              data-active={editor.isActive('codeBlock') || undefined}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Code Block"
            >
              <Code2 className="h-4 w-4" />
            </button>

            {/* Table */}
            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              onClick={insertTable}
              title="Insert Table"
            >
              <TableIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── EDITOR CONTENT AREA ─────────────────────────────────────── */}
      <div
        className="rte-editor__container cursor-text"
        onClick={() => editor.chain().focus().run()}
        style={{
          minHeight: isFullScreen ? undefined : `${effectiveMinHeight}px`,
          maxHeight: contentMaxHeight
            ? typeof contentMaxHeight === 'number'
              ? `${contentMaxHeight}px`
              : contentMaxHeight
            : undefined,
        }}
      >
        <EditorContent
          editor={editor}
          className="rte-editor__content focus:outline-none [&_.ProseMirror]:outline-none"
        />
      </div>

      {/* ── STATUS BAR ──────────────────────────────────────────────── */}
      {!hideStatusBar && (
        <div className="rte-status-bar">
          <div className="rte-toolbar rte-toolbar--dense">
            <button
              type="button"
              className="rte-button rte-button--ghost rte-menu__button text-xs"
              data-active={isFullScreen || undefined}
              onClick={() => setIsFullScreen((prev) => !prev)}
              title="Fullscreen"
            >
              {isFullScreen ? (
                <Minimize className="h-4 w-4 mr-1" />
              ) : (
                <Maximize className="h-4 w-4 mr-1" />
              )}
              <span className="rte-button__text">Fullscreen</span>
            </button>
          </div>

          <div className="rte-counter">
            <span className="rte-word-count">Words: {words}</span>
            <span className="rte-charater">Characters: {chars}</span>
          </div>
        </div>
      )}
    </div>
  )
}
