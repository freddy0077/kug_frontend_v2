'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';
import { SelectChangeEvent } from '@mui/material/Select';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField, 
  Typography, 
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Grid,
  Alert
} from '@mui/material';

// Mock data for demonstration purposes
const dogsMock = [
  { id: '1', name: 'Max', breed: 'German Shepherd', registrationNumber: 'KUG001234' },
  { id: '2', name: 'Bella', breed: 'Labrador Retriever', registrationNumber: 'KUG001235' },
  { id: '3', name: 'Charlie', breed: 'Golden Retriever', registrationNumber: 'KUG001236' },
  { id: '4', name: 'Luna', breed: 'Siberian Husky', registrationNumber: 'KUG001237' },
  { id: '5', name: 'Cooper', breed: 'Border Collie', registrationNumber: 'KUG001238' },
];

type AncestorData = {
  name: string;
  appearances: number;
  percentage: number;
};

type CoefficientData = {
  generation: number;
  coefficient: number;
};

export default function PedigreeAnalysisPage() {
  const [selectedDog, setSelectedDog] = useState<string>('');
  const [generations, setGenerations] = useState<string>('5');
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<boolean>(false);
  
  // Analysis results state
  const [ancestors, setAncestors] = useState<AncestorData[]>([]);
  const [coefficients, setCoefficients] = useState<CoefficientData[]>([]);
  const [overallCoefficient, setOverallCoefficient] = useState<number>(0);

  const handleDogChange = (event: SelectChangeEvent<string>) => {
    setSelectedDog(event.target.value);
  };

  const handleGenerationsChange = (event: SelectChangeEvent<string>) => {
    setGenerations(event.target.value);
  };

  const handleAnalyze = () => {
    if (!selectedDog) return;
    
    setLoading(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Mock analysis results
      const mockAncestors: AncestorData[] = [
        { name: 'Champion GoldRush Maximillian', appearances: 4, percentage: 12.5 },
        { name: 'Champion Oakhill Duchess', appearances: 3, percentage: 9.375 },
        { name: 'Champion Hillside Apollo', appearances: 2, percentage: 6.25 },
        { name: 'Champion Valleyview Stella', appearances: 2, percentage: 6.25 },
        { name: 'Champion Westwind Thunder', appearances: 1, percentage: 3.125 },
      ];
      
      const mockCoefficients: CoefficientData[] = [
        { generation: 1, coefficient: 0.0 },
        { generation: 2, coefficient: 0.0 },
        { generation: 3, coefficient: 3.125 },
        { generation: 4, coefficient: 6.25 },
        { generation: 5, coefficient: 9.375 },
      ];
      
      setAncestors(mockAncestors);
      setCoefficients(mockCoefficients);
      setOverallCoefficient(6.25);
      setAnalysis(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <ProtectedRoute allowedRoles={[]}>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Typography variant="h4" component="h1" gutterBottom>
            Pedigree Analysis Tool
          </Typography>
          
          <Typography variant="body1" paragraph>
            This tool analyzes a dog's pedigree to identify line breeding, calculate coefficients of inbreeding,
            and identify influential ancestors. Select a dog from your registry and specify how many generations
            to analyze.
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Analysis Settings
                  </Typography>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="dog-select-label">Select Dog</InputLabel>
                    <Select
                      labelId="dog-select-label"
                      id="dog-select"
                      value={selectedDog}
                      label="Select Dog"
                      onChange={handleDogChange}
                    >
                      <MenuItem value="">
                        <em>Select a dog to analyze</em>
                      </MenuItem>
                      {dogsMock.map((dog) => (
                        <MenuItem key={dog.id} value={dog.id}>
                          {dog.name} ({dog.breed}) - {dog.registrationNumber}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="generations-select-label">Generations</InputLabel>
                    <Select
                      labelId="generations-select-label"
                      id="generations-select"
                      value={generations}
                      label="Generations"
                      onChange={handleGenerationsChange}
                    >
                      <MenuItem value="3">3 Generations</MenuItem>
                      <MenuItem value="4">4 Generations</MenuItem>
                      <MenuItem value="5">5 Generations</MenuItem>
                      <MenuItem value="6">6 Generations</MenuItem>
                      <MenuItem value="7">7 Generations</MenuItem>
                      <MenuItem value="8">8 Generations</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Box mt={3}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      disabled={!selectedDog || loading}
                      onClick={handleAnalyze}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Analyze Pedigree'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              
              <Card elevation={3} sx={{ mt: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Analysis Tools
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Link href="/tools/genetic-calculator" className="no-underline">
                      <Button variant="outlined" fullWidth>
                        Genetic Calculator
                      </Button>
                    </Link>
                    <Link href="/tools/inbreeding-calculator" className="no-underline">
                      <Button variant="outlined" fullWidth>
                        Inbreeding Calculator
                      </Button>
                    </Link>
                    <Link href="/pedigrees" className="no-underline">
                      <Button variant="outlined" fullWidth>
                        Pedigree Database
                      </Button>
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              {!analysis ? (
                <Paper elevation={3} sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                  <Typography variant="h6" color="textSecondary">
                    Select a dog and click "Analyze Pedigree" to see analysis results
                  </Typography>
                </Paper>
              ) : (
                <>
                  <Card elevation={3} sx={{ mb: 4 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Inbreeding Summary
                      </Typography>
                      
                      <Alert severity={overallCoefficient > 12.5 ? "warning" : "info"} sx={{ mb: 3 }}>
                        Overall Coefficient of Inbreeding (COI): <strong>{overallCoefficient}%</strong>
                        {overallCoefficient > 12.5 && (
                          <span> - High COI may increase health risks</span>
                        )}
                      </Alert>
                      
                      <Typography variant="body2" paragraph>
                        The Coefficient of Inbreeding (COI) represents the probability that two alleles at a randomly chosen locus are identical by descent due to common ancestors.
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        COI by Generation
                      </Typography>
                      
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Generation</TableCell>
                              <TableCell align="right">COI (%)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {coefficients.map((row) => (
                              <TableRow key={row.generation}>
                                <TableCell component="th" scope="row">
                                  {row.generation}
                                </TableCell>
                                <TableCell align="right">{row.coefficient}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                  
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Ancestor Analysis
                      </Typography>
                      
                      <Typography variant="body2" paragraph>
                        This table shows ancestors that appear multiple times in the pedigree, indicating line breeding.
                      </Typography>
                      
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Ancestor</TableCell>
                              <TableCell align="right">Appearances</TableCell>
                              <TableCell align="right">Genetic Contribution (%)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {ancestors.map((row) => (
                              <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                  {row.name}
                                </TableCell>
                                <TableCell align="right">{row.appearances}</TableCell>
                                <TableCell align="right">{row.percentage}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </Grid>
          </Grid>
        </div>
      </div>
    </ProtectedRoute>
  );
}
