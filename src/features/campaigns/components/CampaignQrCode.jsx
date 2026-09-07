import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Download, Loader2, QrCode } from 'lucide-react'

export function CampaignQrCode({ url, fileName = 'campaign-qr-code.png' }) {
  const [dataUrl, setDataUrl] = useState(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(url, { width: 512, margin: 2 })
      .then((result) => { if (!cancelled) setDataUrl(result) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [url])

  function handleDownload() {
    if (!dataUrl) return
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = fileName
    link.click()
  }

  return (
    <div className="border rounded-xl p-4 bg-card flex items-center gap-4">
      <div className="w-16 h-16 rounded-lg border bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
        {dataUrl ? <img src={dataUrl} alt="Campaign QR code" className="w-full h-full object-contain" /> : <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold flex items-center gap-1.5"><QrCode className="w-4 h-4" /> QR Code</p>
        <p className="text-xs text-muted-foreground mt-0.5">Scan to open your campaign, or download to print or share.</p>
      </div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={!dataUrl}
        className="inline-flex items-center gap-1.5 text-xs border font-medium px-3 py-1.5 rounded-full hover:bg-accent transition-colors disabled:opacity-50 flex-shrink-0"
      >
        <Download className="w-3.5 h-3.5" /> Download
      </button>
    </div>
  )
}
