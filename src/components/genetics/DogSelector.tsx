'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DOGS } from '@/graphql/queries/dogQueries';
import { 
  Box, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select,
  SelectChangeEvent,
  Typography,
  Avatar,
  Grid,
  Skeleton
} from '@mui/material';

type Dog = {
  id: string;
  name: string;
  breed: string;
  registrationNumber: string;
  mainImageUrl?: string;
};

type DogSelectorProps = {
  label: string;
  selectedDogId: string;
  onDogSelect: (dogId: string) => void;
  excludeDogId?: string;
};

export default function DogSelector({ 
  label, 
  selectedDogId, 
  onDogSelect, 
  excludeDogId 
}: DogSelectorProps) {
  const { data, loading, error } = useQuery(GET_DOGS, {
    variables: { limit: 100 }
  });
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);

  // Filter dogs based on exclude ID (to prevent selecting same dog as sire and dam)
  const availableDogs = data?.dogs?.items?.filter((dog: Dog) => dog.id !== excludeDogId) || [];

  // Update selected dog when ID changes or data loads
  useEffect(() => {
    if (selectedDogId && data?.dogs?.items) {
      const dog = data.dogs.items.find((d: Dog) => d.id === selectedDogId);
      setSelectedDog(dog || null);
    } else {
      setSelectedDog(null);
    }
  }, [selectedDogId, data]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const dogId = event.target.value;
    onDogSelect(dogId);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{label}</Typography>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id={`${label.toLowerCase()}-select-label`}>Select Dog</InputLabel>
          <Select
            labelId={`${label.toLowerCase()}-select-label`}
            value={selectedDogId}
            label="Select Dog"
            onChange={handleChange}
            disabled={loading}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {availableDogs.map((dog: Dog) => (
              <MenuItem key={dog.id} value={dog.id}>
                {dog.name} ({dog.breed})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading && <Skeleton variant="rectangular" height={100} />}
        
        {error && (
          <Typography color="error">
            Error loading dogs: {error.message}
          </Typography>
        )}
        
        {selectedDog && (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={3}>
              <Avatar
                src={selectedDog.mainImageUrl || '/images/dog-placeholder.png'}
                alt={selectedDog.name}
                sx={{ width: 80, height: 80 }}
              />
            </Grid>
            <Grid item xs={9}>
              <Typography variant="subtitle1">
                <strong>{selectedDog.name}</strong>
              </Typography>
              <Typography variant="body2">
                Breed: {selectedDog.breed}
              </Typography>
              <Typography variant="body2">
                Registration #: {selectedDog.registrationNumber}
              </Typography>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
