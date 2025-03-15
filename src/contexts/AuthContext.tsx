import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, ApolloError } from '@apollo/client';
import { GET_CURRENT_USER } from '@/graphql/queries/userQueries';
import { LOGIN_MUTATION } from '@/graphql/mutations/userMutations';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  profileImageUrl?: string;
  isActive: boolean;
  lastLogin?: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: ApolloError | Error | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApolloError | Error | null>(null);
  const router = useRouter();

  const { refetch } = useQuery(GET_CURRENT_USER, {
    skip: !isTokenPresent(),
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
      }
      setLoading(false);
    },
    onError: (error) => {
      // If the token is invalid, clear it
      if (error.message.includes('Authentication')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_expiration');
      }
      setError(error);
      setLoading(false);
    }
  });

  const [loginMutation] = useMutation(LOGIN_MUTATION);

  // Check if token exists and is not expired
  function isTokenPresent(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('auth_token');
    const expiration = localStorage.getItem('auth_expiration');
    
    if (!token || !expiration) return false;
    
    const expirationDate = new Date(expiration);
    return expirationDate > new Date();
  }

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (isTokenPresent()) {
        try {
          await refreshUser();
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await loginMutation({
        variables: { email, password }
      });
      
      if (data?.login) {
        const { token, user, expiresAt } = data.login;
        
        // Store token and expiration
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_expiration', expiresAt);
        
        setUser(user);
        return user;
      }
      
      throw new Error('Login failed');
    } catch (err) {
      setError(err as ApolloError | Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_expiration');
    setUser(null);
    router.push('/auth/login');
  };

  const refreshUser = async () => {
    try {
      setLoading(true);
      const { data } = await refetch();
      if (data?.me) {
        setUser(data.me);
      }
    } catch (err) {
      setError(err as ApolloError | Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
