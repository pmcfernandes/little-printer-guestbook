import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getBaseUrl,  getGalleryById } from '../helpers/api'
import ThermalPrinter from '../components/ThermalPrint'
import { formatDateTime } from '../helpers/formats'
import { useI18n } from '../helpers/i18nContext'

export default function GalleryDetail() {
  const { id } = useParams()
  const loc = useLocation()
  const navigate = useNavigate()
  const [item, setItem] = useState(loc.state?.item || null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (item) return
    let mounted = true
    const fetchOne = async () => {
      setLoading(true)
      try {
        const res = await getGalleryById(id)
        if (mounted) setItem(res)
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchOne()
    return () => { mounted = false }
  }, [id, item])

  const { t } = useI18n()

  if (loading) return <div>{t('gallery.loading')}</div>
  if (!item) return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
      <button className="btn" onClick={() => navigate('/gallery')}>{`← ${t('draw.back')}`}</button>
    </div>
  )

  const src = getBaseUrl() + (item.filename || '')

  return (
    <>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: 12, padding: 24 }}>
        <button className="btn" onClick={() => navigate('/gallery')}>{t('draw.back')}</button>
      </div>

      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <h2>A fabulous drawing by {item.name || 'Untitled'}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <ThermalPrinter
            author={item.name || 'Unknown'}
            date={formatDateTime(item.created_at) || ''}
            imageSrc={src}
            caption={item.name || ''}
          />
        </div>

        <button
          className="btn"
          style={{ padding: '12px 18px', fontSize: 16 }}
          onClick={() => navigate('/draw')}
        >
          🖨️ {t('gallery.cta')}
        </button>
      </div>
    </>
  )
}
