# Frontend Implementation Steps for Separated Auth Architecture

## Overview
This guide shows exactly what to modify in the frontend to support the separated authentication service + business logic service architecture.

## Current Files That Need Updates

```
apps/marketing-site/src/
├── services/AuthService.ts           ← Ensure returns user.id
├── pages/Login.tsx                   ← Update redirect logic
└── hooks/useAuth.ts                  ← May need updates

apps/main-app/src/
├── components/AuthHandler.tsx        ← Handle user_id param
├── services/DataService.ts           ← Use user_id in requests
├── config/app.config.js              ← Add separate endpoints
└── services/ConfigService.ts         ← Update if needed
```

## Phase 1: Marketing Site Frontend (Auth Service)

### Step 1: Update `AuthService.ts` Response Handling

**File**: `apps/marketing-site/src/services/AuthService.ts`

**Current**: Already updated to call real API ✅

**Verify**:
```typescript
const data = await response.json();
const user: User = data.user;        // Should have user.id
const token = data.token;

this.setAuthData(token, user, data.refreshToken);

return {
  user,                               // Contains user.id
  token,
  isAuthenticated: true,
  isLoading: false
};
```

**Action**: No changes needed if backend returns `user.id` ✅

### Step 2: Update Login Page to Pass User ID to Main App

**File**: `apps/marketing-site/src/pages/Login.tsx`

**Current**: No user ID being passed

**Update**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  
  try {
    const authState = await login(email, password);
    
    // ← Add this: Get user ID from auth state
    const userId = authState.user?.id;
    
    if (!userId) {
      throw new Error('User ID not received from backend');
    }
    
    // Navigate to main app with both token and user_id
    // ← Change: Include user_id in redirect
    const mainAppUrl = `${NavigationService.getMainAppUrl()}?auth_token=${authState.token}&user_id=${userId}`;
    window.location.href = mainAppUrl;
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Login failed');
  }
};
```

### Step 3: Update Navigation Service

**File**: `apps/marketing-site/src/services/NavigationService.ts`

**Ensure it has**:
```typescript
export class NavigationService {
  static getMainAppUrl(): string {
    // Return the main app URL based on environment
    const config = APP_CONFIG.getCurrentConfig();
    return config.MAIN_APP_URL;
  }

