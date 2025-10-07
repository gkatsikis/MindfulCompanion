import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { checkAuthStatus, logout as logoutService } from '../services/authService';


interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    date_joined: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use the auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Provider component
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication status on app load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authData = await checkAuthStatus();
                if (authData && authData.user) {
                    setUser(authData.user);
                }
            } catch (error) {
                console.error('Failed to check auth status:', error);
                // User remains null, which means not logged in
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await logoutService();
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
            // Still clear local state even if server request fails
            setUser(null);
        }
    };

    const updateUser = (userData: User) => {
        setUser(userData);
    };

    const value: AuthContextType = {
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};