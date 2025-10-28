# Architecture Decision: Separated Auth + Business Logic Services

## Executive Summary

**Decision**: Split your system into two independent services:
- **Marketing Site / Auth Service** - Handles user authentication only
- **Main App / Business Service** - Handles fleet management, knows nothing about auth

**Benefit**: Clean separation of concerns, easier to scale, maintain, and test independently.

---

## The Separation

### Before ❌
One service does everything:
```
┌─────────────────────┐
│   Marketing Site    │
│  ├─ Auth           │
│  ├─ Users          │
│  └─ Business Logic │
└─────────────────────┘
```

### After ✅
Two focused services:
```
┌─────────────────┐        ┌──────────────────┐
│  Marketing Site │        │    Main App      │
│  ├─ Auth ✨      │ ──→   │  ├─ Fleet Mgmt   │
│  └─ User Data   │        │  ├─ Maintenance  │
│                 │        │  └─ Alerts       │
└─────────────────┘        └──────────────────┘

Auth Service              Business Service
(Knows: users)            (Knows: fleet data)
(Doesn't know:            (Doesn't know:
 fleet data)               user passwords)
```

---

## How It Works

### 1. User Logs In
```
User → Login Page → Auth Service Backend
                         ↓
                    Validates credentials
                         ↓
           Returns: JWT Token + User ID
                         ↓
       Frontend stores both in localStorage
```

### 2. Frontend Redirects to Main App
```
?auth_token=<jwt_token>&user_id=<user_id>
          ↓
     Main App receives both
          ↓
    Stores both in localStorage
          ↓
     Ready for business operations
```

### 3. Main App Uses User ID
```
Every request:

GET /cars
Headers: Authorization: Bearer <jwt_token>
Body: { userId: <user_id> }
          ↓
Backend:
  1. Validates JWT is legit
  2. Extracts user ID from token (or request)
  3. Gets cars where userId = requested_id
  4. Returns only that user's cars
```

---

## Key Points

| Aspect | Before | After |
|--------|--------|-------|
| **Auth Logic** | Mixed in main app | Separate service |
| **User ID Flow** | Not explicit | Explicit in token |
| **Backend Concerns** | Auth + Business | Only business logic |
| **Scaling** | Both together | Independent |
| **Testing** | Hard to test separately | Easy to mock each |
| **Reusability** | Tied to this app | Can use auth service for multiple apps |

---

## Frontend Changes Needed

### 1. Marketing Site (Auth Service)
```typescript
// Return user ID when logging in
const { user, token } = await login(email, password);

// Pass user ID to main app
redirect(`/main-app?auth_token=${token}&user_id=${user.id}`);
```

### 2. Main App (Business Service)
```typescript
// Store both token and user ID
localStorage.setItem('auth_token', token);
localStorage.setItem('user_id', userId);

// Use user ID in requests
fetch('/api/cars', {
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ userId })
});
```

---

## Backend Requirements

### Auth Service Backend
```
POST /auth/login
  Request: { email, password }
  Response: {
    user: { id, name, email, plan },
    token: "jwt...",
    refreshToken: "refresh..."
  }

POST /auth/register
  [similar pattern]

POST /auth/logout
POST /auth/validate
GET  /user/profile
```

### Business Service Backend
```
GET  /cars              (filter by user ID from token)
POST /cars              (create with user ID)
PUT  /cars/:id          (update user's car)
DELETE /cars/:id        (delete user's car)

[Similar patterns for maintenance, alerts, services]

Key: Extract user ID from JWT, use for all queries
```

---

## Security Benefits

✅ **Auth Service** knows nothing about fleet data
✅ **Business Service** doesn't validate passwords
✅ **Each service** has minimal attack surface
✅ **User ID** embedded in JWT token
✅ **Credentials** never leave auth service

---

## Implementation Phases

### Phase 1: Frontend Updates (Current Frontend)
- [x] Remove demo mode
- [ ] Update `AuthHandler` to store user_id
- [ ] Update `DataService` to use user_id
- [ ] Update logout to clear user_id

### Phase 2: Backend Setup (Your Backend)
- [ ] Create Auth Service (user management, JWT)
- [ ] Create Business Service (fleet operations)
- [ ] Connect frontends to backends

### Phase 3: Testing & Deployment
- [ ] End-to-end auth flow
- [ ] Data operations with user_id
- [ ] Token validation and refresh
- [ ] Deploy to production

---

## Files & Documentation

| File | Purpose |
|------|---------|
| `ARCHITECTURE_SEPARATION_PLAN.md` | **Detailed architecture** with diagrams & code examples |
| `FRONTEND_IMPLEMENTATION_STEPS.md` | **Step-by-step frontend implementation guide** |
| `BACKEND_INTEGRATION_GUIDE.md` | How to integrate frontends with backend APIs |

---

## Next Steps

1. **Read** `FRONTEND_IMPLEMENTATION_STEPS.md` for exact code changes
2. **Update** Marketing Site Login to pass `user_id`
3. **Update** Main App AuthHandler to store `user_id`
4. **Update** DataService to use `user_id` in requests
5. **Build** your backend services
6. **Test** the full flow

---

## Questions?

See the detailed documents:
- **Architecture Deep Dive**: `ARCHITECTURE_SEPARATION_PLAN.md`
- **Exact Changes Needed**: `FRONTEND_IMPLEMENTATION_STEPS.md`
- **Backend Specifics**: Look for backend API requirements in separation plan

This is a **professional, scalable architecture** used by many production systems! 🚀
