import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DrawCanvas from '../components/DrawCanvas'
import SendForm from '../components/SendForm'
import { useI18n } from '../helpers/i18nContext'

export default function Draw() {
  const [mode, setMode] = useState('pencil') // 'pencil' or 'erase'
  const color = '#000000' // Fixed color we want only black drawings
  const [size, setSize] = useState(4)
  const canvasRef = useRef(null)
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', padding: 24 }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
        <button className="btn" onClick={() => navigate('/gallery')}>{t('draw.back')}</button>
      </div>

      <div className="controls" style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label>
          <input type="radio" checked={mode === 'pencil'} onChange={() => setMode('pencil')} /> {t('draw.pencil')}
        </label>
        <label>
          <input type="radio" checked={mode === 'erase'} onChange={() => setMode('erase')} /> {t('draw.erase')}
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {t('draw.size')}
          <input type="range" min={1} max={64} value={size} onChange={e => setSize(Number(e.target.value))} />
        </label>

        <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent('clear-canvas'))}>{t('draw.clear')}</button>
      </div>

      <div className="canvas-wrapper" style={{ width: '350px', height: '400px', display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <DrawCanvas ref={canvasRef} mode={mode} color={color} size={size} />
      </div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <SendForm canvasRef={canvasRef} className="form" />
      </div>
    </div>
  )
}
