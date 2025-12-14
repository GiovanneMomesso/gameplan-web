import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLogin, useLogout } from '../api';
import { tokenStorage } from '../api/utils/tokenStorage';
import { LoginRequest } from '../api/models';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    isInitializing: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isInitializing, setIsInitializing] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loginMutation = useLogin();
    const { logout: logoutFn } = useLogout();

    // Check authentication status on mount
    useEffect(() => {
        const token = tokenStorage.getToken();
        setIsAuthenticated(!!token);
        setIsInitializing(false);
    }, []);

    const login = async (credentials: LoginRequest) => {
        setIsLoading(true);
        setError(null);

        try {
            await loginMutation.mutateAsync(credentials);
            setIsAuthenticated(true);
        } catch (err: any) {
            const errorMessage = err?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        logoutFn();
        setIsAuthenticated(false);
        tokenStorage.removeToken();
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                login,
                logout,
                isLoading,
                isInitializing,
                error,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
