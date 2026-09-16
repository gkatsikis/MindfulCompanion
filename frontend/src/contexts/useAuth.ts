import { createContext, useContext } from 'react';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

// Lives here, not next to the provider, so that file exports only a component (fast refresh)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
