import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add New Owner',
  description: 'Create a new owner profile in the system.'
};

export default function AddOwnerPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Add New Owner</h1>
      <p>Owner form will be added here.</p>
    </div>
  );
}
