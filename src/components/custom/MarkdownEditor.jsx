import { useState, useRef } from 'react'
import { Eye, Code, Bold, Italic, Heading2, List, Link2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export function MarkdownEditor({ value, onChange, placeholder = 'Write your content here...' }) {
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
          className="w-full px-4 py-3 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-vertical font-mono"
        />
      ) : (
        <div className="border rounded-xl p-4 min-h-[300px] bg-background prose prose-sm max-w-none">
          <MarkdownContent content={value} />
        </div>
      )}
    </div>
  )
}

export function MarkdownContent({ content }) {
  const parseMarkdown = (text) => {
    if (!text) return ''

    let html = text
      // Headings
      .replace(/^### (.*?)$/gm, '<h3 className="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2 className="text-xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1 className="text-2xl font-bold mt-6 mb-3">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" className="text-primary hover:underline" target="_blank" rel="noopener">$1</a>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />')

    return `<p>${html}</p>`
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <div
        dangerouslySetInnerHTML={{
          __html: parseMarkdown(content)
            .replace(/<p><\/p>/g, '')
            .replace(/^<p>/, '')
            .replace(/<\/p>$/, ''),
        }}
        className="space-y-3 leading-relaxed text-foreground/90"
      />
    </div>
  )
}
