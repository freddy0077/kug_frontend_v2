'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ApolloError } from '@apollo/client';

// Component that uses searchParams wrapped in Suspense
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectPath, setRedirectPath] = useState('/dashboard');

  // Extract redirect path from URL parameters if it exists
  useEffect(() => {
    const redirect = searchParams?.get('redirect');
    if (redirect) {
      setRedirectPath(decodeURIComponent(redirect));
    }
    
    // If already authenticated, redirect immediately
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [searchParams, isAuthenticated, router, redirectPath]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the login method from our Auth context
      const user = await login(formData.email, formData.password);
      
      // Check if we have a redirect path from the URL
      if (redirectPath && redirectPath !== '/dashboard') {
        router.push(redirectPath);
        return;
      }
      
      // Otherwise redirect based on user role
      if (user?.role) {
        switch (user.role) {
          case 'ADMIN':
            router.push('/admin/dashboard');
            break;
          case 'OWNER':
          case 'BREEDER':
          case 'HANDLER':
            router.push('/user/dashboard');
            break;
          case 'CLUB':
            router.push('/club-events');
            break;
          default:
            router.push('/dashboard');
            break;
        }
      } else {
        // Default fallback if role not found
        router.push('/dashboard');
      }
    } catch (err) {
      const apolloError = err as ApolloError;
      // Extract a more specific error message if available
      if (apolloError.graphQLErrors?.length > 0) {
        setError(apolloError.graphQLErrors[0].message);
      } else {
        setError('Authentication failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to PedigreeTrack</h1>
            <p className="text-gray-600 mt-2">Sign in to access your dog pedigree management system</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link 
                  href="/auth/forgot-password"
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center mb-6">
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link 
                href="/auth/register" 
                className="font-medium text-green-600 hover:text-green-800"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-center text-xs text-gray-600">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-green-600 hover:text-green-800">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-green-600 hover:text-green-800">
              Privacy Policy
            </Link>
          </div>
          <div className="text-center text-xs text-gray-600 mt-2">
            PedigreeTrack - Your comprehensive dog pedigree management system
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Login component with Suspense boundary
export default function Login() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
