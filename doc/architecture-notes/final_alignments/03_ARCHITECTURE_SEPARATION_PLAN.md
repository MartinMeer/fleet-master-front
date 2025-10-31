# Architecture Separation Plan: Auth Service + Business Logic Service

## Overview

This document describes the architecture for separating your system into two independent services:
1. **Marketing Site / Auth Service** - Handles authentication, user registration, token management
2. **Main App / Business Logic Service** - Handles fleet management, independent of auth concerns

## Current State (Before)

```
┌─────────────────────────────────────────────┐
│         Marketing Site                      │
│  ├─ Auth Service                            │
│  ├─ User Management                         │
│  └─ Business Logic                          │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│         Main App                            │
│  ├─ Auth Token Check (AuthHandler)          │
│  └─ Business Logic (DataService)            │
└─────────────────────────────────────────────┘
```

## Proposed State (After)

```
┌──────────────────────────────────┐
│   IDENTITY PROVIDER (IdP)        │ ← New Responsibility
│   Marketing Site Backend         │
│  ├─ User Registration            │
│  ├─ Login/Logout                 │
│  ├─ Token Management             │
│  ├─ Token Validation             │
│  └─ User Metadata                │
│                                  │
│  Returns: JWT Token + User ID    │
└──────────────────────────────────┘
           ↓ (auth_token + user_id)
┌──────────────────────────────────┐
│  BUSINESS LOGIC SERVICE          │ ← New Responsibility
│  Main App Backend                │
│  ├─ Fleet Management             │
│  ├─ Car Operations               │
│  ├─ Service Records              │
│  ├─ Maintenance Plans            │
│  └─ Alerts                       │
│                                  │
│  Receives: JWT Token + User ID   │
│  Uses User ID only (no auth)     │
└──────────────────────────────────┘
```

## Service Responsibilities

### Marketing Site / Auth Service
**Owns**: User credentials, authentication state, token lifecycle

**Responsibilities**:
- ✅ User registration with email/password
- ✅ User login (returns JWT + user ID)
- ✅ Token validation
- ✅ Token refresh (if implementing)
- ✅ Logout
- ✅ User profile (basic info: name, email, plan)

**Does NOT own**:
- ❌ Cars, maintenance records, alerts
- ❌ Fleet data
- ❌ Business logic

**Endpoints**:
```
POST /auth/register
POST /auth/login          → Returns { user: {id, name, email, plan}, token, refreshToken }
POST /auth/logout
POST /auth/validate       → Returns { user: {id, name, email} }
GET  /user/profile        → Returns user info
```

### Main App / Business Logic Service
**Owns**: All fleet data, business operations, user context (via user ID)

**Responsibilities**:
- ✅ Fleet management (add/edit/delete cars)
- ✅ Service records
- ✅ Maintenance planning
- ✅ Alert management
- ✅ All business logic