  static navigateToLogin(redirectPath?: string): void {
    let url = this.getMarketingSiteUrl('login');
    if (redirectPath) {
      url += `?redirect=${encodeURIComponent(redirectPath)}`;
    }
    window.location.href = url;
  }
}
```

---

## Phase 2: Main App Frontend (Business Logic Service)

### Step 1: Update `AuthHandler.tsx` to Store User ID

**File**: `apps/main-app/src/components/AuthHandler.tsx`

**Current Implementation**:
```typescript
export function AuthHandler({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const handleAuthFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get('auth_token');
      const redirectPath = urlParams.get('redirect');

      if (authToken) {
        localStorage.setItem('auth_token', authToken);
        // ← Missing: Not storing user_id
        
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('auth_token');
        newUrl.searchParams.delete('redirect');
        window.history.replaceState({}, '', newUrl.toString());

        if (redirectPath && redirectPath !== '/') {
          window.location.hash = redirectPath;
        }
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
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

**Updated Implementation**:
```typescript
export function AuthHandler({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const handleAuthFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get('auth_token');
      const userId = urlParams.get('user_id');              // ← Add this line
      const redirectPath = urlParams.get('redirect');

      if (authToken && userId) {                             // ← Check for both
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user_id', userId);            // ← Add this line
        
        // Clean URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('auth_token');
        newUrl.searchParams.delete('user_id');             // ← Add this line
        newUrl.searchParams.delete('redirect');
        window.history.replaceState({}, '', newUrl.toString());

        // Redirect if needed
        if (redirectPath && redirectPath !== '/') {
          window.location.hash = redirectPath;
        }
      }

      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      const storedUserId = localStorage.getItem('user_id');  // ← Add this line
      
      if (!token || !storedUserId) {                          // ← Check for both
        // Redirect to marketing site login
        NavigationService.navigateToLogin(window.location.pathname);
        return;
      }

      setIsInitialized(true);
    };

    handleAuthFromURL();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

**Key Changes**:
- ✅ Extract `user_id` from URL params
- ✅ Store `user_id` in localStorage
- ✅ Require both `auth_token` AND `user_id` for authentication
- ✅ Clean `user_id` from URL for security

### Step 2: Update `DataService.ts` to Use User ID

**File**: `apps/main-app/src/services/DataService.ts`

**Add Helper Method**:
```typescript
private static getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

private static getUserId(): string {
  const userId = localStorage.getItem('user_id');
  if (!userId) {
    throw new Error('User ID not found. Please re-authenticate.');
  }
  return userId;
}
```

**Update All CRUD Methods**:

#### Example: getCars()
```typescript
static async getCars(): Promise<Car[]> {
  if (this.useBackend) {
    const userId = this.getUserId();
    const headers = this.getAuthHeaders();
    
    const response = await fetch(`${this.config.API_URL}/cars`, {
      method: 'GET',
      headers,
      body: JSON.stringify({ userId })  // Send user ID
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cars');
    }

    return response.json();
  } else {
    // localStorage fallback
    return JSON.parse(localStorage.getItem('cars') || '[]');
  }
}
```

#### Example: createCar()
```typescript
static async createCar(carData: Omit<Car, 'id' | 'createdAt'>): Promise<Car> {
  if (this.useBackend) {
    const userId = this.getUserId();
    const headers = this.getAuthHeaders();
    
    const response = await fetch(`${this.config.API_URL}/cars`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        ...carData
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create car');
    }

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

#### Example: updateCar()
```typescript
static async updateCar(id: string, carData: Partial<Car>): Promise<Car> {
  if (this.useBackend) {
    const userId = this.getUserId();
    const headers = this.getAuthHeaders();
    
    const response = await fetch(`${this.config.API_URL}/cars/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        userId,
        ...carData
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update car');
    }

    return response.json();
  } else {
    // localStorage fallback
    // ... update in localStorage
  }
}
```

#### Example: deleteCar()
```typescript
static async deleteCar(id: string): Promise<void> {
  if (this.useBackend) {
    const userId = this.getUserId();
    const headers = this.getAuthHeaders();
    
    const response = await fetch(`${this.config.API_URL}/cars/${id}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error('Failed to delete car');
    }
  } else {
    // localStorage fallback
    // ... delete from localStorage
  }
}
```

**Pattern for All Methods**:
1. Get `userId` using `this.getUserId()`
2. Get `headers` using `this.getAuthHeaders()`
3. Include `userId` in request body or URL
4. Handle both backend and localStorage paths

### Step 3: Update Logout Handling

**File**: `apps/main-app/src/pages/Home.tsx`

**Current**:
```typescript
const handleLogoutClick = () => {
  console.log('Logout clicked - clearing auth data...')
  
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_data') 
  localStorage.removeItem('refresh_token')
  
  console.log('Auth data cleared, navigating to marketing site...')
  NavigationService.navigateToMarketing('/')
}
```

**Updated**:
```typescript
const handleLogoutClick = () => {
  console.log('Logout clicked - clearing auth data...')
  
  // Clear all authentication data
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_id')           // ← Add this
  localStorage.removeItem('user_data') 
  localStorage.removeItem('refresh_token')
  
  console.log('Auth data cleared, navigating to marketing site...')
  NavigationService.navigateToMarketing('/')
}
```

---

## Phase 3: Configuration Updates

### Update App Config

**File**: `apps/main-app/src/config/app.config.js`

**Current**:
```javascript
production: {
  MARKETING_URL: 'https://martinmeer.github.io/my-car-tech-tracker-front',
  MAIN_APP_URL: 'https://martinmeer.github.io/my-car-tech-tracker-front/app',
  API_URL: 'https://your-api-domain.com/api'
}
```

**Add separate endpoints** (when you have separate backends):
```javascript
production: {
  MARKETING_URL: 'https://martinmeer.github.io/my-car-tech-tracker-front',
  MAIN_APP_URL: 'https://martinmeer.github.io/my-car-tech-tracker-front/app',
  AUTH_API_URL: 'https://auth.yourdomain.com/api',    // ← New
  BUSINESS_API_URL: 'https://api.yourdomain.com/api'  // ← New
}
```

**Update ConfigService** to use correct endpoint:
```typescript
static getAuthApiUrl(): string {
  const config = APP_CONFIG.getCurrentConfig();
  return config.AUTH_API_URL || config.API_URL;
}

static getBusinessApiUrl(): string {
  const config = APP_CONFIG.getCurrentConfig();
  return config.BUSINESS_API_URL || config.API_URL;
}
```

---

## Implementation Checklist

### Marketing Site (Auth Service)
- [ ] Verify `AuthService.ts` returns `user.id` from backend
- [ ] Update `Login.tsx` to pass `user_id` to main app
- [ ] Ensure redirect URL includes both `auth_token` and `user_id`
- [ ] Test login flow with redirect

### Main App (Business Logic)
- [ ] Update `AuthHandler.tsx` to store/retrieve `user_id`
- [ ] Add `getUserId()` method to `DataService.ts`
- [ ] Add `getAuthHeaders()` method to `DataService.ts`
- [ ] Update ALL `DataService` methods to use `userId`
- [ ] Update logout to clear `user_id`
- [ ] Test localStorage flow
- [ ] Test backend flow

### Testing
- [ ] Login → redirect to main app
- [ ] Main app receives token + user_id
- [ ] All data operations include user_id
- [ ] Logout clears both token and user_id
- [ ] Re-login works correctly
- [ ] Switch between localStorage and backend

---

## Code Examples Summary

### Redirect from Marketing Site
```typescript
// After successful login, redirect with both params
const redirectUrl = `${mainAppUrl}?auth_token=${token}&user_id=${userId}`;
window.location.href = redirectUrl;
```

### Store in Main App
```typescript
// In AuthHandler.tsx
localStorage.setItem('auth_token', authToken);
localStorage.setItem('user_id', userId);
```

### Use in DataService
```typescript
// In DataService methods
const userId = localStorage.getItem('user_id');
const token = localStorage.getItem('auth_token');

// Include in requests
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ userId, ...data })
});
```

---

## Common Issues & Solutions

### Issue: "User ID not found"
**Solution**: 
- Ensure marketing site passes `user_id` in redirect
- Check AuthHandler extracts and stores `user_id`
- Verify localStorage has `user_id` key

### Issue: Backend returns 401 Unauthorized
**Solution**:
- Check JWT token is valid
- Verify Authorization header format: `Bearer <token>`
- Ensure backend validates token correctly

### Issue: Getting data for wrong user
**Solution**:
- Verify `userId` is being sent in requests
- Check backend queries filter by userId
- Ensure user IDs don't leak between users

---

## Next: Backend Implementation

Once frontend changes are done, you'll need to update backends:

1. **Auth Service Backend**
   - Return `user.id` in login response
   - Include user ID in JWT `sub` claim

2. **Business Service Backend**
   - Extract user ID from JWT
   - Filter all queries by user ID
   - Include user ID checks in all operations

See `ARCHITECTURE_SEPARATION_PLAN.md` for backend details.

Good luck! 🚀
