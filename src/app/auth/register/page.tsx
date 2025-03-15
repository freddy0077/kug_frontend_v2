'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { REGISTER_MUTATION } from '@/graphql/mutations/userMutations';
import { useAuth } from '@/contexts/AuthContext';
import { SITE_NAME, SITE_DESCRIPTION } from '@/config/site';

export default function Register() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userRole: 'OWNER', // Using enum value expected by API
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions.');
      setIsLoading(false);
      return;
    }

    try {
      // Call the register mutation with GraphQL
      const response = await registerMutation({
        variables: {
          input: {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: formData.userRole
          }
        }
      });
      
      if (response.data?.register) {
        const { token, expiresAt } = response.data.register;
        
        // Store the token and expiration
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_expiration', expiresAt);
        
        // Refresh user data in context
        await refreshUser();
        
        // Redirect to management dashboard after successful registration
        router.push('/manage');
      }
    } catch (err: any) {
      if (err.graphQLErrors?.length > 0) {
        setError(err.graphQLErrors[0].message);
      } else {
        setError('Registration failed. Please try again.');
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
            <h1 className="text-3xl font-bold text-gray-900">Create an Account</h1>
            <p className="text-gray-600 mt-2">Join {SITE_NAME} and start managing your dog pedigrees</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with a mix of letters, numbers, and symbols.
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="userRole" className="block text-sm font-medium text-gray-700 mb-1">
                  I am a:
                </label>
                <div className="mt-1">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="role-owner"
                        name="userRole"
                        type="radio"
                        value="OWNER"
                        checked={formData.userRole === 'OWNER'}
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label htmlFor="role-owner" className="ml-2 block text-sm text-gray-700">
                        Dog Owner
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="role-breeder"
                        name="userRole"
                        type="radio"
                        value="BREEDER"
                        checked={formData.userRole === 'BREEDER'}
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label htmlFor="role-breeder" className="ml-2 block text-sm text-gray-700">
                        Breeder
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="role-handler"
                        name="userRole"
                        type="radio"
                        value="HANDLER"
                        checked={formData.userRole === 'HANDLER'}
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label htmlFor="role-handler" className="ml-2 block text-sm text-gray-700">
                        Handler/Trainer
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="role-club"
                        name="userRole"
                        type="radio"
                        value="ORGANIZATION"
                        checked={formData.userRole === 'ORGANIZATION'}
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label htmlFor="role-club" className="ml-2 block text-sm text-gray-700">
                        Kennel Club/Organization
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <input
                id="accept-terms"
                name="acceptTerms"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                checked={formData.acceptTerms}
                onChange={handleChange}
                required
              />
              <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-700">
                I accept the{' '}
                <Link href="/terms" className="text-green-600 hover:text-green-800">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-green-600 hover:text-green-800">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
                className="font-medium text-green-600 hover:text-green-800"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-center text-xs text-gray-600">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-green-600 hover:text-green-800">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-green-600 hover:text-green-800">
              Privacy Policy
            </Link>
          </div>
          <div className="text-center text-xs text-gray-600 mt-2">
            {SITE_NAME} - {SITE_DESCRIPTION}
          </div>
        </div>
      </div>
    </div>
  );
}
