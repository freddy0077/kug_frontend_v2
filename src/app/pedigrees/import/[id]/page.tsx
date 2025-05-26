'use client';

import React from 'react';
import { Container, Typography, Breadcrumbs } from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PedigreeImportWizard from '@/components/pedigreeImport/PedigreeImportWizard';
import AppLayout from '@/components/layout/AppLayout';
import { UserRole } from '@/utils/permissionUtils';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function PedigreeImportDetailPage() {
  // Use the useParams hook to get the URL parameters
  const params = useParams();
  const id = params.id as string;
  
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]} fallbackPath="/auth/login">
      <AppLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Breadcrumbs aria-label="breadcrumb" className="mb-4">
            <Link href="/" passHref>
              <Typography color="inherit" className="hover:underline cursor-pointer">
                Home
              </Typography>
            </Link>
            <Link href="/pedigrees" passHref>
              <Typography color="inherit" className="hover:underline cursor-pointer">
                Pedigrees
              </Typography>
            </Link>
            <Link href="/pedigrees/import" passHref>
              <Typography color="inherit" className="hover:underline cursor-pointer">
                Import
              </Typography>
            </Link>
            <Typography color="text.primary">Import {id.substring(0, 8)}</Typography>
          </Breadcrumbs>
          
          <Typography component="h1" variant="h4" className="mb-4">
            Pedigree Import Process
          </Typography>
          
          <PedigreeImportWizard importId={id} />
        </Container>
      </AppLayout>
    </ProtectedRoute>
  );
}
