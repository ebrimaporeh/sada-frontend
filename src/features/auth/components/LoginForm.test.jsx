import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }) => <a>{children}</a>,
}))

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <div>google-login-button</div>,
}))

const loginMutate = vi.fn()
const resendMutate = vi.fn()
let loginState = { isPending: false, isError: false, error: null }

vi.mock('@/hooks/useAuth', () => ({
  useLogin: () => ({ mutate: loginMutate, ...loginState }),
  useGoogleOAuth: () => ({ mutate: vi.fn(), isError: false }),
  useResendVerification: () => ({ mutate: resendMutate, isPending: false }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    loginMutate.mockClear()
    resendMutate.mockClear()
    loginState = { isPending: false, isError: false, error: null }
  })

  it('submits the entered email and password', async () => {
    const user = userEvent.setup()
    const { container } = render(<LoginForm />)

    // The Password field's <label> isn't wired to its <input> via
    // htmlFor/id, so it isn't reachable through getByLabelText -- a real,
    // pre-existing accessibility gap, worked around here rather than
    // silently masked.
    await user.type(screen.getByPlaceholderText('you@example.com'), 'donor@example.com')
    await user.type(container.querySelector('input[type="password"]'), 'StrongPass@1')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(loginMutate).toHaveBeenCalledWith({ email: 'donor@example.com', password: 'StrongPass@1' })
  })

  it('a quick-login demo account button submits its own credentials', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByText('Admin'))

    expect(loginMutate).toHaveBeenCalledWith({ email: 'admin@sada.gm', password: 'Admin@1234' })
  })

  it('shows a resend-verification link only when the error is about an unverified email', () => {
    loginState = {
      isPending: false,
      isError: true,
      error: { response: { data: { message: 'Please verify your email before logging in.' } } },
    }
    render(<LoginForm />)

    expect(screen.getByText(/please verify your email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument()
  })

  it('does not show a resend link for an unrelated login error', () => {
    loginState = {
      isPending: false,
      isError: true,
      error: { response: { data: { message: 'Invalid email or password.' } } },
    }
    render(<LoginForm />)

    expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /resend verification email/i })).not.toBeInTheDocument()
  })
})
