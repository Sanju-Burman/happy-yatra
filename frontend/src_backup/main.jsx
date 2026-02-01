import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SurveyProvider } from './context/SurveyContext.jsx'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SurveyProvider>
      <App>
        <ToastContainer position="top-center" autoClose={3000} />
      </App>
    </SurveyProvider>
  </StrictMode>,
)
