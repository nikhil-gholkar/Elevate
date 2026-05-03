import {
  collection, doc, getDoc, getDocs, setDoc, addDoc,
  updateDoc, deleteDoc, query, where
} from 'firebase/firestore'
import { db } from './firebase'
import type { User, Task } from './types'

const today = () => new Date().toISOString().split('T')[0]

export async function usernameExists(username: string): Promise<boolean> {
  const ref = doc(db, 'users', username)
  const snap = await getDoc(ref)
  return snap.exists()
}

export async function registerUser(username: string, password: string): Promise<void> {
  const ref = doc(db, 'users', username)
  const user: User = { username, password, createdAt: today(), streak: 0, lastActiveDate: '' }
  await setDoc(ref, user)
}

export async function loginUser(username: string, password: string): Promise<User | null> {
  const ref = doc(db, 'users', username)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const user = snap.data() as User
  if (user.password !== password) return null
  return user
}

export async function getTasksForDate(username: string, date: string): Promise<Task[]> {
  const q = query(collection(db, 'tasks'), where('username', '==', username), where('date', '==', date))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Task))
}

export async function getAllTasks(username: string): Promise<{ total: number; completed: number }> {
  const q = query(collection(db, 'tasks'), where('username', '==', username))
  const snap = await getDocs(q)
  const total = snap.size
  const completed = snap.docs.filter(d => d.data().completed).length
  return { total, completed }
}

export async function addTask(username: string, text: string): Promise<Task> {
  const task = { text, completed: false, date: today(), username }
  const ref = await addDoc(collection(db, 'tasks'), task)
  return { id: ref.id, ...task }
}

export async function toggleTask(taskId: string, completed: boolean): Promise<void> {
  await updateDoc(doc(db, 'tasks', taskId), { completed })
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, 'tasks', taskId))
}

export async function updateStreak(username: string): Promise<number> {
  const ref = doc(db, 'users', username)
  const snap = await getDoc(ref)
  const user = snap.data() as User
  const todayStr = today()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let newStreak = user.streak
  if (user.lastActiveDate === yesterdayStr) {
    newStreak = user.streak + 1
  } else if (user.lastActiveDate !== todayStr) {
    newStreak = 1
  }

  await updateDoc(ref, { streak: newStreak, lastActiveDate: todayStr })
  return newStreak
}
