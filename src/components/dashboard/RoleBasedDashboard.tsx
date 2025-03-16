'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { hasPermission, UserRole } from '@/utils/permissionUtils';

type DashboardWidgetProps = {
  title: string;
  count: number;
  description: string;
  link: string;
  linkText: string;
  icon: React.ReactNode;
  colorClass: string;
};

const DashboardWidget = ({
  title,
  count,
  description,
  link,
  linkText,
  icon,
  colorClass
}: DashboardWidgetProps) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-t-4 ${colorClass}`}>
    <div className="flex items-center mb-4">
      <div className="mr-4">{icon}</div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    </div>
    <div className="mb-4">
      <span className="text-3xl font-bold text-gray-900">{count}</span>
    </div>
    <Link href={link} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
      {linkText} →
    </Link>
  </div>
);

type UserData = {
  id: string;
  name: string;
  role: UserRole;
  ownedDogs: number;
  upcomingEvents: number;
  pendingHealthRecords: number;
  recentCompetitions: number;
  activeLitters: number;
  upcomingBreedings: number;
  managedEvents: number;
};

export default function RoleBasedDashboard() {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.VIEWER);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // In a real application, this would be fetched from an API
    const storedRole = localStorage.getItem('userRole') || 'VIEWER';
    const uid = localStorage.getItem('userId') || '1'; // Default to '1' for demo
    
    // Convert stored string role to UserRole enum
    const role = storedRole as UserRole;
    setUserRole(role);
    setUserId(uid);
    
    // Simulate API call to get user data
    setTimeout(() => {
      // Mock data based on user role
      const mockData: UserData = {
        id: uid,
        name: 'John Doe',
        role: role as UserRole,
        ownedDogs: 5,
        upcomingEvents: 3,
        pendingHealthRecords: 2,
        recentCompetitions: 4,
        activeLitters: role === UserRole.OWNER ? 2 : 0,
        upcomingBreedings: role === UserRole.OWNER ? 1 : 0,
        managedEvents: role === UserRole.CLUB ? 3 : 0,
      };
      
      setUserData(mockData);
      setIsLoading(false);
    }, 800);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-red-50 p-4 rounded-md mb-6">
        <p className="text-red-700">Failed to load dashboard data. Please try again later.</p>
      </div>
    );
  }

  // Common widgets for all users
  const commonWidgets = [
    {
      title: 'My Dogs',
      count: userData.ownedDogs,
      description: 'Dogs owned or managed by you',
      link: '/manage/dogs',
      linkText: 'View All Dogs',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      colorClass: 'border-blue-500',
    },
    {
      title: 'Upcoming Events',
      count: userData.upcomingEvents,
      description: 'Shows and events in next 30 days',
      link: '/events',
      linkText: 'View Calendar',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      colorClass: 'border-green-500',
    },
  ];

  // Role-specific widgets
  const roleSpecificWidgets = [];

  // Owner-specific widgets
  if (userRole === UserRole.OWNER || userRole === UserRole.ADMIN) {
    roleSpecificWidgets.push({
      title: 'Health Records',
      count: userData.pendingHealthRecords,
      description: 'Records needing attention',
      link: '/health-records',
      linkText: 'Manage Health Records',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      colorClass: 'border-red-500',
    });
  }

  // Handler-specific widgets
  if (userRole === UserRole.HANDLER || userRole === UserRole.ADMIN) {
    roleSpecificWidgets.push({
      title: 'Recent Competitions',
      count: userData.recentCompetitions,
      description: 'Competitions in last 90 days',
      link: '/competitions',
      linkText: 'View Competition Results',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      colorClass: 'border-yellow-500',
    });
  }

  // Owner-specific breeding widgets
  if (userRole === UserRole.OWNER || userRole === UserRole.ADMIN) {
    roleSpecificWidgets.push({
      title: 'Active Litters',
      count: userData.activeLitters,
      description: 'Current litters being managed',
      link: '/breeding-programs/litters',
      linkText: 'Manage Litters',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      colorClass: 'border-purple-500',
    });

    roleSpecificWidgets.push({
      title: 'Planned Breedings',
      count: userData.upcomingBreedings,
      description: 'Upcoming breeding plans',
      link: '/breeding-programs/planned-matings',
      linkText: 'View Breeding Plans',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      colorClass: 'border-indigo-500',
    });
  }

  // Club-specific widgets
  if (userRole === UserRole.CLUB || userRole === UserRole.ADMIN) {
    roleSpecificWidgets.push({
      title: 'Managed Events',
      count: userData.managedEvents,
      description: 'Events organized by your club',
      link: '/club-events',
      linkText: 'Manage Club Events',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      colorClass: 'border-amber-500',
    });
  }

  // Admin-specific widgets
  if (userRole === UserRole.ADMIN) {
    roleSpecificWidgets.push({
      title: 'User Management',
      count: 42, // Example total user count
      description: 'Manage system users',
      link: '/admin/users',
      linkText: 'View All Users',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      colorClass: 'border-gray-500',
    });
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {commonWidgets.map((widget, index) => (
          hasPermission(userRole, 'dog', 'view') && (
            <DashboardWidget
              key={`common-${index}`}
              title={widget.title}
              count={widget.count}
              description={widget.description}
              link={widget.link}
              linkText={widget.linkText}
              icon={widget.icon}
              colorClass={widget.colorClass}
            />
          )
        ))}
        
        {roleSpecificWidgets.map((widget, index) => (
          <DashboardWidget
            key={`role-${index}`}
            title={widget.title}
            count={widget.count}
            description={widget.description}
            link={widget.link}
            linkText={widget.linkText}
            icon={widget.icon}
            colorClass={widget.colorClass}
          />
        ))}
      </div>
    </div>
  );
}
