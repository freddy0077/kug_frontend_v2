"use client";

import { useEffect, useCallback } from 'react';
import { Tab } from '../../users/types';

interface TabsNavigationProps {
  tabs: Tab[];
  activeTab: number;
  onTabChange: (index: number) => void;
  isTabTransitioning: boolean;
}

const TabsNavigation: React.FC<TabsNavigationProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange,
  isTabTransitioning
}) => {
  // Handle keyboard shortcuts for tab navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key >= '1' && e.key <= '5') {
        const tabIndex = parseInt(e.key) - 1;
        if (tabIndex >= 0 && tabIndex < tabs.length) {
          onTabChange(tabIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tabs, onTabChange]);
  
  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('userManagementActiveTab', activeTab.toString());
  }, [activeTab]);

  return (
    <div className="mt-8">
      <div className="flex overflow-x-auto space-x-1 p-1 bg-gray-100 rounded-xl">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => onTabChange(idx)}
            className={`w-full py-3 text-sm font-medium leading-5 rounded-lg transition-colors duration-200 ease-in-out flex-shrink-0
              ${activeTab === idx 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              } 
              ${isTabTransitioning ? 'pointer-events-none' : ''}
            `}
            id={`tab-${idx}`}
            role="tab"
            aria-controls={`tab-panel-${idx}`}
            aria-selected={activeTab === idx}
            aria-label={`${tab.name} (Alt+${idx + 1})`}
            title={`${tab.name} (Alt+${idx + 1})`}
            disabled={isTabTransitioning}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="h-5 w-5">{tab.icon}</span>
              <span>{tab.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabsNavigation;
