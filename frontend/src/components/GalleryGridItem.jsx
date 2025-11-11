import React from 'react'
import ThermalPrint from './ThermalPrint'
import { formatDateTime } from '../helpers/formats'
import { getBaseUrl } from '../helpers/api'

export default function GalleryGridItem({ item, onClick, selected = false }) {
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick && onClick()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKey}
      aria-pressed={selected}
    >
      <ThermalPrint
        author={item.name || 'Unknown'}
        date={formatDateTime(item.created_at) || ''}
        imageSrc={getBaseUrl() + item.filename}
        caption={item.name || ''}
      />
      <p style={{ fontSize: 12, color: '#fff', marginTop: 8, textAlign: 'center' }}>
        {formatDateTime(item.created_at || '')}
      </p>
    </div>
  )
}
