import { ApolloClient, InMemoryCache, createHttpLink, from, NormalizedCacheObject } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from "@apollo/client/link/error";
import { GraphQLError } from 'graphql';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((error) => {
      const { message, locations, path } = error;
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/graphql',
});

// Auth middleware for adding the token to requests
const authLink = setContext((_, prevContext) => {
  // Get the authentication token from local storage if it exists
  let token: string | null = null;
  
  // Only run this on the client
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token');
  }
  
  // Return the headers to the context so httpLink can read them
  return {
    ...prevContext,
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Create the Apollo Client instance
export const apolloClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
