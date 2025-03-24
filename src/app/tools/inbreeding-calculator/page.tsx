'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils'; // Using proper UserRole enum as noted in the memory
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Divider,
  Link as MuiLink
} from '@mui/material';
import Link from 'next/link';

// Mock data for demonstration
const dogsMock = [
  { id: '1', name: 'Max', breed: 'German Shepherd', registration: 'KUG001001' },
  { id: '2', name: 'Bella', breed: 'Labrador Retriever', registration: 'KUG001002' },
  { id: '3', name: 'Charlie', breed: 'Golden Retriever', registration: 'KUG001003' },
  { id: '4', name: 'Luna', breed: 'Siberian Husky', registration: 'KUG001004' },
  { id: '5', name: 'Cooper', breed: 'Border Collie', registration: 'KUG001005' },
  { id: '6', name: 'Lucy', breed: 'Beagle', registration: 'KUG001006' },
  { id: '7', name: 'Bailey', breed: 'Yorkshire Terrier', registration: 'KUG001007' },
];

interface InbreedingResult {
  coefficient: number;
  commonAncestors: CommonAncestor[];
  healthRisk: string;
  recommendation: string;
}

interface CommonAncestor {
  name: string;
  contribution: number;
  path: string;
}

export default function InbreedingCalculator() {
  const [sire, setSire] = useState<string>('');
  const [dam, setDam] = useState<string>('');
  const [generations, setGenerations] = useState<string>('5');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<InbreedingResult | null>(null);

  const handleSireChange = (event: SelectChangeEvent<string>) => {
    setSire(event.target.value);
  };

  const handleDamChange = (event: SelectChangeEvent<string>) => {
    setDam(event.target.value);
  };

  const handleGenerationsChange = (event: SelectChangeEvent<string>) => {
    setGenerations(event.target.value);
  };

  const calculateInbreeding = () => {
    if (!sire || !dam) return;

    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock calculation results
      const mockResults: InbreedingResult = {
        coefficient: 6.25,
        commonAncestors: [
          {
            name: 'Champion Sunnydale Apollo',
            contribution: 3.125,
            path: 'Sire > Grandsire > Great Grandsire & Dam > Granddam > Great Granddam'
          },
          {
            name: 'Champion Westwood Bella',
            contribution: 1.565,
            path: 'Sire > Granddam > Great Granddam & Dam > Grandsire > Great Granddam'
          },
          {
            name: 'Champion Hillcrest Duke',
            contribution: 1.565,
            path: 'Sire > Grandsire > Great Grandsire & Dam > Grandsire > Great Grandsire'
          },
        ],
        healthRisk: 'Moderate',
        recommendation: 'This breeding has a moderate level of inbreeding. Consider health testing for recessive disorders common in the breed before proceeding.'
      };

      setResults(mockResults);
      setLoading(false);
    }, 1500);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'success';
      case 'Moderate':
        return 'warning';
      case 'High':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <ProtectedRoute allowedRoles={[]}>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Typography variant="h4" component="h1" gutterBottom>
            Inbreeding Calculator
          </Typography>

          <Typography variant="body1" paragraph>
            This tool calculates the coefficient of inbreeding (COI) between two dogs to help breeders make informed decisions.
            The COI measures the probability that two alleles at a randomly chosen locus are identical by descent due to common ancestors.
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Select Breeding Pair
                  </Typography>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="sire-select-label">Sire (Male)</InputLabel>
                    <Select
                      labelId="sire-select-label"
                      id="sire-select"
                      value={sire}
                      label="Sire (Male)"
                      onChange={handleSireChange}
                    >
                      <MenuItem value="">
                        <em>Select a sire</em>
                      </MenuItem>
                      {dogsMock.map((dog) => (
                        <MenuItem key={dog.id} value={dog.id}>
                          {dog.name} ({dog.breed}) - {dog.registration}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="dam-select-label">Dam (Female)</InputLabel>
                    <Select
                      labelId="dam-select-label"
                      id="dam-select"
                      value={dam}
                      label="Dam (Female)"
                      onChange={handleDamChange}
                    >
                      <MenuItem value="">
                        <em>Select a dam</em>
                      </MenuItem>
                      {dogsMock.map((dog) => (
                        <MenuItem key={dog.id} value={dog.id}>
                          {dog.name} ({dog.breed}) - {dog.registration}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="generations-select-label">Generations to Consider</InputLabel>
                    <Select
                      labelId="generations-select-label"
                      id="generations-select"
                      value={generations}
                      label="Generations to Consider"
                      onChange={handleGenerationsChange}
                    >
                      <MenuItem value="3">3 Generations</MenuItem>
                      <MenuItem value="4">4 Generations</MenuItem>
                      <MenuItem value="5">5 Generations</MenuItem>
                      <MenuItem value="6">6 Generations</MenuItem>
                      <MenuItem value="8">8 Generations</MenuItem>
                      <MenuItem value="10">10 Generations</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Box mt={3}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      disabled={!sire || !dam || loading}
                      onClick={calculateInbreeding}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Calculate Inbreeding'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              
              <Card elevation={3} sx={{ mt: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Inbreeding Reference
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Coefficient of Inbreeding (COI) Guidelines:</strong>
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>COI Range</TableCell>
                          <TableCell>Risk Level</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>0-5%</TableCell>
                          <TableCell>Low</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>5-10%</TableCell>
                          <TableCell>Moderate</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>10-20%</TableCell>
                          <TableCell>High</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>&gt;20%</TableCell>
                          <TableCell>Very High</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" gutterBottom>
                    Related Tools:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Link href="/tools/pedigree-analysis" className="no-underline">
                      <Button variant="outlined" fullWidth size="small">
                        Pedigree Analysis Tool
                      </Button>
                    </Link>
                    <Link href="/tools/genetic-calculator" className="no-underline">
                      <Button variant="outlined" fullWidth size="small">
                        Genetic Calculator
                      </Button>
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              {!results ? (
                <Paper elevation={3} sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                  <Typography variant="h6" color="textSecondary">
                    Select a sire and dam, then calculate to see inbreeding analysis
                  </Typography>
                </Paper>
              ) : (
                <>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Inbreeding Analysis Results
                      </Typography>
                      
                      <Box mb={3}>
                        <Alert severity={getRiskColor(results.healthRisk) as any}>
                          <Typography variant="subtitle1">
                            Coefficient of Inbreeding (COI): <strong>{results.coefficient}%</strong>
                          </Typography>
                          <Typography variant="body2">
                            Risk Level: <strong>{results.healthRisk}</strong>
                          </Typography>
                        </Alert>
                      </Box>
                      
                      <Typography variant="body2" paragraph>
                        {results.recommendation}
                      </Typography>
                      
                      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                        Common Ancestors
                      </Typography>
                      
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Ancestor</TableCell>
                              <TableCell align="right">Contribution to COI (%)</TableCell>
                              <TableCell>Relationship Path</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {results.commonAncestors.map((ancestor, index) => (
                              <TableRow key={index}>
                                <TableCell>{ancestor.name}</TableCell>
                                <TableCell align="right">{ancestor.contribution}%</TableCell>
                                <TableCell>{ancestor.path}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
                      <Box mt={4}>
                        <Typography variant="subtitle1" gutterBottom>
                          Health Considerations
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Inbreeding can increase the risk of recessive genetic disorders. Consider genetic testing for the following conditions relevant to the breeds involved:
                        </Typography>
                        <ul style={{ paddingLeft: '1.5rem' }}>
                          <li>Hip and Elbow Dysplasia</li>
                          <li>Progressive Retinal Atrophy (PRA)</li>
                          <li>Degenerative Myelopathy</li>
                          <li>Exercise-Induced Collapse (EIC)</li>
                          <li>Breed-specific conditions</li>
                        </ul>
                        
                        <Box mt={2}>
                          <MuiLink component={Link} href="/resources/health-guidelines">
                            View Complete Health Guidelines
                          </MuiLink>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Box mt={3} display="flex" justifyContent="space-between">
                    <Button variant="outlined" onClick={() => setResults(null)}>
                      Reset Calculator
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary"
                      component={Link}
                      href="/breeding-programs/planned-matings/add"
                    >
                      Plan This Mating
                    </Button>
                  </Box>
                </>
              )}
            </Grid>
          </Grid>
        </div>
      </div>
    </ProtectedRoute>
  );
}
