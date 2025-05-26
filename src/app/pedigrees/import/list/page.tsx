'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Container, Typography, Button, InputAdornment, TextField, Chip } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AppLayout from '@/components/layout/AppLayout';
import { GET_PEDIGREE_IMPORTS, PedigreeImportStatus } from '@/graphql/queries/pedigreeImportQueries';
import { UserRole } from '@/utils/permissionUtils';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { formatDate } from '@/utils/formatters';

export default function PedigreeImportListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PedigreeImportStatus | ''>('');
  
  const { loading, error, data } = useQuery(GET_PEDIGREE_IMPORTS, {
    variables: {
      offset: 0,
      limit: 20,
      searchTerm: searchTerm || undefined,
      status: statusFilter || undefined
    },
    fetchPolicy: 'network-only'
  });
  
  const imports = data?.pedigreeImports?.items || [];
  
  // Helper function to get status chip color
  const getStatusColor = (status: PedigreeImportStatus) => {
    switch (status) {
      case PedigreeImportStatus.UPLOADED:
        return 'default';
      case PedigreeImportStatus.PROCESSING:
        return 'warning';
      case PedigreeImportStatus.EXTRACTION_COMPLETE:
        return 'info';
      case PedigreeImportStatus.VALIDATION_COMPLETE:
        return 'secondary';
      case PedigreeImportStatus.IMPORT_COMPLETE:
        return 'success';
      case PedigreeImportStatus.FAILED:
        return 'error';
      default:
        return 'default';
    }
  };
  
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]} fallbackPath="/auth/login">
      <AppLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <div className="flex justify-between items-center mb-6">
            <Typography component="h1" variant="h4">
              Pedigree Imports
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => router.push('/pedigrees/import')}
            >
              New Import
            </Button>
          </div>
          
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <TextField
              label="Search imports"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search by filename..."
            />
            
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PedigreeImportStatus | '')}
              variant="outlined"
              size="small"
              style={{ minWidth: 200 }}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">All Statuses</option>
              {Object.values(PedigreeImportStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </TextField>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-700">Error loading pedigree imports: {error.message}</p>
            </div>
          ) : imports.length === 0 ? (
            <div className="bg-gray-50 p-12 rounded-md text-center">
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No pedigree imports found
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                {searchTerm || statusFilter
                  ? 'Try changing your search criteria'
                  : 'Get started by importing your first pedigree'}
              </Typography>
              {!searchTerm && !statusFilter && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/pedigrees/import')}
                >
                  New Import
                </Button>
              )}
            </div>
          ) : (
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      File
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Created
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {imports.map((importItem: any) => (
                    <tr key={importItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {importItem.originalFileName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {importItem.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Chip
                          label={importItem.status.replace(/_/g, ' ')}
                          color={getStatusColor(importItem.status) as any}
                          size="small"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(importItem.createdAt)}
                        {importItem.completedAt && (
                          <div className="text-xs text-gray-400">
                            Completed: {formatDate(importItem.completedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {importItem.user?.fullName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/pedigrees/import/${importItem.id}`} passHref>
                          <span className="text-green-600 hover:text-green-900 cursor-pointer">
                            View
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {data?.pedigreeImports?.hasMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outlined"
                color="primary"
                // This would need to be implemented with pagination
                onClick={() => {
                  // Load more items
                }}
              >
                Load More
              </Button>
            </div>
          )}
        </Container>
      </AppLayout>
    </ProtectedRoute>
  );
}
