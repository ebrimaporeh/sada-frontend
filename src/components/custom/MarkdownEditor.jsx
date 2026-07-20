import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Eye, Code, Bold, Italic, Heading2, List, Link2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { renderLegalVariables } from '@/utils/legalVariables'

// `variables`, when passed, is [{key, label, value}] — feeds both the
// "Insert variable" picker below and the live preview's substitution, so
// what an admin sees in Preview matches what donors will actually see.
export function MarkdownEditor({ value, onChange, placeholder = 'Write your content here...', variables }) {
  const [mode, setMode] = useState('edit')
  const textareaRef = useRef()

  const insertMarkdown = (before, after = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end) || 'text'
    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange({ target: { value: newValue } })
  }

  const insertText = (text) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue = value.substring(0, start) + text + value.substring(end)

    onChange({ target: { value: newValue } })
    requestAnimationFrame(() => {
      textarea.focus()
      const cursor = start + text.length
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  const formatOptions = [
    { icon: Bold, label: 'Bold', onClick: () => insertMarkdown('**', '**'), tooltip: 'Bold (Ctrl+B)' },
    { icon: Italic, label: 'Italic', onClick: () => insertMarkdown('*', '*'), tooltip: 'Italic (Ctrl+I)' },
    { icon: Heading2, label: 'Heading', onClick: () => insertMarkdown('## ', ''), tooltip: 'Heading' },
    { icon: List, label: 'List', onClick: () => insertMarkdown('- ', ''), tooltip: 'Bullet list' },
    { icon: Link2, label: 'Link', onClick: () => insertMarkdown('[', '](url)'), tooltip: 'Link' },
  ]

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 border-b pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors rounded-lg',
              mode === 'edit'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Code className="w-4 h-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors rounded-lg',
              mode === 'preview'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        {mode === 'edit' && (
          <div className="flex items-center gap-1 flex-wrap w-full sm:w-auto sm:ml-auto">
            {formatOptions.map(({ icon: Icon, onClick, tooltip }) => (
              <button
                key={tooltip}
                type="button"
                onClick={onClick}
                title={tooltip}
                className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
            {variables && variables.length > 0 && (
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) insertText(e.target.value)
                  e.target.value = ''
                }}
                title="Insert a variable that stays up to date with its live value"
                className="text-xs border rounded-lg pl-2 pr-1 py-1.5 bg-background text-muted-foreground hover:text-foreground ml-1"
              >
                <option value="">Insert variable…</option>
                {variables.map((v) => (
                  <option key={v.key} value={`{{${v.key}}}`}>
                    {v.label}{v.value ? ` — ${v.value}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {mode === 'edit' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e)}
          placeholder={placeholder}
          rows={10}
          className="w-full px-4 py-3 border rounded-xl text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring resize-vertical font-mono"
        />
      ) : (
        <div className="border rounded-xl p-4 min-h-[300px] bg-background">
          <MarkdownContent
            content={variables ? renderLegalVariables(value, Object.fromEntries(variables.map((v) => [v.key, v.value]))) : value}
          />
        </div>
      )}
    </div>
  )
}

// There's no @tailwindcss/typography plugin in this project, so markdown
// elements need their own Tailwind classes rather than relying on a
// `prose` wrapper (which would otherwise be a silent no-op).
const MARKDOWN_COMPONENTS = {
  h1: (props) => <h1 className="text-2xl font-bold mt-6 mb-3 first:mt-0" {...props} />,
  h2: (props) => <h2 className="text-xl font-bold mt-6 mb-3 first:mt-0" {...props} />,
  h3: (props) => <h3 className="text-lg font-bold mt-4 mb-2 first:mt-0" {...props} />,
  p: (props) => <p className="mb-3 last:mb-0 text-foreground/90 leading-relaxed" {...props} />,
  ul: (props) => <ul className="list-disc pl-5 mb-3 space-y-1 text-foreground/90" {...props} />,
  ol: (props) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-foreground/90" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
  a: (props) => <a target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" {...props} />,
}

// Renders markdown to actual React elements (not dangerouslySetInnerHTML) —
// safer, and correctly handles everything CommonMark supports (bullet/
// numbered lists, nested formatting, etc.) that the old regex-based parser
// silently dropped.
export function MarkdownContent({ content }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown components={MARKDOWN_COMPONENTS}>{content}</ReactMarkdown>
    </div>
  )
}