**Does NOT own**:
- ❌ Authentication (that's IdP)
- ❌ User passwords
- ❌ Token validation logic (just trusts the token)

**Receives from client**:
- JWT Token (in Authorization header)
- User ID (extracted from token or passed separately)

**Endpoints**:
```
GET    /cars                    → Returns cars for authenticated user
POST   /cars                    → Create car (uses user ID from token)
GET    /cars/:id                → Get car details
PUT    /cars/:id                → Update car
DELETE /cars/:id                → Delete car

POST   /service-records         → Create service record
GET    /service-records/:carId  → Get records for car
PUT    /service-records/:id     → Update record

POST   /maintenance-plans       → Create plan
GET    /maintenance-plans/:id   → Get plan details
PUT    /maintenance-plans/:id   → Update plan

POST   /alerts                  → Create alert
GET    /alerts                  → Get alerts for user
```

## Token Flow Architecture

### Login Flow
```
1. User enters credentials on Marketing Site
   ↓
2. Marketing Site Backend validates credentials
   ↓
3. Backend returns JWT token + User ID
   ↓
4. Frontend stores:
   - auth_token (JWT)
   - user_id (for quick access)
   - user_data (profile info)
   ↓
5. Frontend redirects to Main App with URL params:
   ?auth_token=<jwt>&user_id=<uid>&redirect=/
   ↓
6. Main App receives token + user_id
   ↓
7. Main App stores both in localStorage
   ↓
8. All Main App API calls include:
   Authorization: Bearer <jwt>
   
   Backend extracts user_id from JWT (or clients sends it)
```

### Subsequent Requests Flow
```
Main App → Backend:
  GET /cars
  Headers: {
    Authorization: Bearer <jwt_token>,
    Content-Type: application/json
  }
  Body: { userId: <user_id> }  // Or backend extracts from JWT
  ↓
Backend Logic:
  1. Validate JWT (ensure it's valid)
  2. Extract user_id from token OR from request body
  3. Query cars WHERE user_id = :userId
  4. Return only user's cars
```

## Frontend Implementation

### Marketing Site (`AuthService.ts`)
Returns token + user ID:

```typescript
static async login(email: string, password: string): Promise<AuthState> {
  const response = await fetch(`${this.config.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  // Backend returns:
  const data = await response.json();
  // {
  //   user: { id: "user_123", name: "John", email: "john@email.com", plan: "pro" },
  //   token: "eyJhbGc...",
  //   refreshToken: "refresh_token_..."
  // }
  
  const { user, token, refreshToken } = data;
  
  // Store all three
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user_id', user.id);      // ← Important!
  localStorage.setItem('user_data', JSON.stringify(user));
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
  
  return {
    user,
    token,
    isAuthenticated: true,
    isLoading: false
  };
}
```

### Main App (`AuthHandler.tsx`)
Receives both token and user ID:

```typescript
export function AuthHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleAuthFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get('auth_token');
      const userId = urlParams.get('user_id');          // ← Important!
      const redirectPath = urlParams.get('redirect');

      if (authToken && userId) {
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user_id', userId);       // ← Important!
        
        // Clean URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('auth_token');
        newUrl.searchParams.delete('user_id');
        newUrl.searchParams.delete('redirect');
        window.history.replaceState({}, '', newUrl.toString());
        
        if (redirectPath && redirectPath !== '/') {
          window.location.hash = redirectPath;
        }
      }

      // Check both token and user ID
      const token = localStorage.getItem('auth_token');
      const userId = localStorage.getItem('user_id');
      
      if (!token || !userId) {
        NavigationService.navigateToLogin(window.location.pathname);
        return;
      }

      setIsInitialized(true);
    };

    handleAuthFromURL();
  }, []);

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
```

### Main App Data Service
Uses user ID for scoped queries:

```typescript
static async getCars(): Promise<Car[]> {
  if (this.useBackend) {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('auth_token');
    
    if (!userId || !token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${this.config.API_URL}/cars`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })  // Send user ID
    });
    
    if (!response.ok) throw new Error('Failed to fetch cars');
    return response.json();
  } else {
    // localStorage fallback
    return JSON.parse(localStorage.getItem('cars') || '[]');
  }
}

static async createCar(carData: Omit<Car, 'id' | 'createdAt'>): Promise<Car> {
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('auth_token');
  
  if (this.useBackend) {
    const response = await fetch(`${this.config.API_URL}/cars`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,           // Send user ID so backend knows owner
        ...carData
      })
    });
    
    if (!response.ok) throw new Error('Failed to create car');
    return response.json();
  } else {
    // localStorage fallback
    const newCar: Car = {
      ...carData,
      id: IdGenerator.generateCarId(),
      createdAt: new Date().toISOString()
    };
    // ... save to localStorage
    return newCar;
  }
}
```

## Backend Implementation

### Marketing Site / Auth Service Backend
```javascript
// routes/auth.js
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate credentials
  const user = await User.findOne({ email });
  if (!user || !await user.comparePassword(password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Generate JWT with user ID
  const token = jwt.sign(
    { 
      sub: user.id,           // Standard JWT claim: subject (user ID)
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  const refreshToken = jwt.sign(
    { sub: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  // Return token + user ID + user data
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan
    },
    token,
    refreshToken
  });
});
```

### Main App / Business Logic Backend
```javascript
// middleware/auth.js
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    // Verify JWT (trust it comes from Auth Service)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.sub;  // Extract user ID from token
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// routes/cars.js
app.get('/cars', verifyToken, async (req, res) => {
  // req.userId is now available from the token
  // Business logic doesn't care about auth - just use the user ID
  
  const cars = await Car.find({ userId: req.userId });
  res.json(cars);
});

app.post('/cars', verifyToken, async (req, res) => {
  // Create car for the authenticated user
  const newCar = await Car.create({
    userId: req.userId,  // ← Main app never needs to validate user
    ...req.body
  });
  res.json(newCar);
});
```

## Key Advantages of This Architecture

### 1. **Separation of Concerns**
- Auth Service: Pure authentication logic
- Business Service: Pure business logic
- Clear boundaries and responsibilities

### 2. **Scalability**
- Can scale Auth Service independently
- Can scale Business Service independently
- Different teams can work on each

### 3. **Security**
- Auth Service doesn't know about business data
- Business Service doesn't validate credentials
- Each service has minimal attack surface

### 4. **Reusability**
- Auth Service can be used by multiple apps
- Business Service can work with any auth provider
- Easy to switch auth providers later

### 5. **Testing**
- Mock Auth Service for business logic tests
- Mock Business Service for auth tests
- Easier to test independent services

### 6. **Maintenance**
- Clear code organization
- Easy to find where things live
- Easy to debug issues

## Implementation Timeline

### Phase 1: Frontend Separation (Current)
- ✅ Remove demo mode
- Update `AuthService` to return `user.id`
- Update `AuthHandler` to store `user_id`
- Update `DataService` to use `user_id`
- Update all data methods to pass `user_id`

### Phase 2: Backend Separation
- Implement Marketing Site backend (Auth Service)
- Implement Main App backend (Business Service)
- Connect frontends to their respective backends

### Phase 3: Integration Testing
- Test login flow
- Test data operations
- Test token refresh
- Test logout and cleanup

## Migration Checklist

- [ ] Update `AuthService.ts` to return `user.id` from backend
- [ ] Update `AuthHandler.tsx` to store/retrieve `user_id`
- [ ] Update all `DataService` methods to use `user_id`
- [ ] Update URL redirect logic to include `user_id`
- [ ] Test localStorage auth flow
- [ ] Connect to real Auth backend
- [ ] Connect to real Business backend
- [ ] Test end-to-end flows
- [ ] Update error handling
- [ ] Add token refresh logic
- [ ] Deploy to production

## Configuration by Environment

### Development
```javascript
// Marketing Site Backend: http://localhost:3000/api
// Business Logic Backend: http://localhost:8080/api
// Main App Frontend: http://localhost:3001
```

### Production
```javascript
// Marketing Site Backend: https://auth.yourdomain.com/api
// Business Logic Backend: https://api.yourdomain.com/api
// Main App Frontend: https://app.yourdomain.com
```

## Next Steps

1. **Frontend Updates** (This repo)
   - Modify `AuthService` to ensure it returns `user.id`
   - Update `AuthHandler` to handle `user_id` parameter
   - Update all data methods to use `user_id`

2. **Backend Setup** (Your backend repo)
   - Create Auth Service endpoints
   - Create Business Logic Service endpoints
   - Implement token validation

3. **Integration Testing**
   - Connect frontends to backends
   - Test authentication flow
   - Test data operations

This architecture gives you a clean, scalable, enterprise-grade separation of concerns! 🚀
