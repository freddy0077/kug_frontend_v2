'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Menu items with role-based access control
  const menuItems: MenuItem[] = [
    { href: '/', label: 'Home', roles: [] }, // Available to all
    { href: '/dogs', label: 'Dogs', roles: [] }, // Available to all
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
    if (!user) return { href: '/user/dashboard', label: 'Dashboard' };

    return { href: '/user/dashboard', label: 'Dashboard' };

    // return user.role === 'ADMIN'
      // ? { href: '/admin/dashboard', label: 'Admin Dashboard' }
      // : { href: '/user/dashboard', label: 'Dashboard' };
  };

  // Filter menu items based on user role
  const filterMenuItems = (items: MenuItem[]) => {
    // If user is not authenticated, show all public items
    if (!isAuthenticated) {
      return items.filter(item => item.roles.length === 0);
    }
    
    // Get normalized user role
    const normalizedUserRole = (user?.role || '').toUpperCase();
    
    // If user is not an admin, only show the Home and Dogs items
    if (normalizedUserRole !== 'ADMIN') {
      return items.filter(item => item.href === '/dogs' || item.href === '/');
    }
    
    // For admin users, show all items
    return items;
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Add effect to update debug info
  useEffect(() => {
    if (user) {
      setDebugInfo(`Current user role: ${user.role} (${typeof user.role})`);
    } else {
      setDebugInfo('No user logged in');
    }
  }, [user]);

  const filteredMenuItems = filterMenuItems(menuItems);
  // const dashboardLink = getDashboardLink();

  return (
    <nav className="bg-gray-900 text-white py-4 px-6">
      {/* Debug info - only visible during development */}
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <div className="bg-yellow-800 text-white p-2 mb-2 text-xs">
          {debugInfo}
        </div>
      )}

      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-green-500">Pedigree Database</span>
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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                {user?.role && (
                  <span className="bg-green-800 px-2 py-1 rounded-full text-xs mr-2">
                    {user.role}
                  </span>
                )}
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition"
              >
                Logout
              </button>
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
                {/* <Link
                  href={dashboardLink.href}
                  className="hover:text-green-400 py-2 transition"
                >
                  {dashboardLink.label}
                </Link> */}
                <Link
                  href="/manage"
                  className="hover:text-green-400 py-2 transition"
                >
                  Manage
                </Link>
              </>
            )}

            <div className="flex flex-col space-y-2 pt-3 border-t border-gray-700">
              {isAuthenticated ? (
                <>
                  <div className="text-sm text-gray-300 py-2">
                    {user?.role && (
                      <span className="bg-green-800 px-2 py-1 rounded-full text-xs mr-2">
                        {user.role}
                      </span>
                    )}
                    {user?.email}
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
