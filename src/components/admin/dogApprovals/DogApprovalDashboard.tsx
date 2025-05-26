import React, { useState, useEffect } from 'react';
import { ApprovalStatus } from '@/types/enums';
import { DogSortField, SortDirection } from '@/graphql/queries/dogQueries';
import StatisticsPanel from './StatisticsPanel';
import FilterControls from './FilterControls';
import StatusTabs from './StatusTabs';
import DogApprovalGrid from './DogApprovalGrid';
import BatchActionBar from './BatchActionBar';
import { useRouter } from 'next/navigation';

const DogApprovalDashboard: React.FC = () => {
  // State for filters and sorting
  const [activeTab, setActiveTab] = useState<ApprovalStatus>(ApprovalStatus.PENDING);
  const [searchQuery, setSearchQuery] = useState('');
  const [breedFilter, setBreedFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<DogSortField>(DogSortField.CREATED_AT);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.DESC);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const router = useRouter();

  // Reset selection when changing tabs
  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab, searchQuery, breedFilter]);

  // Handle when approval status changes (after batch operation)
  const handleApprovalStatusChange = () => {
    // Force a refresh of the page data
    router.refresh();
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Handle selecting all visible dogs
  const handleSelectAll = (dogs: any[]) => {
    if (selectedIds.length === dogs.length) {
      // If all are selected, clear selection
      setSelectedIds([]);
    } else {
      // Otherwise select all
      setSelectedIds(dogs.map(dog => dog.id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Statistics Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <StatisticsPanel />
      </div>
      
      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Filters & Search */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <FilterControls
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            breedFilter={breedFilter}
            setBreedFilter={setBreedFilter}
            sortField={sortField}
            setSortField={setSortField}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
          />
        </div>
        
        {/* Tabs Navigation */}
        <StatusTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Dog Grid with optional batch action bar */}
        <div className="p-6">
          {selectedIds.length > 0 && (
            <BatchActionBar
              selectedIds={selectedIds}
              clearSelection={clearSelection}
              onCompletedActions={handleApprovalStatusChange}
            />
          )}
          
          <DogApprovalGrid
            activeTab={activeTab}
            searchQuery={searchQuery}
            breedFilter={breedFilter}
            sortField={sortField}
            sortDirection={sortDirection}
            onApprovalStatusChange={handleApprovalStatusChange}
            onSelectAll={handleSelectAll}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
        </div>
      </div>
      
      {/* Keyboard shortcut help */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg mr-2">a</kbd>
            <span className="text-gray-600">Approve selected dog</span>
          </div>
          <div className="flex items-center">
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg mr-2">d</kbd>
            <span className="text-gray-600">Decline selected dog</span>
          </div>
          <div className="flex items-center">
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg mr-2">Esc</kbd>
            <span className="text-gray-600">Clear selection</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DogApprovalDashboard;
