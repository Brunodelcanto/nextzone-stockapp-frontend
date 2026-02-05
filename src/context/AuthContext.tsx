/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from '../types/index'

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext =  createContext<AuthContextType | undefined> (undefined);

export const AuthProvider = ({ children }: { children: ReactNode}) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        const expiry = localStorage.getItem('expiryTime');

        if (!savedToken || !savedUser || !expiry) return null;

        if (Date.now() > parseInt(expiry)) {
            localStorage.clear();
            return null;
        }
            try {
                return JSON.parse(savedUser);
            } catch (error) {
                console.error('Error parsing saved user from localStorage:', error);
                return null;
            }
    });
    const [loading] = useState(false);

    const login = (token: string, user: User) => {
        const expiryTime = Date.now() +8 *60 *60 *1000;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('expiryTime', expiryTime.toString());

        setUser(user);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
