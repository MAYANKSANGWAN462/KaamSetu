// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )


// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import { BrowserRouter } from 'react-router-dom'
// import App from './App'
// import { AuthProvider } from './context/AuthContext'
// import { ThemeProvider } from './context/ThemeContext'
// import { LanguageProvider } from './context/LanguageContext'
// import "./styles/index.css";

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <AuthProvider>
//         <ThemeProvider>
//           <LanguageProvider>
//             <App />
//           </LanguageProvider>
//         </ThemeProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   </React.StrictMode>,
// )


// frontend/src/main.jsx
// Application entry point - sets up providers and mounts the app

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);