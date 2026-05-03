import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, TextField, Button, Typography, Alert } from '@mui/material'
import { usernameExists, registerUser, loginUser } from '../firebaseService'
import { useAuth } from '../AuthContext'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) return setError('Fill all fields')
    setLoading(true)
    setError('')
    try {
      const exists = await usernameExists(username.trim())
      if (exists) return setError('Username already taken')
      await registerUser(username.trim(), password)
      const user = await loginUser(username.trim(), password)
      if (user) {
        await login(user)
        navigate('/')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f0f0f' }}>
      <Box sx={{ bgcolor: '#1a1a1a', p: 4, borderRadius: 3, width: '100%', maxWidth: 400, border: '1px solid #2a2a2a' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Elevate</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Create your account</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField label="Username" fullWidth value={username} onChange={e => setUsername(e.target.value)} sx={{ mb: 2 }} />
        <TextField label="Password" type="password" fullWidth value={password} onChange={e => setPassword(e.target.value)} sx={{ mb: 3 }} />
        <Button variant="contained" fullWidth size="large" onClick={handleRegister} disabled={loading}>
          {loading ? 'Creating...' : 'Get Started'}
        </Button>
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'inherit' }}>Sign in</Link>
        </Typography>
      </Box>
    </Box>
  )
}
