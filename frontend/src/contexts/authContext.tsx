import React, { useState, useEffect, type ReactNode } from 'react';
import { AuthContext, type User, type AuthContextType } from './useAuth';
import { checkAuthStatus, logout as logoutService } from '../services/authService';

export type { User, AuthContextType } from './useAuth';


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