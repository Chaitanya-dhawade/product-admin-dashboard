import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProductStoreProvider } from './context/ProductStoreContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductStoreProvider>
          <App />
        </ProductStoreProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
