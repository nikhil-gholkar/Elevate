import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, TextField, Button, Typography, Alert, InputAdornment, IconButton, Divider } from '@mui/material'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import BoltIcon from '@mui/icons-material/Bolt'
import { loginUser } from '../firebaseService'
import { useAuth } from '../AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return setError('Please fill in all fields')
    setLoading(true)
    setError('')
    try {
      const user = await loginUser(username.trim(), password)
      if (!user) return setError('Invalid username or password')
      await login(user)
      navigate('/')
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={styles.root}>
      {/* Left panel — desktop only */}
      <Box sx={styles.leftPanel}>
        <Box sx={styles.brand}>
          <BoltIcon sx={{ fontSize: 40, color: '#7c6af7' }} />
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Elevate</Typography>
        </Box>
        <Box sx={{ mt: 'auto', mb: 'auto' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 2 }}>
            Your day,<br />your way.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 320 }}>
            Plan your tasks every morning, track your progress, and build streaks that keep you motivated.
          </Typography>
        </Box>
        <Box sx={styles.dots}>
          {[...Array(12)].map((_, i) => (
            <Box key={i} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: i < 3 ? '#7c6af7' : '#2a2a2a' }} />
          ))}
        </Box>
      </Box>

      {/* Right panel — form */}
      <Box sx={styles.rightPanel}>
        {/* Mobile brand */}
        <Box sx={styles.mobileBrand}>
          <BoltIcon sx={{ fontSize: 28, color: '#7c6af7' }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Elevate</Typography>
        </Box>

        <Box sx={styles.formBox}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Welcome back</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Sign in to continue your streak
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={e => setUsername(e.target.value)}
            sx={styles.field}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: '#555', fontSize: 20 }} />
                  </InputAdornment>
                )
              }
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            sx={styles.field}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#555', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(p => !p)} edge="end" size="small" sx={{ color: '#555' }}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleLogin}
            disabled={loading}
            sx={styles.submitBtn}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <Divider sx={{ my: 2.5, borderColor: '#2a2a2a' }}>
            <Typography variant="caption" sx={{ color: '#555', px: 1 }}>OR</Typography>
          </Divider>

          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#7c6af7', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

const fieldSx = {
  mb: 2,
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#111',
    '& fieldset': { borderColor: '#2a2a2a' },
    '&:hover fieldset': { borderColor: '#444' },
    '&.Mui-focused fieldset': { borderColor: '#7c6af7' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#7c6af7' }
}

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    bgcolor: '#0f0f0f',
  },
  leftPanel: {
    display: { xs: 'none', md: 'flex' },
    flexDirection: 'column',
    width: '45%',
    p: 6,
    bgcolor: '#111',
    borderRight: '1px solid #1e1e1e',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  dots: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap',
    maxWidth: 120,
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    p: { xs: 3, sm: 6 },
  },
  mobileBrand: {
    display: { xs: 'flex', md: 'none' },
    alignItems: 'center',
    gap: 1,
    mb: 4,
  },
  formBox: {
    width: '100%',
    maxWidth: 400,
  },
  field: fieldSx,
  submitBtn: {
    mt: 1,
    py: 1.5,
    borderRadius: 2,
    fontWeight: 700,
    fontSize: '1rem',
    bgcolor: '#7c6af7',
    '&:hover': { bgcolor: '#6a58e0' },
    '&:disabled': { bgcolor: '#2a2a2a', color: '#555' },
  }
}
