# Dog Pedigree System

This application is built with [Next.js](https://nextjs.org) to manage dog pedigree records, competition results, health information, and more.

## GraphQL API Documentation

Detailed GraphQL API specifications for backend implementation are available in the [/docs/api](/docs/api) directory:

- [Dogs API](/docs/api/dogs.md) - Dog profiles, search, and basic information
- [Competitions API](/docs/api/competitions.md) - Competition results and event information
- [Health Records API](/docs/api/health-records.md) - Dog health information and records
- [Pedigree API](/docs/api/pedigree.md) - Lineage and breeding information
- [Litters API](/docs/api/litters.md) - Litter registration and puppy management
- [Users API](/docs/api/users.md) - User management and authentication
- [Ownerships API](/docs/api/ownerships.md) - Dog ownership and transfer management
- [Events API](/docs/api/events.md) - Club and general events system
- [Breeding Programs API](/docs/api/breeding-programs.md) - Breeding program planning and management
- [Logs API](/docs/api/logs.md) - System logs and audit trail (admin-only)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
