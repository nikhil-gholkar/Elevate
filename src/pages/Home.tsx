import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, TextField, IconButton, List, ListItem,
  ListItemText, Checkbox, Tooltip, Chip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import LogoutIcon from '@mui/icons-material/Logout'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AssignmentIcon from '@mui/icons-material/Assignment'
import BoltIcon from '@mui/icons-material/Bolt'
import { useAuth } from '../AuthContext'
import { getTasksForDate, addTask, toggleTask, deleteTask, getAllTasks } from '../firebaseService'
import type { Task } from '../types'

export default function Home() {
  const { user, streak, logout } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [allTimeStats, setAllTimeStats] = useState({ total: 0, completed: 0 })

  const todayStr = new Date().toISOString().split('T')[0]
  const displayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  useEffect(() => {
    if (!user) return
    Promise.all([
      getTasksForDate(user.username, todayStr),
      getAllTasks(user.username)
    ]).then(([t, stats]) => {
      setTasks(t)
      setAllTimeStats(stats)
      setLoading(false)
    })
  }, [user])

  const handleAdd = async () => {
    if (!input.trim() || !user) return
    const task = await addTask(user.username, input.trim())
    setTasks(prev => [...prev, task])
    setAllTimeStats(prev => ({ ...prev, total: prev.total + 1 }))
    setInput('')
  }

  const handleToggle = async (task: Task) => {
    const nowCompleted = !task.completed
    await toggleTask(task.id, nowCompleted)
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: nowCompleted } : t))
    setAllTimeStats(prev => ({ ...prev, completed: prev.completed + (nowCompleted ? 1 : -1) }))
  }

  const handleDelete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    await deleteTask(taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
    setAllTimeStats(prev => ({
      total: prev.total - 1,
      completed: prev.completed - (task?.completed ? 1 : 0)
    }))
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const completed = tasks.filter(t => t.completed).length

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f0f0f', display: 'flex', justifyContent: 'center', pt: 4, px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Hey, {user?.username} 👋</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{displayDate}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Past days">
              <IconButton onClick={() => navigate('/history')} sx={{ color: 'text.secondary' }}>
                <CalendarMonthIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} sx={{ color: 'text.secondary' }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Streak */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 3, p: 2, mb: 2 }}>
          {streak > 0
            ? <LocalFireDepartmentIcon sx={{ color: '#ff6b35', fontSize: 36 }} />
            : <AcUnitIcon sx={{ color: '#64b5f6', fontSize: 36 }} />}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{streak} day streak</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {streak === 0 ? 'Start your streak today!' : streak >= 7 ? "You're on fire! 🔥" : 'Keep it going!'}
            </Typography>
          </Box>
        </Box>

        {/* Stats cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <Box sx={{ bgcolor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 3, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <AssignmentIcon sx={{ color: '#64b5f6', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Tasks</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{allTimeStats.total}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>created till date</Typography>
          </Box>
          <Box sx={{ bgcolor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 3, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <BoltIcon sx={{ color: '#7c6af7', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Productivity</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#7c6af7' }}>
              {allTimeStats.total === 0 ? '0' : Math.round((allTimeStats.completed / allTimeStats.total) * 100)}%
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{allTimeStats.completed}/{allTimeStats.total} completed</Typography>
          </Box>
        </Box>

        {/* Progress */}
        {tasks.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Chip label={`${completed}/${tasks.length} done`} size="small"
              color={completed === tasks.length ? 'success' : 'default'} variant="outlined" />
          </Box>
        )}

        {/* Add task */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth placeholder="Add a task for today..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#1a1a1a', borderRadius: 2, '& fieldset': { borderColor: '#2a2a2a' }, '&:hover fieldset': { borderColor: '#444' } } }}
          />
          <IconButton onClick={handleAdd} disabled={!input.trim()}
            sx={{ bgcolor: '#7c6af7', color: '#fff', borderRadius: 2, '&:hover': { bgcolor: '#6a58e0' }, '&:disabled': { bgcolor: '#2a2a2a' } }}>
            <AddIcon />
          </IconButton>
        </Box>

        {/* Task list */}
        {loading ? (
          <Typography sx={{ color: 'text.secondary', mt: 3 }}>Loading...</Typography>
        ) : tasks.length === 0 ? (
          <Typography sx={{ color: 'text.secondary', mt: 4, textAlign: 'center' }}>No tasks yet. Add one above ☝️</Typography>
        ) : (
          <List disablePadding sx={{ mt: 1 }}>
            {tasks.map(task => (
              <ListItem key={task.id} disablePadding
                sx={{ bgcolor: '#1a1a1a', borderRadius: 2, mb: 1, border: '1px solid #2a2a2a', pr: 1 }}>
                <Checkbox checked={task.completed} onChange={() => handleToggle(task)}
                  sx={{ color: '#555', '&.Mui-checked': { color: '#7c6af7' } }} />
                <ListItemText
                  primary={task.text}
                  sx={{ '& .MuiListItemText-primary': { textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#666' : '#eee' } }}
                />
                <IconButton size="small" onClick={() => handleDelete(task.id)}
                  sx={{ color: '#555', '&:hover': { color: '#f44336' } }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  )
}
