import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import styles from './Login.module.css'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmar: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      await api.post('auth/register/', {
        username: form.username,
        email: form.email,
        password: form.password,
      })
      navigate('/login', { state: { mensaje: '¡Registro exitoso! Ya puedes iniciar sesión.' } })
    } catch (err) {
      const data = err.response?.data
      if (data?.username) {
        setError('Ese nombre de usuario ya está en uso.')
      } else if (data?.email) {
        setError('Ese correo ya está registrado.')
      } else {
        setError('Error al registrarse. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 3H6C4.9 3 4 3.9 4 5v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h6v2zm4-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <h1>Crear Cuenta</h1>
          <p>Regístrate para participar en las votaciones</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Usuario</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Elige un nombre de usuario"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Correo electrónico</label>
            <input
              className={styles.input}
              type="email"
              placeholder="tu@correo.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Contraseña</label>
            <input
              className={styles.input}
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Confirmar contraseña</label>
            <input
              className={styles.input}
              type="password"
              placeholder="Repite tu contraseña"
              value={form.confirmar}
              onChange={e => setForm({ ...form, confirmar: e.target.value })}
              required
            />
          </div>
          <button className={styles.btnLogin} type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <div className={styles.link}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  )
}