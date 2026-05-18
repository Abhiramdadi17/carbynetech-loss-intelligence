import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import FactoryLoss from './pages/FactoryLoss'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/loss-intelligence" element={<FactoryLoss />} />
        <Route path="/" element={<Navigate to="/loss-intelligence" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
