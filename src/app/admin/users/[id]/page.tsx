// @jsxImportSource react
import UserDetailsClient from './client';

// Tell Next.js to ignore type errors for this file
// @ts-nocheck

/**
 * Dynamic route page component for user details
 * 
 * @param {Object} props - Page properties
 * @param {Object} props.params - Route parameters
 * @param {string} props.params.id - User ID from route
 */
export default function UserDetailsPage({ params }) {
  // Extract the ID from params
  const userId = params.id;
  
  // Simply render the client component with the ID
  return <UserDetailsClient userId={userId} />;
}
