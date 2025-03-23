'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
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
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { GeneticAnalysis, GeneticRiskFactor, RiskLevel, TraitPrediction } from '@/hooks/useGenetics';

interface GeneticAnalysisResultProps {
  analysis: GeneticAnalysis | null;
  loading: boolean;
  error: any;
}

export default function GeneticAnalysisResult({
  analysis,
  loading,
  error
}: GeneticAnalysisResultProps) {
  const [expandedPanel, setExpandedPanel] = useState<string | false>('panel1');

  const handlePanelChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  // Helper to get risk level color
  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case 'NONE': return 'success.main';
      case 'LOW': return 'info.main';
      case 'MEDIUM': return 'warning.main';
      case 'HIGH': return 'error.light';
      case 'CRITICAL': return 'error.dark';
      default: return 'text.secondary';
    }
  };

  // Helper to get risk level icon
  const getRiskLevelIcon = (level: RiskLevel) => {
    switch (level) {
      case 'NONE': 
      case 'LOW': 
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'MEDIUM': 
        return <WarningIcon color="warning" fontSize="small" />;
      case 'HIGH': 
      case 'CRITICAL': 
        return <ErrorIcon color="error" fontSize="small" />;
      default: 
        return null;
    }
  };

  // Get compatibility display based on score
  const getCompatibilityDisplay = (score: number) => {
    let color = 'error';
    let label = 'Poor';
    
    if (score >= 90) {
      color = 'success';
      label = 'Excellent';
    } else if (score >= 75) {
      color = 'success';
      label = 'Very Good';
    } else if (score >= 60) {
      color = 'info';
      label = 'Good';
    } else if (score >= 40) {
      color = 'warning';
      label = 'Fair';
    }
    
    return { color, label };
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Genetic Compatibility Analysis</Typography>
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
          <Typography align="center" color="text.secondary">
            Analyzing genetic compatibility...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Genetic Compatibility Analysis</Typography>
          <Alert severity="error">
            Error loading genetic analysis: {error.message || 'Unknown error'}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Genetic Compatibility Analysis</Typography>
          <Alert severity="info">
            Select both sire and dam to view genetic compatibility analysis.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const compatibility = getCompatibilityDisplay(analysis.overallCompatibility);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Genetic Compatibility Analysis
        </Typography>
        
        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              mr: 2
            }}
          >
            <CircularProgress
              variant="determinate"
              value={analysis.overallCompatibility}
              size={80}
              thickness={4}
              sx={{
                color: compatibility.color + '.main',
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h5" color="text.secondary">
                {Math.round(analysis.overallCompatibility)}%
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" color={compatibility.color + '.main'}>
              {compatibility.label} Compatibility
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Based on {analysis.traitPredictions.length} genetic traits
            </Typography>
          </Box>
        </Box>

        {analysis.recommendations && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Breeder Recommendations:</Typography>
            <Typography variant="body2">{analysis.recommendations}</Typography>
          </Alert>
        )}

        <Accordion
          expanded={expandedPanel === 'panel1'}
          onChange={handlePanelChange('panel1')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Risk Factors</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {analysis.riskFactors && analysis.riskFactors.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Trait</TableCell>
                      <TableCell>Risk Level</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analysis.riskFactors.map((risk) => (
                      <TableRow key={risk.traitId}>
                        <TableCell>{risk.trait.name}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {getRiskLevelIcon(risk.riskLevel)}
                            <Typography 
                              variant="body2" 
                              sx={{ ml: 0.5, color: getRiskLevelColor(risk.riskLevel) }}
                            >
                              {risk.riskLevel}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{risk.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No significant risk factors identified.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expandedPanel === 'panel2'}
          onChange={handlePanelChange('panel2')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Trait Predictions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {analysis.traitPredictions.map((prediction) => (
              <Box key={prediction.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">{prediction.trait.name}</Typography>
                <Divider sx={{ mb: 1 }} />
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Genotype</TableCell>
                        <TableCell>Probability</TableCell>
                        <TableCell>Phenotype</TableCell>
                        <TableCell>Carrier Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {prediction.possibleGenotypes.map((outcome, index) => (
                        <TableRow key={index}>
                          <TableCell>{outcome.genotype}</TableCell>
                          <TableCell>
                            {outcome.probability.toFixed(1)}%
                            <LinearProgress 
                              variant="determinate" 
                              value={outcome.probability} 
                              sx={{ mt: 0.5 }}
                            />
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
                {prediction.notes && (
                  <Typography variant="body2" color="text.secondary">
                    Note: {prediction.notes}
                  </Typography>
                )}
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
}
