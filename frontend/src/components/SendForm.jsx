import { useState, useEffect } from 'react'
import { submitDrawing } from '../helpers/api'
import { useI18n } from '../helpers/i18nContext'

export default function SendForm({ canvasRef, className }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [social, setSocial] = useState('')
  const [sending, setSending] = useState(false)
  // legacy inline message removed in favor of toast
  const [toast, setToast] = useState(null)
  const [canSubmit, setCanSubmit] = useState(true)
  const { t } = useI18n()

  useEffect(() => {
    function onCanvasChanged() {
      const blank = canvasRef?.current?.isBlank ? canvasRef.current.isBlank() : false
      setCanSubmit(!blank)
    }
    // initial check
    onCanvasChanged()
    window.addEventListener('canvas-changed', onCanvasChanged)
    return () => window.removeEventListener('canvas-changed', onCanvasChanged)
  }, [canvasRef])

  async function makeWhiteBackedDataUrl(srcDataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const out = document.createElement('canvas')
        out.width = img.naturalWidth
        out.height = img.naturalHeight
        const ctx = out.getContext('2d')
        // white background
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, out.width, out.height)
        ctx.drawImage(img, 0, 0)
        resolve(out.toDataURL('image/png'))
      }
      img.onerror = reject
      img.src = srcDataUrl
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    // clear any inline message state (we use toast now)

    try {
      const srcData = canvasRef?.current?.getDataURL()
      if (!srcData) throw new Error('No canvas data')

      const dataUrl = await makeWhiteBackedDataUrl(srcData)
      const payload = { name, email, social, image: dataUrl }
      await submitDrawing(payload)

      setToast(t('form.success'))
      setName('')
      setEmail('')
      setSocial('')

      // clear canvas via event
      window.dispatchEvent(new CustomEvent('clear-canvas'))

      // auto-dismiss toast
      setTimeout(() => setToast(null), 2500)
    } catch (err) {
      setToast(t('form.failed') + ' ' + (err.message || err))
      setTimeout(() => setToast(null), 4000)
    } finally {
      setSending(false)
    }
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <input placeholder={t('form.name')} value={name} onChange={e => setName(e.target.value)} required />
      <input placeholder={t('form.email')} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input placeholder={t('form.social')} value={social} onChange={e => setSocial(e.target.value)} />
      <button className="btn" type="submit" disabled={sending || !canSubmit}>{sending ? t('form.sending') : t('form.send')}</button>
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, background: '#111', color: '#fff', padding: '8px 12px', borderRadius: 6, boxShadow: '0 6px 18px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </form>
  )
}
