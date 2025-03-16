import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { NextPage } from 'next';

// Augment the existing Next.js types
declare module 'next' {
  // Override the PageProps interface to make it compatible with our project
  export interface PageProps {
    params: { [key: string]: string };
    searchParams?: { [key: string]: string | string[] };
  }
}
