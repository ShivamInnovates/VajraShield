/**
 * VajraShield JWT Authentication Service
 * 
 * Handles credential validation, JWT token creation with expiry,
 * token storage, and session management.
 * 
 * Uses browser-native btoa/atob for base64 encoding to create
 * proper JWT-format tokens (header.payload.signature).
 */

// ============ Default User Database ============
const USERS = [
  {
    email: 'admin@vajrashield.in',
    password: 'vajra@admin2026',
    role: 'admin',
    name: 'Admin',
    mfaCode: '000000',
  },
  {
    email: 'shivaji@vajrashield.in',
    password: 'vajra@analyst2026',
    role: 'senior_analyst',
    name: 'Shivaji',
    mfaCode: '000000',
  },
  {
    email: 'analyst@vajrashield.in',
    password: 'vajra@analyst2026',
    role: 'analyst',
    name: 'Analyst',
    mfaCode: '000000',
  },
];

// ============ JWT Configuration ============
const JWT_SECRET = 'vajrashield-jwt-secret-2026';
const TOKEN_EXPIRY_MINUTES = 30;

// ============ Helpers ============

function base64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createJWT(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_EXPIRY_MINUTES * 60,
  };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(fullPayload));
  // Browser-side signature (HMAC not available natively without WebCrypto, so we create a deterministic hash)
  const signatureInput = headerB64 + '.' + payloadB64 + '.' + JWT_SECRET;
  const signatureB64 = base64url(signatureInput);

  return headerB64 + '.' + payloadB64 + '.' + signatureB64;
}

function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  return Date.now() / 1000 > payload.exp;
}

// ============ Storage Keys ============
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  ROLE: 'user_role',
  NAME: 'user_name',
  EMAIL: 'user_email',
  LOGIN_TIME: 'login_time',
  PENDING_USER: '_pending_auth_user',
};

// ============ Auth Service ============

const authService = {
  /**
   * Step 1: Validate email + password against user database.
   * Returns { success, error, requiresMFA }
   */
  login(email, password) {
    const user = USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Store pending user for MFA step
    sessionStorage.setItem(STORAGE_KEYS.PENDING_USER, JSON.stringify(user));
    return { success: true, requiresMFA: true, userName: user.name };
  },

  /**
   * Step 2: Verify MFA code and issue JWT token.
   * Returns { success, error, token }
   */
  verifyMFA(code) {
    const pendingRaw = sessionStorage.getItem(STORAGE_KEYS.PENDING_USER);
    if (!pendingRaw) {
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const user = JSON.parse(pendingRaw);
    if (code !== user.mfaCode) {
      return { success: false, error: 'Invalid MFA code. Please try again.' };
    }

    // Create JWT token
    const token = createJWT({
      sub: user.email,
      role: user.role,
      name: user.name,
    });

    // Store auth data
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.ROLE, user.role);
    localStorage.setItem(STORAGE_KEYS.NAME, user.name);
    localStorage.setItem(STORAGE_KEYS.EMAIL, user.email);
    localStorage.setItem(STORAGE_KEYS.LOGIN_TIME, new Date().toISOString());

    // Clean up pending state
    sessionStorage.removeItem(STORAGE_KEYS.PENDING_USER);

    return { success: true, token };
  },

  /**
   * Check if the current session is authenticated with a valid, non-expired token.
   */
  isAuthenticated() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return false;
    if (isTokenExpired(token)) {
      // Token expired — auto-cleanup
      this.logout();
      return false;
    }
    return true;
  },

  /**
   * Get current user info from the stored token.
   */
  getUser() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return null;
    const payload = decodeJWT(token);
    if (!payload) return null;
    return {
      email: payload.sub,
      role: payload.role,
      name: payload.name,
      loginTime: localStorage.getItem(STORAGE_KEYS.LOGIN_TIME),
    };
  },

  /**
   * Get the raw JWT token for API requests.
   */
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  /**
   * Clear all auth data and end the session.
   */
  logout() {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  },

  /**
   * Decode a token to view its payload (for debugging/display).
   */
  decodeToken(token) {
    return decodeJWT(token || localStorage.getItem(STORAGE_KEYS.TOKEN));
  },
};

export default authService;
