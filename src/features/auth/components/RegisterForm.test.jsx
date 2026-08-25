import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from './RegisterForm'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }) => <a>{children}</a>,
  useSearch: () => ({}),
}))

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <div>google-login-button</div>,
}))

const registerMutate = vi.fn()
let registerState = { isPending: false, isError: false, error: null }

vi.mock('@/hooks/useAuth', () => ({
  useRegister: () => ({ mutate: registerMutate, ...registerState }),
  useGoogleOAuth: () => ({ mutate: vi.fn(), isError: false }),
}))

// The three fields' labels aren't wired to their inputs via htmlFor/id, so
// getByLabelText won't find them -- same pre-existing gap as LoginForm.
function fillForm(container, { email, password, passwordConfirm }) {
  return Promise.resolve().then(async () => {
    const user = userEvent.setup()
    if (email) await user.type(container.querySelector('input[name="email"]'), email)
    if (password) await user.type(container.querySelector('input[name="password"]'), password)
    if (passwordConfirm) await user.type(container.querySelector('input[name="password_confirm"]'), passwordConfirm)
    return user
  })
}

describe('RegisterForm', () => {
  beforeEach(() => {
    registerMutate.mockClear()
    registerState = { isPending: false, isError: false, error: null }
  })

  it('disables submit until the terms checkbox is checked', async () => {
    const { container } = render(<RegisterForm />)
    const user = await fillForm(container, { email: 'new@example.com', password: 'StrongPass@1', passwordConfirm: 'StrongPass@1' })

    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()

    await user.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('button', { name: /create account/i })).not.toBeDisabled()
  })

  it('submits the form with the entered values once terms are accepted', async () => {
    const { container } = render(<RegisterForm />)
    const user = await fillForm(container, { email: 'new@example.com', password: 'StrongPass@1', passwordConfirm: 'StrongPass@1' })
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(registerMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@example.com',
        password: 'StrongPass@1',
        password_confirm: 'StrongPass@1',
        terms_accepted: true,
      }),
    )
  })

  it('surfaces a server-side registration error', () => {
    registerState = {
      isPending: false,
      isError: true,
      error: { response: { data: { message: 'A user with this email already exists.' } } },
    }
    render(<RegisterForm />)

    expect(screen.getByText(/already exists/i)).toBeInTheDocument()
  })
})
