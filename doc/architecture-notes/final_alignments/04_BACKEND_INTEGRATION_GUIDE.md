# Backend Integration Guide

## Quick Start

Now that all demo-mode code has been removed, your frontend is ready for real backend integration.

## 1. Configure API URLs

Update your environment configuration files:

### Development
`apps/main-app/src/config/app.config.js` and `apps/marketing-site/src/config/app.config.js`:

```javascript
development: {
  API_URL: 'http://localhost:8080/api'
}
```

### Production
```javascript
production: {
  API_URL: 'https://api.yourserver.com/api'
}
```

## 2. Required Backend Endpoints

### Authentication Endpoints (Marketing Site)
Located in: `apps/marketing-site/src/services/AuthService.ts`

#### Login
```
POST /api/auth/login
Request Body: { email: string, password: string }
Response: {
  user: { id, name, email, plan, avatar?, createdAt },
  token: string,
  refreshToken?: string
}
```

#### Register
```
POST /api/auth/register
Request Body: { name: string, email: string, password: string, plan?: string }
Response: {
  user: { id, name, email, plan, avatar?, createdAt },
  token: string,
  refreshToken?: string
}
```

#### Logout
```
POST /api/auth/logout
Headers: Authorization: Bearer {token}
Response: { success: boolean }
```

#### Validate Token
```
POST /api/auth/validate
Headers: Authorization: Bearer {token}
Response: { user: User }
```

## 3. Data Service Integration

The main app's `DataService` class already has a pattern for backend integration:

**Location**: `apps/main-app/src/services/DataService.ts`

The service checks `ConfigService.shouldUseBackend()` to determine whether to use:
- Backend API (when valid API URL is configured)
- localStorage (for development/testing)

### Example Integration Pattern

```typescript
// In DataService methods
static async getCars(): Promise<Car[]> {
  if (this.useBackend) {
    const response = await fetch(`${this.config.API_URL}/cars`, {
      headers: this.getAuthHeaders()
    });
    // Handle response...
  } else {
    // Fall back to localStorage
  }
}

private static getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}
```

## 4. Testing Backend Integration

### Using Development Tools
1. Open the DevTools panel (⚙️ button in bottom-right)
2. Toggle "Use Backend API" switch to test backend
3. Clear Local Data to reset state
4. Verify all operations work with backend

### Testing Checklist
- [ ] Login with backend credentials
- [ ] Register new user
- [ ] Add/Edit/Delete cars
- [ ] Create service records
- [ ] Generate maintenance plans
- [ ] Create alerts
- [ ] Logout and re-login

## 5. Environment Setup

### Development
```bash
# Frontend runs on http://localhost:3001
# Backend runs on http://localhost:8080
# API prefix: http://localhost:8080/api
```

### Production
```bash
# Frontend deployed to GitHub Pages
# Backend deployed to your server
# Update API_URL in app.config.js
```

## 6. Authentication Flow

```
1. User enters credentials on Login page
2. Frontend calls POST /api/auth/login
3. Backend validates and returns token
4. Frontend stores token in localStorage
5. Frontend includes Authorization header in all requests
6. Backend validates token for each request
7. If token expires, Frontend calls /api/auth/validate
8. If invalid, redirect to login
```

## 7. Error Handling

The updated `AuthService` now includes proper error handling:

```typescript
try {
  const response = await fetch(`${this.config.API_URL}/auth/login`, {...});
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  // Handle success...
} catch (error) {
  throw new Error(error instanceof Error ? error.message : 'Login failed');
}
```

## 8. Expected Backend Response Format

All endpoints should follow this pattern:

**Success Response (200)**
```json
{
  "user": { "id": "...", "name": "...", "email": "..." },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

**Error Response (4xx/5xx)**
```json
{
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## 9. CORS Configuration

Your backend must allow CORS requests from your frontend domain:

```javascript
// Backend CORS setup example
app.use(cors({
  origin: [
    'http://localhost:3001',  // Development
    'https://yourfrontend.com' // Production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  headers: ['Content-Type', 'Authorization']
}));
```

## 10. Security Considerations

### Tokens
- Store JWT tokens in `localStorage` (or `sessionStorage` for shorter TTL)
- Include token in `Authorization: Bearer <token>` header
- Implement token refresh mechanism
- Clear token on logout

### HTTPS
- Always use HTTPS in production
- Backend should validate all inputs
- Implement rate limiting on authentication endpoints
- Use secure cookies with `httpOnly` flag if possible

### Data Validation
- Validate all user inputs on backend
- Don't trust frontend validation alone
- Sanitize data before storage
- Implement proper database constraints

## 11. Debugging

Use DevTools to check:
1. **Current Mode**: localStorage vs Backend API
2. **API URL**: Verify correct backend URL is configured
3. **Has Override**: Check if backend override is active
4. **ID Generator**: Track local ID generation

## 12. Troubleshooting

### "Network Error" on Login
- [ ] Check backend is running
- [ ] Verify API URL in config is correct
- [ ] Check CORS configuration
- [ ] Look at browser Network tab for request details

### "401 Unauthorized" on Data Requests
- [ ] Token may have expired
- [ ] Check token is in localStorage
- [ ] Verify Authorization header format: `Bearer <token>`
- [ ] Check backend token validation logic

### Blank Page on Load
- [ ] Check if backend token validation fails
- [ ] Redirect to login should happen automatically
- [ ] Look at console for error messages

## Next Steps

1. ✅ Set up your backend server
2. ✅ Implement authentication endpoints
3. ✅ Configure API URLs in `app.config.js`
4. ✅ Test authentication flow
5. ✅ Implement remaining API endpoints for cars, services, etc.
6. ✅ Test full user workflows
7. ✅ Deploy to production

Good luck! 🚀
