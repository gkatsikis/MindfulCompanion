const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterCredentials {
    email: string;
    password1: string;
    password2: string;
    first_name?: string;
    last_name?: string;
}

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    date_joined: string;
}

interface AuthResponse {
    access_token?: string;
    refresh_token?: string;
    user: User;
    message?: string;
}

interface CSRFResponse {
    csrfToken: string;
}

export const getCSRFToken = async (): Promise<string> => {
    try {
        const response = await fetch(`${BASE_URL}/api/csrf/`, {
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: CSRFResponse = await response.json();
        return data.csrfToken;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        throw error;
    }
};

const getStoredToken = (): string | null => {
    return localStorage.getItem('access_token');
};

const storeToken = (token: string): void => {
    localStorage.setItem('access_token', token);
};

const removeToken = (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const csrfToken = await getCSRFToken();
        
        const response = await fetch(`${BASE_URL}/accounts/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw new Error(`Login failed! Status: ${response.status}`);
        }

        const data: AuthResponse = await response.json();
        
        if (data.access_token) {
            storeToken(data.access_token);
        }
        
        return data;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

// Traditional registration
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
        const csrfToken = await getCSRFToken();
        
        const response = await fetch(`${BASE_URL}/accounts/signup/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw new Error(`Registration failed! Status: ${response.status}`);
        }

        const data: AuthResponse = await response.json();
        
        if (data.access_token) {
            storeToken(data.access_token);
        }
        
        return data;
    } catch (error) {
        console.error('Error during registration:', error);
        throw error;
    }
};

// Google OAuth login (popup method)
export const loginWithGoogle = async (): Promise<void> => {

    sessionStorage.setItem('auth_redirect', window.location.pathname);
    
    window.location.href = `${BASE_URL}/accounts/google/login/?process=login`;
};

// Check current authentication status
export const checkAuthStatus = async (): Promise<AuthResponse | null> => {
    try {
        const response = await fetch(`${BASE_URL}/api/user/`, {
            headers: {
                'Authorization': `Bearer ${getStoredToken()}`,
            },
            credentials: 'include',
        });

        if (response.status == 401) {
            removeToken();
            return null;
        }

        if (!response.ok) {
            removeToken();
            return null;
        }

        const data: AuthResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking auth status:', error);
        removeToken();
        return null;
    }
};


export const logout = async (): Promise<void> => {
    try {
        const csrfToken = await getCSRFToken();
        
        await fetch(`${BASE_URL}/api/logout/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
        });
        
        removeToken();
    } catch (error) {
        console.error('Error during logout:', error);
        // Still remove tokens locally even if server request fails
        removeToken();
        throw error;
    }
};

// Helper to make authenticated requests
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = getStoredToken();
    
    const headers = {
        ...options.headers,
        'Authorization': token ? `Bearer ${token}` : '',
    };

    return fetch(url, {
        ...options,
        headers,
        credentials: 'include',
    });
};