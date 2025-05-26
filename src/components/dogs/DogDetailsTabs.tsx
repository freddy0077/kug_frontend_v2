'use client';

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface TabItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  shortcut?: string;
}

interface DogDetailsTabsProps {
  dogId: string;
  activeTab?: string;
  onTabChange?: (tabIndex: number) => void;
  children: React.ReactNode;
}

const DogDetailsTabs: React.FC<DogDetailsTabsProps> = ({ 
  dogId, 
  activeTab, 
  onTabChange,
  children 
}) => {
  // Define tabs
  const tabs: TabItem[] = [
    { 
      id: 'profile', 
      name: 'Profile', 
      shortcut: '1',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: 'pedigree', 
      name: 'Pedigree', 
      shortcut: '2',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      id: 'health', 
      name: 'Health', 
      shortcut: '3',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    { 
      id: 'competitions', 
      name: 'Competitions', 
      shortcut: '4',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'gallery', 
      name: 'Gallery', 
      shortcut: '5',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  // Local storage key specific to this dog
  const localStorageKey = `dog-${dogId}-tab`;
  
  // Use local storage to remember the last selected tab
  const [savedTabIndex, setSavedTabIndex] = useLocalStorage<number>(localStorageKey, 0);
  const [selectedIndex, setSelectedIndex] = useState<number>(savedTabIndex);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key >= '1' && event.key <= '5') {
        const tabIndex = parseInt(event.key) - 1;
        if (tabIndex >= 0 && tabIndex < tabs.length) {
          setSelectedIndex(tabIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tabs.length]);

  // Set initial tab from prop if provided
  useEffect(() => {
    if (activeTab) {
      const tabIndex = tabs.findIndex(tab => tab.id === activeTab);
      if (tabIndex !== -1) {
        setSelectedIndex(tabIndex);
      }
    }
  }, [activeTab, tabs]);

  // Update saved tab when selection changes
  const handleTabChange = (index: number) => {
    setSelectedIndex(index);
    setSavedTabIndex(index);
    if (onTabChange) {
      onTabChange(index);
    }
  };

  return (
    <div className="w-full">
      <Tab.Group selectedIndex={selectedIndex} onChange={handleTabChange}>
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tab.List className="flex space-x-1 overflow-x-auto pb-1 scrollbar-hide">
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  className={({ selected }) =>
                    `flex-1 min-w-0 whitespace-nowrap px-3 py-2.5 text-sm font-medium leading-5 rounded-md 
                    focus:outline-none focus:ring-2 ring-offset-2 ring-offset-green-400 ring-white ring-opacity-60
                    transition-all duration-150 ease-out
                    ${selected 
                      ? 'bg-green-600 text-white shadow'
                      : 'text-gray-600 hover:bg-green-50 hover:text-green-700'}`
                  }
                  aria-label={`Tab ${tab.name} - Press Alt+${tab.shortcut} for shortcut`}
                  data-tooltip-content={`Press Alt+${tab.shortcut} for shortcut`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {tab.icon}
                    <span>{tab.name}</span>
                    {tab.shortcut && (
                      <span className="hidden md:inline-block text-xs opacity-70 ml-1">
                        Alt+{tab.shortcut}
                      </span>
                    )}
                  </div>
                </Tab>
              ))}
            </Tab.List>
          </div>
        </div>
        <Tab.Panels className="mt-6">
          {children}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default DogDetailsTabs;
