import { Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import CsharpProtoPage from './pages/CsharpProtoPage'
import DiffCheckerPage from './pages/DiffCheckerPage'
import EncoderPage from './pages/EncoderPage'
import HomePage from './pages/HomePage'
import JwtDecoderPage from './pages/JwtDecoderPage'
import JsonEscapePage from './pages/JsonEscapePage'
import JsonPage from './pages/JsonPage'
import PocoGeneratorPage from './pages/PocoGeneratorPage'
import YamlPage from './pages/YamlPage'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="json" element={<JsonPage />} />
        <Route path="json-escape" element={<JsonEscapePage />} />
        <Route path="yaml" element={<YamlPage />} />
        <Route path="csharp-proto" element={<CsharpProtoPage />} />
        <Route path="encoder" element={<EncoderPage />} />
        <Route path="diff-checker" element={<DiffCheckerPage />} />
        <Route path="json-to-csharp" element={<PocoGeneratorPage />} />
        <Route path="jwt-decoder" element={<JwtDecoderPage />} />
      </Route>
    </Routes>
  )
}
