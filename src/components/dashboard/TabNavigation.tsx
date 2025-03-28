import React, { useState, useEffect } from 'react';
import { FaHome, FaDog, FaUsers, FaCalendarAlt, FaSitemap } from 'react-icons/fa';

interface TabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  keyboardShortcut: string;
  badgeCount?: number;
}

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsTabTransitioning: (isTransitioning: boolean) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  setActiveTab,
  setIsTabTransitioning 
}) => {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const tabs: TabProps[] = [
    { id: 'overview', label: 'Overview', icon: <FaHome />, keyboardShortcut: 'Alt+1' },
    { id: 'dogs', label: 'Dog Registration', icon: <FaDog />, keyboardShortcut: 'Alt+2', badgeCount: 5 },
    { id: 'users', label: 'User Activity', icon: <FaUsers />, keyboardShortcut: 'Alt+3' },
    { id: 'events', label: 'Events & Health', icon: <FaCalendarAlt />, keyboardShortcut: 'Alt+4', badgeCount: 2 },
    { id: 'pedigree', label: 'Pedigree Analytics', icon: <FaSitemap />, keyboardShortcut: 'Alt+5' }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        const shortcutIndex = Number(e.key);
        if (shortcutIndex >= 1 && shortcutIndex <= tabs.length) {
          const newTabId = tabs[shortcutIndex - 1].id;
          handleTabChange(newTabId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      setIsTabTransitioning(true);
      setActiveTab(tabId);
      localStorage.setItem('adminDashboardTab', tabId);
      
      // Simulate loading delay for tab transition
      setTimeout(() => {
        setIsTabTransitioning(false);
      }, 300);
    }
  };

  return (
    <>
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              id={`${tab.id}-tab`}
              aria-controls={`${tab.id}-panel`}
              aria-selected={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-colors
                ${activeTab === tab.id
                  ? 'bg-white text-green-600 border-t-2 border-green-600 shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              data-tooltip-id="tab-tooltip"
              data-tooltip-content={`${tab.label} (${tab.keyboardShortcut})`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.badgeCount && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.badgeCount}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="ml-2 p-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            aria-label="Keyboard shortcuts"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Keyboard Shortcuts</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {tabs.map((tab) => (
                  <div key={tab.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="mr-2 text-gray-500">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{tab.keyboardShortcut}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TabNavigation;
