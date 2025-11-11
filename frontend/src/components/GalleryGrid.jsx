import { useEffect, useRef, useState, useCallback } from 'react'
import { getGallery } from '../helpers/api'
import { useNavigate } from 'react-router-dom'
import GalleryGridItem from './GalleryGridItem'

export default function GalleryGrid({ pageSize = 12 }) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef(null)
  const fetchedPages = useRef(new Set())

  const fetchPage = useCallback(async (p) => {
    // avoid fetching the same page multiple times (React strict mode double mount)
    if (fetchedPages.current.has(p)) return
    setLoading(true)
    try {
      const json = await getGallery(p, pageSize)
      // expect { items: [...], hasMore: boolean }
      setItems(prev => {
        const existingIds = new Set(prev.map(i => i.id))
        const toAdd = (json.items || []).filter(i => !existingIds.has(i.id))
        return [...prev, ...toAdd]
      })
      // mark page as fetched so we don't double-fetch
      fetchedPages.current.add(p)
      setHasMore(Boolean(json.hasMore))
    } catch (err) {
      console.error('Failed to load gallery page', err)
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  useEffect(() => { fetchPage(page) }, [fetchPage, page])

  useEffect(() => {
    if (!loaderRef.current) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        setPage(p => p + 1)
      }
    }, { rootMargin: '300px' })
    obs.observe(loaderRef.current)
    return () => obs.disconnect()
  }, [loading, hasMore])

  const navigate = useNavigate()

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 10.6vw)', gap: 24 }}>
        {items.map(item => (
          <GalleryGridItem key={item.id} item={item}
            onClick={() => navigate(`/gallery/${item.id}`, { state: { item } })}
          />
        ))}
      </div>

      <div ref={loaderRef} style={{ height: 1 }} />
      <div style={{ padding: 12, textAlign: 'center' }}>
        {loading && 'Loading...'}
        {!loading && hasMore && (
          <button className="btn" onClick={() => setPage(p => p + 1)}>Load more</button>
        )}
        {!hasMore && 'No more images'}
      </div>
    </div>
  )
}
