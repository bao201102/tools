import { Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import CsharpProtoPage from './pages/CsharpProtoPage'
import EncoderPage from './pages/EncoderPage'
import HomePage from './pages/HomePage'
import JsonPage from './pages/JsonPage'
import YamlPage from './pages/YamlPage'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="json" element={<JsonPage />} />
        <Route path="yaml" element={<YamlPage />} />
        <Route path="csharp-proto" element={<CsharpProtoPage />} />
        <Route path="encoder" element={<EncoderPage />} />
      </Route>
    </Routes>
  )
}
