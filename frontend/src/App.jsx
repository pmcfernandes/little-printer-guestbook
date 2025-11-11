
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Draw from './pages/Draw'
import Gallery from './pages/Gallery'
import GalleryDetail from './pages/GalleryDetail'
import { I18nProvider } from './helpers/i18n'
import { useI18n } from './helpers/i18nContext'

function AppInner() {
  const { t, lang, setLang } = useI18n()

  return (
    <BrowserRouter>
      <div style={{fontFamily: 'system-ui, sans-serif'}}>
        <header style={{display: 'flex', gap: 12, padding: 12, alignItems: 'center', borderBottom: '1px solid #eee'}}>
          <h1 style={{margin: 0, fontSize: 18}}>{t('title')}</h1>
          <nav style={{marginLeft: 12}}>
            <Link to="/" style={{marginRight: 8}}>{t('nav.gallery')}</Link>
            <Link to="/draw" style={{marginRight: 8}}>{t('nav.draw')}</Link>
          </nav>

          <div style={{marginLeft: 'auto', display: 'flex', gap: 8}}>
            <button className="btn" onClick={() => setLang('en')} aria-pressed={lang === 'en'}>EN</button>
            <button className="btn" onClick={() => setLang('pt')} aria-pressed={lang === 'pt'}>PT</button>
          </div>
        </header>

        <main style={{padding: 12}}>
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/draw" element={<Draw />} />
            <Route path="/gallery/:id" element={<GalleryDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function App() {
  return (
    <I18nProvider>
      <AppInner />
    </I18nProvider>
  )
}

export default App
