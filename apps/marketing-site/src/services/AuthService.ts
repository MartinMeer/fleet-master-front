// apps/marketing-site/src/services/AuthService.ts
import { APP_CONFIG } from '../config/app.config';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'starter' | 'pro' | 'enterprise';
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static config = APP_CONFIG.getCurrentConfig();

  /**
   * Login with email and password
   */
  static async login(email: string, password: string): Promise<AuthState> {
    try {
      const response = await fetch(`${this.config.API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const user: User = data.user;
      const token = data.token;

      this.setAuthData(token, user, data.refreshToken);

      return {
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  /**
   * Register new user
   */
  static async register(userData: {
    name: string;
    email: string;
    password: string;
    plan?: string;
  }): Promise<AuthState> {
    try {
      const response = await fetch(`${this.config.API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      const user: User = data.user;
      const token = data.token;

      this.setAuthData(token, user, data.refreshToken);

      return {
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${this.config.API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Get current auth state
   */
  static getAuthState(): AuthState {
    const token = this.getToken();
    const user = this.getUser();
    
    return {
      user,
      token,
      isAuthenticated: !!(token && user),
      isLoading: false
    };
  }

  /**
   * Validate token with backend API
   */
  static async validateToken(token: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.config.API_URL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  }

  // Private helper methods
  private static setAuthData(token: string, user: User, refreshToken?: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  private static clearAuthData() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  private static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private static getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }
}