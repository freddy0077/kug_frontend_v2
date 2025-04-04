import { useQuery } from '@apollo/client';
import { GET_USER_DOGS } from '@/graphql/queries/userDogQueries';

export type DogMinimal = {
  id: string;
  name: string;
  breed: string;
  registrationNumber: string;
  gender: string;
  mainImageUrl?: string;
};

export const useUserDogs = (skip = false) => {
  const { loading, error, data, refetch } = useQuery(GET_USER_DOGS, {
    skip,
    fetchPolicy: 'cache-and-network'
  });

  return {
    loading,
    error,
    dogs: data?.dogs?.items as DogMinimal[],
    refetch
  };
};


