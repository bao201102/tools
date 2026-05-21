import { Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import MainLayout from './layouts/MainLayout'

// Lazy loaded page components
const HomePage = lazy(() => import('./pages/HomePage'))
const JsonPage = lazy(() => import('./pages/JsonPage'))
const JsonEscapePage = lazy(() => import('./pages/JsonEscapePage'))
const JsonUnescapePage = lazy(() => import('./pages/JsonUnescapePage'))
const JsonToYamlPage = lazy(() => import('./pages/JsonToYamlPage'))
const CsharpProtoPage = lazy(() => import('./pages/CsharpProtoPage'))
const CsharpProtoRemovePage = lazy(() => import('./pages/CsharpProtoRemovePage'))
const EncoderPage = lazy(() => import('./pages/EncoderPage'))
const DiffCheckerPage = lazy(() => import('./pages/DiffCheckerPage'))
const PocoGeneratorPage = lazy(() => import('./pages/PocoGeneratorPage'))
const SqlToPocoPage = lazy(() => import('./pages/SqlToPocoPage'))
const JwtDecoderPage = lazy(() => import('./pages/JwtDecoderPage'))
const MarkdownPreviewPage = lazy(() => import('./pages/MarkdownPreviewPage'))

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-canvas text-ink-muted">
          <div className="text-sm font-medium animate-pulse">Loading page...</div>
        </div>
      }
    >
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="json" element={<JsonPage />} />
          <Route path="json-escape" element={<JsonEscapePage />} />
          <Route path="json-unescape" element={<JsonUnescapePage />} />
          <Route path="json-to-yaml" element={<JsonToYamlPage />} />
          <Route path="csharp-proto" element={<CsharpProtoPage />} />
          <Route path="csharp-proto-remove" element={<CsharpProtoRemovePage />} />
          <Route path="encoder" element={<EncoderPage />} />
          <Route path="diff-checker" element={<DiffCheckerPage />} />
          <Route path="json-to-csharp" element={<PocoGeneratorPage />} />
          <Route path="sql-to-csharp" element={<SqlToPocoPage />} />
          <Route path="jwt-decoder" element={<JwtDecoderPage />} />
          <Route path="markdown-preview" element={<MarkdownPreviewPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
