'use client';

import { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  FormControl, 
  Checkbox, 
  FormControlLabel, 
  Typography, 
  CircularProgress,
  Chip,
  Divider,
  Button,
  Tooltip,
  FormGroup
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { GeneticTrait } from '@/hooks/useGenetics';

type GeneticTraitSelectorProps = {
  traits: GeneticTrait[];
  selectedTraitIds: string[];
  onTraitSelectionChange: (traitIds: string[]) => void;
  loading?: boolean;
  error?: Error | null;
};

export default function GeneticTraitSelector({
  traits,
  selectedTraitIds,
  onTraitSelectionChange,
  loading = false,
  error = null
}: GeneticTraitSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleTraitToggle = (traitId: string) => {
    const currentIndex = selectedTraitIds.indexOf(traitId);
    const newSelected = [...selectedTraitIds];

    if (currentIndex === -1) {
      newSelected.push(traitId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    onTraitSelectionChange(newSelected);
  };

  const handleSelectAll = () => {
    onTraitSelectionChange(traits.map(trait => trait.id));
  };

  const handleDeselectAll = () => {
    onTraitSelectionChange([]);
  };

  // Filter traits based on search query
  const filteredTraits = traits.filter(trait => 
    trait.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group traits by inheritance pattern
  const groupedTraits = filteredTraits.reduce((acc, trait) => {
    const pattern = trait.inheritancePattern;
    if (!acc[pattern]) {
      acc[pattern] = [];
    }
    acc[pattern].push(trait);
    return acc;
  }, {} as Record<string, GeneticTrait[]>);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Genetic Traits
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            Error loading traits: {error.message}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Button 
              size="small" 
              onClick={handleSelectAll}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Select All
            </Button>
            <Button 
              size="small" 
              onClick={handleDeselectAll}
              disabled={loading}
            >
              Deselect All
            </Button>
          </Box>
          <Chip 
            label={`Selected: ${selectedTraitIds.length}/${traits.length}`} 
            color="primary" 
            variant="outlined"
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {Object.entries(groupedTraits).map(([pattern, patternTraits]) => (
              <Box key={pattern} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                  {pattern.replace(/_/g, ' ')}
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <FormGroup>
                  {patternTraits.map(trait => (
                    <FormControlLabel
                      key={trait.id}
                      control={
                        <Checkbox
                          checked={selectedTraitIds.includes(trait.id)}
                          onChange={() => handleTraitToggle(trait.id)}
                          name={trait.id}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {trait.name}
                          {trait.description && (
                            <Tooltip title={trait.description}>
                              <InfoIcon fontSize="small" sx={{ ml: 0.5, opacity: 0.6 }} />
                            </Tooltip>
                          )}
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
