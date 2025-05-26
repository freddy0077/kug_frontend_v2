'use client';

import React from 'react';
import { Container, Typography, Breadcrumbs } from '@mui/material';
import Link from 'next/link';
import PedigreeImportWizard from '@/components/pedigreeImport/PedigreeImportWizard';
import AppLayout from '@/components/layout/AppLayout';
import { UserRole } from '@/utils/permissionUtils';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function PedigreeImportPage() {
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
            <Typography color="text.primary">Import</Typography>
          </Breadcrumbs>
          
          <Typography component="h1" variant="h4" className="mb-4">
            Pedigree Import
          </Typography>
          
          <PedigreeImportWizard />
        </Container>
      </AppLayout>
    </ProtectedRoute>
  );
}
