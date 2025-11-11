import GalleryGrid from '../components/GalleryGrid'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../helpers/i18nContext'

export default function Gallery() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <img src="/images/printer.png" alt="Gallery" style={{ maxWidth: '280px', height: 'auto', marginBottom: 12, filter: "invert(100%) hue-rotate(140deg) grayscale(0.8) brightness(1.1)" }} />
        <h3>{t('gallery.description')}</h3>
        <button
          className="btn"
          style={{ padding: '12px 18px', fontSize: 16 }}
          onClick={() => navigate('/draw')}
        >
          🖨️ {t('gallery.cta')}
        </button>
      </div>

      <h2>{t('gallery.submitted')}</h2>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <GalleryGrid />
      </div>

    </div>
  )
}
