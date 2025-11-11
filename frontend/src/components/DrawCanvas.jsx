import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

const DrawCanvas = forwardRef(function DrawCanvas({ mode = 'pencil', color = '#000', size = 4 }, ref) {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const lastPoint = useRef({ x: 0, y: 0 })

  // refs to hold the latest props so we don't need to re-init canvas on prop changes
  const modeRef = useRef(mode)
  const colorRef = useRef(color)
  const sizeRef = useRef(size)

  // keep refs up to date when props change
  useEffect(() => {
    modeRef.current = mode
    colorRef.current = color
    sizeRef.current = size
  }, [mode, color, size])

  // expose imperative API to parent via ref
  useImperativeHandle(ref, () => ({
    getDataURL: (type = 'image/png') => {
      const canvas = canvasRef.current
      if (!canvas) return null
      return canvas.toDataURL(type)
    }
    ,
    isBlank: () => {
      const canvas = canvasRef.current
      if (!canvas) return true
      try {
        const ctx = canvas.getContext('2d')
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        for (let i = 0; i < data.length; i += 4) {
          // if any pixel is not white (255,255,255) or not fully opaque, consider non-blank
          if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255 || data[i + 3] !== 255) {
            return false
          }
        }
        return true
      } catch {
        return false
      }
    }
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let currentDpr = window.devicePixelRatio || 1

    function setSizeToContainer() {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      currentDpr = dpr
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      // use setTransform to avoid cumulative scaling
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      // fill white background
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, rect.width, rect.height)
    }

    // Initialize canvas size
    setSizeToContainer()

    // Resize on window changes (try ResizeObserver, fallback to window resize)
    let resizeObserver
    try {
      resizeObserver = new ResizeObserver(() => {
        // Save contents
        const img = new Image()
        img.src = canvas.toDataURL()
        img.onload = () => {
          const rect = canvas.getBoundingClientRect()
          setSizeToContainer()
          // fill white background then draw previous image scaled to CSS pixels
          ctx.fillStyle = '#fff'
          ctx.fillRect(0, 0, rect.width, rect.height)
          const dpr = currentDpr
          ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr)
        }
      })
      resizeObserver.observe(canvas)
    } catch {
      window.addEventListener('resize', setSizeToContainer)
    }

    function getPointFromEvent(e) {
      const rect = canvas.getBoundingClientRect()
      const clientX = e.clientX ?? (e.touches && e.touches[0].clientX)
      const clientY = e.clientY ?? (e.touches && e.touches[0].clientY)
      return { x: clientX - rect.left, y: clientY - rect.top }
    }

    function pointerDown(e) {
      isDrawing.current = true
      const p = getPointFromEvent(e)
      lastPoint.current = p
    }

    function pointerMove(e) {
      if (!isDrawing.current) return
      const p = getPointFromEvent(e)
      ctx.save()
      ctx.lineWidth = sizeRef.current
      if (modeRef.current === 'erase') {
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = '#fff'
      } else {
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = colorRef.current
      }
      ctx.beginPath()
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
      ctx.restore()
      lastPoint.current = p
    }

    function pointerUp() {
      isDrawing.current = false
      // notify listeners the canvas was updated
      try { window.dispatchEvent(new CustomEvent('canvas-changed')) } catch { /* ignore */ }
    }

    canvas.addEventListener('pointerdown', pointerDown)
    window.addEventListener('pointermove', pointerMove)
    window.addEventListener('pointerup', pointerUp)

    const clearHandler = () => {
      const rect = canvas.getBoundingClientRect()
      // fill with white to reset to white background
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, rect.width, rect.height)
      // notify listeners that canvas was cleared
      try { window.dispatchEvent(new CustomEvent('canvas-changed')) } catch { /* ignore */ }
    }

    const downloadHandler = () => {
      // create offscreen canvas with white background and draw current canvas onto it
      const out = document.createElement('canvas')
      out.width = canvas.width
      out.height = canvas.height
      const outCtx = out.getContext('2d')
      // fill white full pixel area
      outCtx.fillStyle = '#fff'
      outCtx.fillRect(0, 0, out.width, out.height)
      // draw the current canvas (pixel-for-pixel)
      outCtx.drawImage(canvas, 0, 0)

      const link = document.createElement('a')
      link.download = 'drawing.png'
      link.href = out.toDataURL('image/png')
      link.click()
    }

    window.addEventListener('clear-canvas', clearHandler)
    window.addEventListener('download-canvas', downloadHandler)

    return () => {
      canvas.removeEventListener('pointerdown', pointerDown)
      window.removeEventListener('pointermove', pointerMove)
      window.removeEventListener('pointerup', pointerUp)
      window.removeEventListener('clear-canvas', clearHandler)
      window.removeEventListener('download-canvas', downloadHandler)
      if (resizeObserver) resizeObserver.disconnect()
      else window.removeEventListener('resize', setSizeToContainer)
    }
  }, [])

  // Basic inline styling to give the canvas a fixed height area
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
})

export default DrawCanvas
