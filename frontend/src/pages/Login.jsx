import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Mail, Lock, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthCover from '../components/AuthCover'
import AuthBrandHeader from '../components/AuthBrandHeader'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.message

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#080c14]">
      <AuthCover variant="login" />

      <div className="flex min-h-screen flex-1 flex-col">
        <AuthBrandHeader />

        <div className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-md animate-fade-up">
            <p className="type-eyebrow">Console Sign In</p>

            <h1 className="mt-5 font-block text-3xl font-bold uppercase tracking-[-0.02em] text-white sm:text-4xl">
              Open Live
              <span className="type-hero-accent block">Console</span>
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Use your institutional email to access the supervisor workspace.
            </p>

            {successMessage && (
              <div className="mt-6 rounded-lg border border-emerald-800 bg-[#0e1a14] px-4 py-3 font-block text-xs font-semibold uppercase tracking-[0.1em] text-emerald-400">
                {successMessage}
              </div>
            )}
            {error && <div className="alert-error mt-6">{error}</div>}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-1.5 block font-block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    className="input-field pl-10"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="you@institution.edu"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-field pl-10 pr-11"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-300"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                <LogIn className="h-4 w-4" />
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 space-y-3 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
              <p>
                New supervisor?{' '}
                <Link to="/signup" className="link-accent">
                  Get Access
                </Link>
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 font-block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back To Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
