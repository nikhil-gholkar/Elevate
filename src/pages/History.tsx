import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, List, ListItem, ListItemText,
  IconButton, Chip, Divider
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { useAuth } from '../AuthContext'
import { getTasksForDate } from '../firebaseService'
import type { Task } from '../types'

function getPastDates(days = 30): string[] {
  const dates: string[] = []
  for (let i = 1; i <= days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export default function History() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const pastDates = getPastDates()

  useEffect(() => {
    if (!selectedDate || !user) return
    setLoadingTasks(true)
    getTasksForDate(user.username, selectedDate).then(t => {
      setTasks(t)
      setLoadingTasks(false)
    })
  }, [selectedDate])

  const formatDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f0f0f', display: 'flex', justifyContent: 'center', pt: 4, px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 560 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <IconButton onClick={() => navigate('/')} sx={{ color: 'text.secondary' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Past Days</Typography>
        </Box>

        {!selectedDate ? (
          <List disablePadding>
            {pastDates.map((date, i) => (
              <Box key={date}>
                <ListItem
                  onClick={() => setSelectedDate(date)}
                  sx={{ bgcolor: '#1a1a1a', borderRadius: 2, mb: 0.5, cursor: 'pointer', '&:hover': { bgcolor: '#222' } }}>
                  <ListItemText primary={formatDate(date)} sx={{ '& .MuiListItemText-primary': { fontWeight: 500 } }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>View →</Typography>
                </ListItem>
                {i < pastDates.length - 1 && <Divider sx={{ borderColor: '#2a2a2a' }} />}
              </Box>
            ))}
          </List>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <IconButton size="small" onClick={() => setSelectedDate(null)} sx={{ color: 'text.secondary' }}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{formatDate(selectedDate)}</Typography>
              {tasks.length > 0 && (
                <Chip label={`${tasks.filter(t => t.completed).length}/${tasks.length}`} size="small" variant="outlined" />
              )}
            </Box>

            {loadingTasks ? (
              <Typography sx={{ color: 'text.secondary' }}>Loading...</Typography>
            ) : tasks.length === 0 ? (
              <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 4 }}>No tasks on this day</Typography>
            ) : (
              <List disablePadding>
                {tasks.map(task => (
                  <ListItem key={task.id} disablePadding
                    sx={{ bgcolor: '#1a1a1a', borderRadius: 2, mb: 1, border: '1px solid #2a2a2a', px: 2, py: 1 }}>
                    {task.completed
                      ? <CheckCircleIcon sx={{ color: '#7c6af7', mr: 1.5, flexShrink: 0 }} />
                      : <RadioButtonUncheckedIcon sx={{ color: '#555', mr: 1.5, flexShrink: 0 }} />}
                    <ListItemText
                      primary={task.text}
                      sx={{ '& .MuiListItemText-primary': { textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#666' : '#eee' } }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
