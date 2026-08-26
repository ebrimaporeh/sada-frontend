import { useState } from 'react'
import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft, Building2, CheckCircle2, Loader2, LogIn, UserPlus, XCircle } from 'lucide-react'
import { useMe } from '@/hooks/useAuth'
import { useInvitationPreview, useAcceptInvitation, useRejectInvitation } from '@/hooks/useOrganizations'
import { AuthShell } from '@/components/custom/AuthShell'
import { ROUTES, PENDING_INVITATION_STORAGE_KEY } from '@/constants'

export function InvitationPage() {
  const search = useSearch({ strict: false })
  const token = search?.token
  const navigate = useNavigate()
  const { data: me, isLoading: meLoading } = useMe()
  const { data: invitation, isLoading, isError, error } = useInvitationPreview(token)
  const acceptInvitation = useAcceptInvitation()
  const rejectInvitation = useRejectInvitation()
  const [responded, setResponded] = useState(null) // 'accepted' | 'rejected'

  function continueToAuth(routeTo) {
    localStorage.setItem(PENDING_INVITATION_STORAGE_KEY, token)
    navigate({ to: routeTo, search: { email: invitation?.email } })
  }

  function handleAccept() {
    acceptInvitation.mutate(token, {
      onSuccess: () => setResponded('accepted'),
    })
  }

  function handleReject() {
    rejectInvitation.mutate(token, {
      onSuccess: () => setResponded('rejected'),
    })
  }

  if (!token) {
    return (
      <AuthShell title="Organization Invitation">
        <div className="space-y-4 text-center py-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">Missing invitation link</h1>
            <p className="text-sm text-muted-foreground">
              Open this page from the invitation link in your email instead of visiting it directly.
            </p>
          </div>
        </div>
        <BackHome />
      </AuthShell>
    )
  }

  if (isLoading || meLoading) {
    return (
      <AuthShell title="Organization Invitation">
        <div className="space-y-4 text-center py-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading invitation…</p>
        </div>
      </AuthShell>
    )
  }

  if (isError || !invitation) {
    return (
      <AuthShell title="Organization Invitation">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">Invitation not found</h1>
            <p className="text-sm text-muted-foreground">
              {error?.response?.data?.message || 'This link is invalid or has expired. Ask the organization to resend it.'}
            </p>
          </div>
        </div>
        <BackHome />
      </AuthShell>
    )
  }

  if (invitation.status !== 'pending' || responded) {
    const outcome = responded || invitation.status
    return (
      <AuthShell title="Organization Invitation">
        <div className="space-y-4 text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${outcome === 'accepted' ? 'bg-primary/10' : 'bg-muted'}`}>
            {outcome === 'accepted'
              ? <CheckCircle2 className="w-6 h-6 text-primary" />
              : <XCircle className="w-6 h-6 text-muted-foreground" />}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">
              {outcome === 'accepted' ? `You joined ${invitation.organization_name}` : 'Invitation declined'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {outcome === 'accepted'
                ? 'You can switch to it any time from the profile switcher on your dashboard.'
                : 'No further action needed.'}
            </p>
          </div>
        </div>
        {outcome === 'accepted' ? (
          <Link
            to={ROUTES.ORGANIZATIONS}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            Go to Organizations
          </Link>
        ) : (
          <BackHome />
        )}
      </AuthShell>
    )
  }

  const emailMismatch = me && me.email.toLowerCase() !== invitation.email.toLowerCase()

  return (
    <AuthShell title="Organization Invitation">
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold">{invitation.organization_name}</h1>
          <p className="text-sm text-muted-foreground">
            {invitation.invited_by_name ? `${invitation.invited_by_name} invited` : 'You were invited'} you to join as{' '}
            <span className="font-semibold text-foreground">{invitation.role_name}</span>.
          </p>
          <p className="text-xs text-muted-foreground">Sent to {invitation.email}</p>
        </div>
      </div>

      {!me ? (
        <div className="space-y-3 mt-6">
          <p className="text-xs text-center text-muted-foreground">
            Log in or create an account with this email address to respond.
          </p>
          <button
            type="button"
            onClick={() => continueToAuth(ROUTES.LOGIN)}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <LogIn className="w-4 h-4" /> Log in
          </button>
          <button
            type="button"
            onClick={() => continueToAuth(ROUTES.REGISTER)}
            className="w-full inline-flex items-center justify-center gap-2 border font-semibold px-6 py-2.5 rounded-xl hover:bg-accent transition-colors text-sm"
          >
            <UserPlus className="w-4 h-4" /> Create an account
          </button>
        </div>
      ) : emailMismatch ? (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-destructive bg-destructive/10 rounded-lg p-3 text-center">
            You're signed in as {me.email}, but this invitation was sent to {invitation.email}. Log out and sign in
            with that address to respond.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {(acceptInvitation.isError || rejectInvitation.isError) && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg p-2.5 text-center">
              {(acceptInvitation.error || rejectInvitation.error)?.response?.data?.message || 'Something went wrong. Please try again.'}
            </p>
          )}
          <button
            type="button"
            onClick={handleAccept}
            disabled={acceptInvitation.isPending || rejectInvitation.isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
          >
            {acceptInvitation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Accept invitation
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={acceptInvitation.isPending || rejectInvitation.isPending}
            className="w-full inline-flex items-center justify-center gap-2 border font-semibold px-6 py-2.5 rounded-xl hover:bg-accent transition-colors disabled:opacity-50 text-sm"
          >
            {rejectInvitation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Decline
          </button>
        </div>
      )}
    </AuthShell>
  )
}

function BackHome() {
  return (
    <p className="text-center text-sm text-muted-foreground mt-6">
      <Link to={ROUTES.HOME} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to home
      </Link>
    </p>
  )
}
