'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Chip,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TraitPrediction } from '@/hooks/useGenetics';

interface GeneticOffspringPredictionProps {
  predictions: TraitPrediction[] | null;
  loading: boolean;
  error: any;
}

export default function GeneticOffspringPrediction({
  predictions,
  loading,
  error
}: GeneticOffspringPredictionProps) {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Offspring Trait Predictions</Typography>
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
          <Typography align="center" color="text.secondary">
            Calculating offspring trait predictions...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Offspring Trait Predictions</Typography>
          <Alert severity="error">
            Error calculating predictions: {error.message || 'Unknown error'}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Offspring Trait Predictions</Typography>
          <Alert severity="info">
            Select both parents and at least one trait to view offspring predictions.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Offspring Trait Predictions
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          The following predictions show possible genetic outcomes for offspring based on the selected traits.
          Percentages indicate the probability of each outcome.
        </Typography>
        
        {predictions.map((prediction) => (
          <Accordion key={prediction.id} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{prediction.trait.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" paragraph>
                {prediction.trait.description}
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Genotype</TableCell>
                      <TableCell>Probability</TableCell>
                      <TableCell>Phenotype</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prediction.possibleGenotypes.map((outcome, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {outcome.genotype}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ width: '100%' }}>
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">{outcome.probability.toFixed(1)}%</Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={outcome.probability} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 1,
                                mt: 0.5,
                                backgroundColor: 'grey.200'
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{outcome.phenotype}</TableCell>
                        <TableCell>
                          {outcome.isCarrier ? (
                            <Chip 
                              size="small" 
                              label="Carrier" 
                              color="warning" 
                              variant="outlined"
                            />
                          ) : (
                            <Chip 
                              size="small" 
                              label="Non-carrier" 
                              color="success" 
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {prediction.possibleGenotypes.some(g => g.healthImplications) && (
                <Box mt={2}>
                  <Typography variant="subtitle2">Health Implications:</Typography>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    {prediction.possibleGenotypes.find(g => g.healthImplications)?.healthImplications}
                  </Alert>
                </Box>
              )}
              
              {prediction.notes && (
                <Box mt={2}>
                  <Typography variant="subtitle2">Notes:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {prediction.notes}
                  </Typography>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </CardContent>
    </Card>
  );
}
