import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UserPlus,
  Mail,
  Phone,
  BadgeCheck,
  Building2,
  Lock,
  User,
  ArrowLeft,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthCover from '../components/AuthCover'
import AuthBrandHeader from '../components/AuthBrandHeader'

function Field({ label, hint, optional, children }) {
  return (
    <div>
      <label className="mb-1.5 block font-block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
        {label}
        {optional && (
          <span className="ml-1.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500">
            Optional
          </span>
        )}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

function Section({ title, description, children }) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-[#0d1420] p-5">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="font-block text-xs font-bold uppercase tracking-[0.14em] text-white">
          {title}
        </h3>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function IconInput({ icon: Icon, className = '', ...props }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input className={`input-field pl-10 ${className}`} {...props} />
    </div>
  )
}

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    password_confirm: '',
    employee_id: '',
    department: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await signup(form)
      navigate('/login', {
        state: { message: 'Registration submitted. An admin will review your request shortly.' },
      })
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' · ')
        setError(msg)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#080c14]">
      <AuthCover variant="signup" />

      <main className="flex min-h-screen flex-1 flex-col">
        <AuthBrandHeader />

        <div className="flex flex-1 flex-col justify-center px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-lg animate-fade-up">
            <p className="type-eyebrow">Get Console Access</p>

            <h1 className="mt-5 font-block text-3xl font-bold uppercase tracking-[-0.02em] text-white sm:text-4xl">
              Create Supervisor
              <span className="type-hero-accent block">Account</span>
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Submit your details. Sign in with email after an administrator approves you.
            </p>

            {error && <div className="alert-error mt-6">{error}</div>}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <Section title="Personal Information" description="How we identify you">
                <Field label="Full Name">
                  <IconInput
                    icon={User}
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    placeholder="John Mwangi"
                    autoComplete="name"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email" hint="Used to sign in after approval">
                    <IconInput
                      icon={Mail}
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@institution.edu"
                      autoComplete="email"
                    />
                  </Field>
                  <Field label="Phone" optional>
                    <IconInput
                      icon={Phone}
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+254 7XX XXX XXX"
                      autoComplete="tel"
                    />
                  </Field>
                </div>
              </Section>

              <Section title="Work Details" description="Helps admins verify your role">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Employee ID" optional>
                    <IconInput
                      icon={BadgeCheck}
                      name="employee_id"
                      value={form.employee_id}
                      onChange={handleChange}
                      placeholder="STF-2041"
                    />
                  </Field>
                  <Field label="Department" optional>
                    <IconInput
                      icon={Building2}
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      placeholder="Examinations Office"
                    />
                  </Field>
                </div>
              </Section>

              <Section title="Security" description="Minimum 8 characters">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Password">
                    <IconInput
                      icon={Lock}
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </Field>
                  <Field label="Confirm Password">
                    <IconInput
                      icon={Lock}
                      name="password_confirm"
                      type="password"
                      value={form.password_confirm}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </Field>
                </div>
              </Section>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 font-block text-xs uppercase tracking-[0.14em]"
              >
                <UserPlus className="h-4 w-4" />
                {loading ? 'Submitting Request...' : 'Submit For Approval'}
              </button>

              <p className="text-center text-xs leading-relaxed text-slate-500">
                An administrator must approve your account before you can open the dashboard.
              </p>
            </form>

            <div className="mt-8 space-y-3 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
              <p>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="link-accent"
                >
                  Sign In
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
      </main>
    </div>
  )
}
