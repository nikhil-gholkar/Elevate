import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import { AuthProvider, useAuth } from './AuthContext'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home'
import History from './pages/History'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7c6af7' },
    background: { default: '#0f0f0f', paper: '#1a1a1a' }
  },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif' }
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
