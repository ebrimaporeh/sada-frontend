import { useEffect, useRef, useState } from 'react'
import { Share2, Facebook, Twitter, MessageCircle, Mail, Link as LinkIcon, Check } from 'lucide-react'
import { cn } from '@/utils/cn'

const PLATFORMS = [
  {
    label: 'Facebook',
    icon: Facebook,
    className: 'text-[#1877F2] bg-[#1877F2]/10',
    buildHref: ({ url }) => `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  },
  {
    label: 'Twitter',
    icon: Twitter,
    className: 'text-foreground bg-muted',
    buildHref: ({ url, text }) => `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
  },
  {
    label: 'WhatsApp',
    icon: MessageCircle,
    className: 'text-[#25D366] bg-[#25D366]/10',
    buildHref: ({ url, text }) => `https://wa.me/?text=${text}%20${url}`,
  },
  {
    label: 'Email',
    icon: Mail,
    className: 'text-muted-foreground bg-muted',
    buildHref: ({ url, text, subject }) => `mailto:?subject=${subject}&body=${text}%20${url}`,
  },
]

export function ShareCampaign({ title, url, className, buttonClassName, buttonLabel = 'Share' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const shareText = `Support "${title}" on GambiaFund`
  const shareParams = {
    url: encodeURIComponent(url),
    text: encodeURIComponent(shareText),
    subject: encodeURIComponent(shareText),
  }

  function handleCopy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={buttonClassName || 'w-full flex items-center justify-center gap-2 border rounded-lg py-2.5 text-sm font-medium hover:bg-accent transition-colors'}
      >
        <Share2 className="w-4 h-4" /> {buttonLabel}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-card border rounded-xl shadow-lg z-50 p-3 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground px-1">Share this campaign</p>

          <div className="grid grid-cols-4 gap-2">
            {PLATFORMS.map(({ label, icon: Icon, className: iconClassName, buildHref }) => (
              <a
                key={label}
                href={buildHref(shareParams)}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                className="flex flex-col items-center gap-1.5"
              >
                <span className={cn('w-10 h-10 rounded-full flex items-center justify-center', iconClassName)}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <LinkIcon className="w-4 h-4" />}
            {copied ? 'Link copied!' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  )
}
