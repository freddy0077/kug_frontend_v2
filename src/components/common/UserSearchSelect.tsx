'use client';

import { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_USERS, GET_USER_BY_ID } from '@/graphql/queries/userQueries';

// Simple debounce implementation for search
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface User {
  id: string;
  email: string;
  fullName: string;
  role?: string;
  isActive?: boolean;
  owner?: {
    id: string;
    name: string;
  };
}

interface UserSearchSelectProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (userId: string) => void;
  excludeIds?: string[];
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
}

const UserSearchSelect = ({
  label,
  placeholder = 'Search for a user...',
  value,
  onChange,
  excludeIds = [],
  required = false,
  error,
  className = '',
  disabled = false
}: UserSearchSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Query to search users with pagination
  const [searchUsers, { data, loading, fetchMore }] = useLazyQuery(GET_USERS, {
    variables: {
      searchTerm: debouncedSearchTerm,
      limit: 10,
      offset: 0
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only'
  });
  
  // Query to get a specific user by ID when a value is provided
  const [getUserById, { data: userData, loading: userLoading }] = useLazyQuery(GET_USER_BY_ID, {
    fetchPolicy: 'network-only'
  });

  // Load selected user details when value changes
  useEffect(() => {
    if (value && !selectedUser) {
      // If we have a user ID but no user details, directly fetch the user by ID
      getUserById({
        variables: {
          id: value
        }
      });
    } else if (!value) {
      setSelectedUser(null);
    }
  }, [value, selectedUser, getUserById]);

  // Update search results when search term changes
  useEffect(() => {
    if (debouncedSearchTerm.length > 1 || debouncedSearchTerm === '') {
      searchUsers({
        variables: {
          searchTerm: debouncedSearchTerm,
          limit: 10,
          offset: 0
        }
      });
    }
  }, [debouncedSearchTerm, searchUsers]);

  // Set selected user when search data changes and there's a match for the value
  useEffect(() => {
    if (data?.users?.items && value) {
      const matchingUser = data.users.items.find((user: User) => user.id === value);
      if (matchingUser) {
        setSelectedUser(matchingUser);
      }
    }
  }, [data, value]);
  
  // Set selected user when user data is loaded by ID
  useEffect(() => {
    if (userData?.user && value === userData.user.id) {
      setSelectedUser(userData.user);
    }
  }, [userData, value]);

  // Filter out excluded users from results
  const filteredResults = data?.users?.items?.filter(
    (user: User) => !excludeIds.includes(user.id)
  ) || [];

  // Handle selection of a user
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    onChange(user.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Format user details for display
  const formatUserDisplay = (user: User) => {
    const details = [];
    details.push(user.fullName);
    if (user.email) details.push(user.email);
    if (user.role) details.push(user.role);
    if (user.owner?.name) details.push(`Owner: ${user.owner.name}`);

    return (
      <div className="flex flex-col">
        <div className="font-medium text-gray-900">{user.fullName}</div>
        <div className="text-xs text-gray-500">
          {details.slice(1).join(' • ')}
        </div>
      </div>
    );
  };

  // Load more results when scrolling to the bottom
  const handleLoadMore = () => {
    if (data?.users?.hasMore && !loading) {
      fetchMore({
        variables: {
          offset: data.users.items.length,
          searchTerm: debouncedSearchTerm,
          limit: 10
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            users: {
              ...fetchMoreResult.users,
              items: [...prev.users.items, ...fetchMoreResult.users.items]
            }
          };
        }
      });
    }
  };

  // Detect when scroll is near bottom to trigger load more
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 100;
    if (bottom) {
      handleLoadMore();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={`user-search-${label}`} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1">
        {selectedUser ? (
          <div
            className={`flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-green-500'
            }`}
            onClick={() => !disabled && setIsOpen(true)}
          >
            <div className="flex-1">{formatUserDisplay(selectedUser)}</div>
            {!disabled && (
              <button
                type="button"
                className="ml-2 text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(null);
                  onChange('');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              id={`user-search-${label}`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              disabled={disabled}
              className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                error ? 'border-red-300' : ''
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Error message */}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        {/* Dropdown for search results */}
        {isOpen && (
          <div
            className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm max-h-60"
            onBlur={() => setIsOpen(false)}
            onScroll={handleScroll}
          >
            {loading && searchTerm.length > 1 && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500"></div>
                <span className="ml-2 text-sm text-gray-600">Searching...</span>
              </div>
            )}

            {!loading && filteredResults.length === 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                {searchTerm.length > 1 ? 'No users found' : 'Type at least 2 characters to search'}
              </div>
            )}

            {filteredResults.map((user: User) => (
              <div
                key={user.id}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                onClick={() => handleSelectUser(user)}
              >
                {formatUserDisplay(user)}
              </div>
            ))}

            {!loading && data?.users?.hasMore && (
              <div className="text-center py-2 text-sm text-gray-500 border-t border-gray-100">
                Scroll for more results
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearchSelect;
