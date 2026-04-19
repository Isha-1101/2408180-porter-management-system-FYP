# Authentication APIs

User authentication endpoints for login and registration.

---

## Overview

| Property | Value |
|----------|-------|
| Service File | `src/apis/services/authService.js` |
| Hooks File | `src/apis/hooks/authHooks.jsx` |
| Total Endpoints | 2 |
| Components | Login.jsx, Register.jsx |

---

## Endpoints

### 1. User Login

**Endpoint:** `POST /auth/login`

**Service:**
```javascript
export const authService = {
  login: (credentials) => 
    axiosInstance.post('/auth/login', credentials)
};
```

**Hook:**
```javascript
export const useLogin = (options = {}) =>
  useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    ...options
  });
```

**Request:**
```javascript
{
  email: string,      // User email
  password: string    // User password
}
```

**Response:**
```javascript
{
  success: boolean,
  token: string,                    // JWT token
  user: {
    id: string,
    email: string,
    name: string,
    role: 'user' | 'porter' | 'admin',
    avatar?: string
  }
}
```

**Usage in Component:**
```javascript
import { useLogin } from '../../../apis/hooks/authHooks';

const LoginForm = () => {
  const loginMutation = useLogin({
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    }
  });

  const handleLogin = (credentials) => {
    loginMutation.mutate(credentials);
  };

  return (
    // Form JSX
  );
};
```

---

### 2. User Registration

**Endpoint:** `POST /auth/register`

**Service:**
```javascript
export const authService = {
  register: (userData) => 
    axiosInstance.post('/auth/register', userData)
};
```

**Hook:**
```javascript
export const useRegister = (options = {}) =>
  useMutation({
    mutationFn: (userData) => authService.register(userData),
    ...options
  });
```

**Request:**
```javascript
{
  email: string,        // User email
  password: string,     // User password (min 8 chars)
  confirmPassword: string,
  name: string,         // User full name
  phone: string,        // Phone number
  role: 'user' | 'porter',  // User type
  // Additional fields based on role
}
```

**Response:**
```javascript
{
  success: boolean,
  message: string,
  user: {
    id: string,
    email: string,
    name: string,
    role: string,
    createdAt: timestamp
  }
}
```

**Usage in Component:**
```javascript
import { useRegister } from '../../../apis/hooks/authHooks';

const RegisterForm = () => {
  const registerMutation = useRegister({
    onSuccess: (data) => {
      toast.success('Registration successful. Please login.');
      navigate('/login');
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    }
  });

  const handleRegister = (userData) => {
    registerMutation.mutate(userData);
  };

  return (
    // Form JSX
  );
};
```

---

## Auth Flow

```
User Input
    ↓
useLogin/useRegister Hook
    ↓
authService.[login/register]()
    ↓
axiosInstance POST request
    ↓
Store Token (localStorage/auth store)
    ↓
Redirect to Dashboard
```

---

## Token Management

### Request Interceptor (axiosInstance.jsx)

Automatically adds token to all requests:

```javascript
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptor (axiosInstance.jsx)

Handles 401 errors:

```javascript
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Error Handling

Common error responses:

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Invalid credentials | Wrong email/password |
| 400 | Email already exists | Registration with existing email |
| 400 | Validation failed | Missing/invalid fields |
| 401 | Unauthorized | Missing/invalid token |
| 500 | Server error | Backend issue |

**Error handling in component:**
```javascript
const loginMutation = useLogin({
  onError: (error) => {
    const message = error.response?.data?.message || 'Login failed';
    toast.error(message);
  }
});
```

---

## Password Security

- Minimum 8 characters required
- Should contain uppercase, lowercase, and numbers
- Never sent in plain text (HTTPS required)
- Always hashed server-side

---

## Related Components

- **Login.jsx** - User login form
- **Register.jsx** - User registration form

---

## Related Documentation

- [API_DEPENDENCY_MAP.md](../API_DEPENDENCY_MAP.md#-authentication-pages)
- [axiosInstance.jsx](../../../apis/axiosInstance.jsx) - Core infrastructure
