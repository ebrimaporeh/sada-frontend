# Google OAuth Frontend Setup

## Quick Start

### 1. Environment Variables

Add to `.env`:
```bash
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

### 2. Dependencies

Already installed via:
```bash
npm install @react-oauth/google
```

### 3. How to Configure

1. Get Google Client ID from [Google Cloud Console](https://console.cloud.google.com)
2. Add to `.env` file
3. Start dev server: `npm run dev`
4. Test Google login button on login page

## Architecture Overview

```
main.jsx
  └─ GoogleOAuthProvider (wraps entire app)
      └─ App
          └─ LoginPage
              └─ LoginForm
                  └─ GoogleLogin component
```

## Component Details

### GoogleOAuthProvider (main.jsx)

```jsx
<GoogleOAuthProvider clientId={googleClientId}>
  <QueryClientProvider>
    <RouterProvider router={router} />
  </QueryClientProvider>
</GoogleOAuthProvider>
```

Initializes Google OAuth with client ID. Must wrap entire app.

### GoogleLogin Component (LoginForm.jsx)

```jsx
<GoogleLogin
  onSuccess={(credentialResponse) => {
    googleOAuth.mutate(credentialResponse.credential)
  }}
  onError={() => {
    console.log('Google login failed')
  }}
/>
```

- `credentialResponse.credential` contains the ID token
- Sends to backend via `useGoogleOAuth()` hook
- On success, redirects to /dashboard

### useGoogleOAuth Hook (useAuth.js)

```javascript
export function useGoogleOAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (idToken) => authApi.googleOAuth(idToken),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.data.tokens.access)
      localStorage.setItem('refresh_token', data.data.tokens.refresh)
      queryClient.setQueryData(queryKeys.auth.me(), data.data.user)
      navigate({ to: '/dashboard' })
    },
  })
}
```

Handles:
1. Sending ID token to backend
2. Storing JWT tokens
3. Updating React Query cache
4. Navigation to dashboard

### authApi.googleOAuth (authApi.js)

```javascript
googleOAuth: (idToken) => 
  apiClient.post('/auth/google/', { id_token: idToken })
    .then((r) => r.data)
```

POSTs ID token to backend and returns response with JWT tokens.

## Configuration by Environment

### Development (localhost)

```bash
VITE_GOOGLE_CLIENT_ID=your-dev-client-id
VITE_API_URL=http://localhost:8000/api/v1
```

Ensure:
- localhost:5173 in Google Cloud Console authorized origins
- localhost:5174 in Google Cloud Console authorized origins

### Production (Vercel)

```bash
VITE_GOOGLE_CLIENT_ID=your-prod-client-id
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

Ensure:
- yourdomain.vercel.app in Google Cloud Console authorized origins
- HTTPS enforced

## Troubleshooting

### "Failed to initialize Google Sign-In" Error

**Problem**: GoogleOAuthProvider not initialized
**Solution**: Ensure `VITE_GOOGLE_CLIENT_ID` is set in `.env`

### Google Button Not Appearing

**Problem**: GoogleOAuthProvider missing or incorrect client ID
**Solution**: 
1. Check `.env` has `VITE_GOOGLE_CLIENT_ID`
2. Check app is wrapped with `GoogleOAuthProvider`
3. Restart dev server

### "Invalid audience" Error from Backend

**Problem**: Client ID doesn't match what backend expects
**Solution**: Ensure same `GOOGLE_OAUTH_CLIENT_ID` in backend .env

### CORS Errors

**Problem**: Frontend → Backend request blocked
**Solution**: Backend CORS already configured, ensure ALLOWED_HOSTS includes frontend origin

### Token Not Stored

**Problem**: localStorage.setItem not working
**Solution**: Check browser console for errors, ensure no CSP violations

## API Integration

### Sending ID Token

```javascript
// LoginForm.jsx
<GoogleLogin
  onSuccess={(credentialResponse) => {
    googleOAuth.mutate(credentialResponse.credential)
  }}
/>
```

`credentialResponse.credential` = ID token string

### Backend Response

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "access": "jwt-access-token",
      "refresh": "jwt-refresh-token"
    }
  }
}
```

### Token Storage

```javascript
localStorage.setItem('access_token', data.data.tokens.access)
localStorage.setItem('refresh_token', data.data.tokens.refresh)
```

### Using Tokens

All API requests automatically include `Authorization: Bearer {access_token}` via axios interceptor in `src/api/client.js`

## Testing

### Manual Testing

1. Visit login page
2. Click Google login button
3. Authenticate with Google account
4. Verify redirected to dashboard
5. Check localStorage has access_token and refresh_token

### Automated Testing

Create test in Jest/Vitest:

```javascript
it('should login with Google', async () => {
  const { getByRole } = render(<LoginPage />)
  const googleButton = getByRole('button', { name: /google/i })
  fireEvent.click(googleButton)
  // Mock Google popup...
})
```

## Files Modified

- `.env` - Added VITE_GOOGLE_CLIENT_ID
- `src/main.jsx` - Added GoogleOAuthProvider
- `src/api/authApi.js` - Added googleOAuth() method
- `src/hooks/useAuth.js` - Added useGoogleOAuth() hook
- `src/features/auth/components/LoginForm.jsx` - Added GoogleLogin component

## Next Steps

1. Set `VITE_GOOGLE_CLIENT_ID` in `.env`
2. Start dev server: `npm run dev`
3. Test Google login button
4. Verify tokens stored in localStorage
5. Test authenticated requests to backend
