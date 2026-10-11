import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { ContentProvider } from './context/ContentContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import Articles from './pages/Articles'
import ArticleDetail from './pages/ArticleDetail'
import Contact from './pages/Contact'
import { Privacy, Terms } from './pages/Legal'
import NotFound from './pages/NotFound'

// The admin panel is loaded only when /admin is opened, so visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function App() {
  return (
    <LanguageProvider>
      <ContentProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/admin/*"
              element={
                <Suspense fallback={null}>
                  <AdminApp />
                </Suspense>
              }
            />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/maqolalar" element={<Articles />} />
              <Route path="/maqolalar/:slug" element={<ArticleDetail />} />
              <Route path="/himoya-ishlari" element={<Cases />} />
              <Route path="/himoya-ishlari/:slug" element={<CaseDetail />} />
              <Route path="/sud-ishlari" element={<Navigate to="/himoya-ishlari" replace />} />
              <Route path="/haqida" element={<About />} />
              <Route path="/xizmatlar" element={<Services />} />
              <Route path="/aloqa" element={<Contact />} />
              <Route path="/maxfiylik" element={<Privacy />} />
              <Route path="/foydalanish-shartlari" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ContentProvider>
    </LanguageProvider>
  )
}
