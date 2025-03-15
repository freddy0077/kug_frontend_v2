'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SITE_NAME } from '@/config/site';

// Define menu items with their roles
interface MenuItem {
  href: string;
  label: string;
  roles: string[];
}

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Menu items with role-based access control
  const menuItems: MenuItem[] = [
    { href: '/', label: 'Home', roles: [] }, // Available to all
    { href: '/dogs', label: 'Dogs', roles: [] }, // Available to all
    // Dynamic dashboard link based on user role
    { 
      href: '#', // This will be overridden in filterMenuItems
      label: 'Dashboard', 
      roles: ['ADMIN', 'OWNER', 'BREEDER', 'HANDLER', 'CLUB'] // Available to authenticated users
    },
    { href: '/pedigrees', label: 'Pedigrees', roles: ['ADMIN', 'OWNER', 'BREEDER', 'HANDLER', 'CLUB'] }, // Authenticated users only
    { href: '/breeds', label: 'Breeds', roles: ['ADMIN', 'OWNER', 'BREEDER', 'HANDLER', 'CLUB'] }, // Authenticated users only
    // { href: '/health-records', label: 'Health Records', roles: ['ADMIN', 'OWNER', 'BREEDER', 'HANDLER'] },
    // { href: '/competitions', label: 'Competitions', roles: ['ADMIN', 'OWNER', 'HANDLER', 'CLUB'] },
    // { href: '/ownerships', label: 'Ownerships', roles: ['ADMIN', 'OWNER', 'BREEDER', 'CLUB'] },
    // { href: '/breeding-programs', label: 'Breeding Programs', roles: ['BREEDER'] },
    // { href: '/club-events', label: 'Club Events', roles: ['CLUB'] },
    // { href: '/about', label: 'About', roles: [] } // Available to all
  ];

  // Dashboard link depends on user role
  const getDashboardLink = () => {
    if (!user) return { href: '/user-dashboard', label: 'Dashboard' };

    return user.role === 'ADMIN'
      ? { href: '/dashboard', label: 'Admin Dashboard' }
      : { href: '/user-dashboard', label: 'Dashboard' };
  };

  // Filter menu items based on user role
  const filterMenuItems = (items: MenuItem[]) => {
    // If user is not authenticated, show all public items
    if (!isAuthenticated) {
      return items.filter(item => item.roles.length === 0);
    }
    
    // Get normalized user role
    const normalizedUserRole = (user?.role || '').toUpperCase();
    
    // Process the menu items, adjusting the dashboard URL based on role
    const processedItems = items.map(item => {
      // If this is the dashboard menu item, update its href based on role
      if (item.label === 'Dashboard') {
        return {
          ...item,
          href: normalizedUserRole === 'ADMIN' ? '/dashboard' : '/user-dashboard'
        };
      }
      return item;
    });
    
    // If user is not an admin, only show the public items and dashboard
    if (normalizedUserRole !== 'ADMIN') {
      return processedItems.filter(item => 
        item.roles.length === 0 || // Public items
        item.label === 'Dashboard' // Dashboard is always visible for logged-in users
      );
    }
    
    // For admin users, show all items
    return processedItems;
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };


  
  // Add effect to close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownRef]);

  const filteredMenuItems = filterMenuItems(menuItems);
  const dashboardLink = getDashboardLink();

  return (
    <nav className="bg-gray-900 text-white py-4 px-6">


      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-green-500">{SITE_NAME}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {filteredMenuItems.map((item, index) => (
            <Link
              key={`desktop-${item.href}-${index}`}
              href={item.href}
              className="hover:text-green-400 transition"
            >
              {item.label}
            </Link>
          ))}

          {/* Authenticated user links */}
          {isAuthenticated && (
            <>
              {/* <Link
                href={dashboardLink.href}
                className="hover:text-green-400 transition"
              >
                {dashboardLink.label}
              </Link> */}
              {/* <Link href="/manage" className="hover:text-green-400 transition">
                Manage
              </Link> */}
            </>
          )}
        </div>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4" ref={profileDropdownRef}>
              {/* Profile dropdown trigger */}
              <div 
                className="flex items-center cursor-pointer" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="relative h-8 w-8 mr-2 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <Image 
                      src={user.profileImageUrl} 
                      alt={user?.fullName || 'User'}
                      layout="fill"
                      objectFit="cover"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.fullName || user?.email}</span>
                  {user?.role && (
                    <span className="text-xs text-gray-400">{user.role}</span>
                  )}
                </div>
                <svg 
                  className={`ml-2 h-5 w-5 text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Profile dropdown menu */}
              {profileDropdownOpen && (
                <div className="absolute top-16 right-6 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                  <Link 
                    href={dashboardLink.href}
                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    {dashboardLink.label}
                  </Link>
                  <Link 
                    href="/profile/settings"
                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <hr className="my-1 border-gray-700" />
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded hover:bg-gray-800 transition"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-700">
          <div className="flex flex-col space-y-3 px-4">
            {filteredMenuItems.map((item, index) => (
              <Link
                key={`mobile-${item.href}-${index}`}
                href={item.href}
                className="hover:text-green-400 py-2 transition"
              >
                {item.label}
              </Link>
            ))}

            {/* Authenticated user links */}
            {isAuthenticated && (
              <>
                <Link
                  href={dashboardLink.href}
                  className="hover:text-green-400 py-2 transition flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {dashboardLink.label}
                </Link>
                <Link
                  href="/profile/settings"
                  className="hover:text-green-400 py-2 transition flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Profile Settings
                </Link>
              </>
            )}

            <div className="flex flex-col space-y-2 pt-3 border-t border-gray-700">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center mr-3">
                      {user?.profileImageUrl ? (
                        <Image 
                          src={user.profileImageUrl} 
                          alt={user?.fullName || 'User'}
                          width={40}
                          height={40}
                          objectFit="cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user?.fullName || user?.email}</p>
                      {user?.role && (
                        <span className="bg-green-800 px-2 py-0.5 rounded-full text-xs inline-block">
                          {user.role}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 rounded hover:bg-gray-800 transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
