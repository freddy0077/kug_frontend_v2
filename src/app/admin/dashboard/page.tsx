"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../../../graphql/queries/userQueries';

// Import tab components
import TabNavigation from '../../../components/dashboard/TabNavigation';
import OverviewTab from '../../../components/dashboard/tabs/OverviewTab';
import DogRegistrationTab from '../../../components/dashboard/tabs/DogRegistrationTab';
import UserActivityTab from '../../../components/dashboard/tabs/UserActivityTab';
import EventsHealthTab from '../../../components/dashboard/tabs/EventsHealthTab';
import PedigreeAnalyticsTab from '../../../components/dashboard/tabs/PedigreeAnalyticsTab';

export default function AdminDashboard() {
  // Tab state management
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminDashboardTab') || 'overview';
    }
    return 'overview';
  });
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  
  // User info query
  const { data } = useQuery(GET_CURRENT_USER);
  const userName = data?.me?.fullName || 'Admin';

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Admin Dashboard Header */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
              <h1 className="text-white text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-green-100">Welcome back, {userName}. Here's what's happening today.</p>
            </div>
            
            {/* Tab Navigation */}
            <div className="p-6 bg-white border-b">
              <TabNavigation 
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
                setIsTabTransitioning={setIsTabTransitioning}
              />
            </div>
          </div>
          
          {/* Loading indicator when transitioning between tabs */}
          {isTabTransitioning && (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {/* Tab Content */}
          {!isTabTransitioning && activeTab === 'overview' && <OverviewTab />}
          {!isTabTransitioning && activeTab === 'dogs' && <DogRegistrationTab />}
          {!isTabTransitioning && activeTab === 'users' && <UserActivityTab />}
          {!isTabTransitioning && activeTab === 'events' && <EventsHealthTab />}
          {!isTabTransitioning && activeTab === 'pedigree' && <PedigreeAnalyticsTab />}
        </div>
      </div>
    </>
  );
}