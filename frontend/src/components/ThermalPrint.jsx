import React from 'react'
import '../styles/ThermalPrint.css'

export default function ThermalPrint({ author = 'Unknown', date = '', imageSrc }) {
  return (
    <div className="thermal-root">
      <div className="thermal-paper">
        <div className="thermal-header">
          <div className="thermal-label">From:</div>
          <div className="thermal-value">{author}</div>
        </div>
        <div className="thermal-header small">
          <div className="thermal-label">At:</div>
          <div className="thermal-value">{date}</div>
        </div>

        <div className="thermal-sep" />

        <div className="thermal-image-wrap">
          {imageSrc ? (
            <img src={imageSrc} alt={author || 'print'} className="thermal-image" />
          ) : (
            <div className="thermal-image placeholder" />
          )}
        </div>
      </div>
    </div>
  )
}
