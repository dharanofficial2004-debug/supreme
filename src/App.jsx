import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import GenerateQR from './pages/GenerateQR'
import Attendee from './pages/Attendee'
import Layout from './components/Layout'
import ErrorPage from './pages/ErrorPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Instantly redirect from root to the dashboard instead of Home page */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="generate" element={<GenerateQR />} />
        <Route path="attendee" element={<Attendee />} />
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Routes>
  )
}

export default App
