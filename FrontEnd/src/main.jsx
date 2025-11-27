import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import { ReservationProvider } from './components/reservations/ReservationProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <ReservationProvider>
      <App />
      <Toaster position="top-right"/>
    </ReservationProvider>
  </StrictMode>

)
