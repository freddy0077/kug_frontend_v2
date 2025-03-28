'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/utils/permissionUtils';
import { SITE_NAME } from '@/config/site';

// Define menu items with their roles
interface MenuItem {
  href: string;
  label: string;
  roles: UserRole[];
  submenu?: MenuItem[];
}

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Menu items with role-based access control
  const menuItems: MenuItem[] = [
    // Public menu items (available to all users)
    { href: '/', label: 'Home', roles: [] },
    { href: '/dogs', label: 'Dogs', roles: [] },
    
    // Dynamic dashboard link based on user role
    { 
      href: '#', // This will be overridden in filterMenuItems
      label: 'Dashboard', 
      roles: [UserRole.ADMIN, UserRole.OWNER, UserRole.HANDLER, UserRole.CLUB, UserRole.VIEWER]
    },
    
    // Admin sections
    { 
      href: '#',
      label: 'Admin Panel', 
      roles: [UserRole.ADMIN],
      submenu: [
        { href: '/admin/users', label: 'User Management', roles: [UserRole.ADMIN] },
        { href: '/admin/roles', label: 'Role Management', roles: [UserRole.ADMIN] },
        { href: '/admin/dog-approvals', label: 'Dog Approvals', roles: [UserRole.ADMIN] },
        { href: '/admin/logs', label: 'System Logs', roles: [UserRole.ADMIN] },
      ]
    },
    
    // Dog Records and Registry
    { 
      href: '#',
      label: 'Dog Registry', 
      roles: [UserRole.ADMIN, UserRole.OWNER],
      submenu: [
        { href: '/pedigrees', label: 'Pedigrees', roles: [UserRole.ADMIN, UserRole.OWNER] },
        { href: '/breeds', label: 'Breeds', roles: [UserRole.ADMIN, UserRole.OWNER] },
        { href: '/dogs/new', label: 'Register New Dog', roles: [] },  // Empty roles array = accessible to any logged-in user
      ]
    },
    
    // Litter Management (for breeders/owners)
    { 
      href: '/litters', 
      label: 'Litters', 
      roles: [UserRole.ADMIN, UserRole.OWNER],
      submenu: [
        { href: '/litters', label: 'View All Litters', roles: [UserRole.ADMIN, UserRole.OWNER] },
        { href: '/litters/new', label: 'Register New Litter', roles: [UserRole.ADMIN, UserRole.OWNER] },
      ]
    },
    
    // Health & Competition Records
    { 
      href: '#',
      label: 'Records', 
      roles: [UserRole.ADMIN, UserRole.OWNER, UserRole.HANDLER, UserRole.CLUB],
      submenu: [
        { href: '/health-records', label: 'Health Records', roles: [UserRole.ADMIN, UserRole.OWNER] },
        { href: '/competitions', label: 'Competitions', roles: [UserRole.ADMIN, UserRole.OWNER, UserRole.HANDLER, UserRole.CLUB] },
        { href: '/ownerships', label: 'Ownership Records', roles: [UserRole.ADMIN, UserRole.OWNER] },
      ]
    },
    
    // Club specific menu (uncomment when needed)
    { 
      href: '#',
      label: 'Club Management', 
      roles: [UserRole.CLUB],
      submenu: [
        { href: '/club-events', label: 'Club Events', roles: [UserRole.CLUB] },
      ]
    },
    
    // Breeding Management
    // { 
    //   href: '#',
    //   label: 'Breeding', 
    //   roles: [UserRole.OWNER],
    //   submenu: [
    //     { href: '/breeding-programs', label: 'Breeding Programs', roles: [UserRole.ADMIN, UserRole.OWNER] },
    //     { href: '/breeding-programs/planned-matings', label: 'Planned Matings', roles: [UserRole.ADMIN, UserRole.OWNER] },
    //   ]
    // },
    
    // Tools Section
    // { 
    //   href: '#',
    //   label: 'Tools', 
    //   roles: [UserRole.ADMIN, UserRole.OWNER, UserRole.HANDLER],
    //   submenu: [
    //     { href: '/tools/genetic-calculator', label: 'Genetic Calculator', roles: [UserRole.ADMIN, UserRole.OWNER, UserRole.HANDLER] },
    //   ]
    // },
    
    // Resources Section
    { 
      href: '#',
      label: 'Resources', 
      roles: [],
      submenu: [
        // Education & Standards
        { href: '/resources/breeding-standards', label: 'Breeding Standards', roles: [] },
        { href: '/resources/health-guidelines', label: 'Health Guidelines', roles: [] },
        { href: '/resources/competition-rules', label: 'Competition Rules', roles: [] },
        
        // Tools
        // { href: '/tools/genetic-calculator', label: 'Genetic Calculator', roles: [] },
        // { href: '/tools/pedigree-analysis', label: 'Pedigree Analysis', roles: [] },
        // { href: '/tools/inbreeding-calculator', label: 'Inbreeding Calculator', roles: [] },
        
        // Registries & Databases
        // { href: '/breeds', label: 'Breed Database', roles: [] },
        // { href: '/pedigrees', label: 'Pedigree Database', roles: [] },
        // { href: '/health-records', label: 'Health Records Database', roles: [] },
        
        // Community
        // { href: '/events', label: 'Events Calendar', roles: [] },
        // { href: '/club-events', label: 'Club Events', roles: [] },
        // { href: '/competitions', label: 'Competitions', roles: [] },
        
        // Documentation
        // { href: '/docs/api-documentation', label: 'API Documentation', roles: [] },
        { href: '/docs/user-guides', label: 'User Guides', roles: [] },
        { href: '/docs/faqs', label: 'FAQs', roles: [] },
      ]
    },
  ];

  // Dashboard link depends on user role
  const getDashboardLink = () => {
    if (!user) return { href: '/user-dashboard', label: 'Dashboard' };

    return user.role === UserRole.ADMIN
      ? { href: '/admin/dashboard', label: 'Admin Dashboard' }
      : { href: '/user-dashboard', label: 'Dashboard' };
  };

  // Filter menu items based on user role
  const filterMenuItems = (items: MenuItem[]) => {
    // If user is not authenticated, show all public items
    if (!isAuthenticated) {
      return items.filter(item => item.roles.length === 0);
    }
    
    // Get user role
    const userRole = user?.role || UserRole.VIEWER;
    
    // Process the menu items, adjusting the dashboard URL based on role and handling submenus
    const processedItems = items.map(item => {
      // If this is the dashboard menu item, update its href based on role
      if (item.label === 'Dashboard') {
        return {
          ...item,
          href: userRole === UserRole.ADMIN ? '/admin/dashboard' : '/user-dashboard'
        };
      }
      
      // Process submenu items if they exist
      if (item.submenu) {
        // Only include submenu items that match user's role
        const filteredSubmenu = item.submenu.filter(subItem => 
          subItem.roles.length === 0 || // Public items
          // Check if current user role is in allowed roles
          (userRole && subItem.roles.some(role => role === userRole))
        );
        
        // Only return submenu parent if it has accessible children
        if (filteredSubmenu.length > 0) {
          return {
            ...item,
            submenu: filteredSubmenu
          };
        } else {
          return null; // Don't include empty submenus
        }
      }
      
      return item;
    }).filter(Boolean) as MenuItem[]; // Remove any null items
    
    // Filter the top-level items based on role
    // If user is not an admin, only show permitted items
    if (userRole !== UserRole.ADMIN) {
      return processedItems.filter(item => 
        item.roles.length === 0 || // Public items
        item.label === 'Dashboard' || // Dashboard is always visible for logged-in users
        // Check if current user role is in allowed roles
        (userRole && item.roles.some(role => role === userRole))
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
        <div className="hidden md:flex items-center space-x-6">
          {filteredMenuItems.map((item, index) => (
            <div key={`desktop-${index}`} className="relative group">
              {item.submenu ? (
                <>
                  <div 
                    className="flex items-center cursor-pointer hover:text-green-400 transition py-4"
                  >
                    <span className="font-medium">{item.label}</span>
                    <svg 
                      className="ml-1 h-4 w-4 text-gray-400 group-hover:text-green-400 transition-transform group-hover:rotate-180" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="absolute left-0 top-full mt-1 w-56 bg-gray-800 rounded-md shadow-lg py-2 z-20 hidden group-hover:block">
                    {item.submenu.map((subItem, subIndex) => (
                      <Link
                        key={`desktop-sub-${subIndex}`}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white"
                        onClick={() => router.push(subItem.href)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  className="font-medium hover:text-green-400 transition py-4"
                >
                  {item.label}
                </Link>
              )}
            </div>
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
                  
                  {/* Admin Section */}
                  {user?.role === UserRole.ADMIN && (
                    <>
                      <hr className="my-1 border-gray-700" />
                      <div className="px-4 py-1 text-xs font-semibold text-gray-400">Admin</div>
                      <Link 
                        href="/admin/users"
                        className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        User Management
                      </Link>
                      <Link 
                        href="/admin/roles"
                        className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Role Management
                      </Link>
                    </>
                  )}
                  
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
          <div className="flex flex-col px-4">
            {filteredMenuItems.map((item, index) => (
              <div key={`mobile-${index}`} className="py-2 border-b border-gray-700 last:border-b-0">
                {item.submenu ? (
                  <>
                    <div className="flex items-center justify-between py-2 text-white font-medium">
                      <span className="text-green-400">{item.label}</span>
                    </div>
                    <div className="pl-4 mt-1 space-y-0 border-l border-gray-700">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={`mobile-sub-${subIndex}`}
                          href={subItem.href}
                          className="block py-3 text-sm text-gray-300 hover:text-green-400 transition"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            router.push(subItem.href);
                          }}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block py-2 text-white hover:text-green-400 transition font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
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
