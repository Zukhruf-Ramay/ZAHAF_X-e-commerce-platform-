import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.error('Missing Clerk Publishable Key')
}

// Error boundary for Clerk
const clerkAppearance = {
  elements: {
    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    card: 'shadow-lg rounded-xl',
    headerTitle: 'text-2xl font-bold text-gray-800',
    socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
  },
  variables: {
    colorPrimary: '#3b82f6',
    borderRadius: '0.5rem',
  },
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      appearance={clerkAppearance}
      // Add fallback redirect URL on error
      navigate={(to) => {
        if (to.includes('error')) {
          window.location.href = '/login'
        } else {
          window.location.href = to
        }
      }}
    >
      <App />
      <ToastContainer position="top-right" autoClose={3000} />
    </ClerkProvider>
  </StrictMode>,
)