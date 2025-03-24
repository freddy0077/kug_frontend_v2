'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  TextField,
  Chip
} from '@mui/material';
import Link from 'next/link';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`api-tabpanel-${index}`}
      aria-labelledby={`api-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `api-tab-${index}`,
    'aria-controls': `api-tabpanel-${index}`,
  };
}

// Sample API endpoints data
const endpoints = [
  {
    name: 'Authentication',
    description: 'Endpoints for user authentication and token management',
    methods: [
      {
        path: '/api/auth/login',
        method: 'POST',
        description: 'Authenticate a user and receive access token',
        parameters: [
          { name: 'email', type: 'string', required: true, description: 'User email address' },
          { name: 'password', type: 'string', required: true, description: 'User password' }
        ],
        responses: [
          { code: '200', description: 'Success', example: '{\n  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5...",\n  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5...",\n  "user": {\n    "id": "123",\n    "email": "user@example.com",\n    "name": "John Doe",\n    "roles": ["BREEDER"]\n  }\n}' },
          { code: '401', description: 'Invalid credentials', example: '{\n  "error": "Invalid email or password"\n}' }
        ]
      },
      {
        path: '/api/auth/refresh',
        method: 'POST',
        description: 'Refresh access token using refresh token',
        parameters: [
          { name: 'refreshToken', type: 'string', required: true, description: 'Valid refresh token' }
        ],
        responses: [
          { code: '200', description: 'Success', example: '{\n  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5..."\n}' },
          { code: '401', description: 'Invalid refresh token', example: '{\n  "error": "Invalid refresh token"\n}' }
        ]
      }
    ]
  },
  {
    name: 'Dogs',
    description: 'Endpoints for managing dog records',
    methods: [
      {
        path: '/api/dogs',
        method: 'GET',
        description: 'Get a list of dogs with pagination',
        parameters: [
          { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
          { name: 'limit', type: 'number', required: false, description: 'Items per page (default: 20)' },
          { name: 'breed', type: 'string', required: false, description: 'Filter by breed' },
          { name: 'owner', type: 'string', required: false, description: 'Filter by owner ID' }
        ],
        responses: [
          { code: '200', description: 'Success', example: '{\n  "items": [\n    {\n      "id": "dog123",\n      "name": "Max",\n      "breed": "German Shepherd",\n      "registrationNumber": "KUG001234",\n      "gender": "male",\n      "dateOfBirth": "2020-05-15",\n      "ownerId": "user456"\n    },\n    ...\n  ],\n  "total": 45,\n  "page": 1,\n  "limit": 20\n}' }
        ]
      },
      {
        path: '/api/dogs/:id',
        method: 'GET',
        description: 'Get details of a specific dog',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Dog ID' }
        ],
        responses: [
          { code: '200', description: 'Success', example: '{\n  "id": "dog123",\n  "name": "Max",\n  "breed": "German Shepherd",\n  "registrationNumber": "KUG001234",\n  "gender": "male",\n  "dateOfBirth": "2020-05-15",\n  "color": "Black and Tan",\n  "microchipNumber": "985112345678909",\n  "breeder": {\n    "id": "user789",\n    "name": "Jane Smith"\n  },\n  "owner": {\n    "id": "user456",\n    "name": "John Doe"\n  },\n  "parents": {\n    "sire": {\n      "id": "dog456",\n      "name": "Apollo",\n      "registrationNumber": "KUG000987"\n    },\n    "dam": {\n      "id": "dog789",\n      "name": "Luna",\n      "registrationNumber": "KUG000654"\n    }\n  }\n}' },
          { code: '404', description: 'Dog not found', example: '{\n  "error": "Dog not found"\n}' }
        ]
      }
    ]
  },
  {
    name: 'Litters',
    description: 'Endpoints for managing litter records',
    methods: [
      {
        path: '/api/litters',
        method: 'GET',
        description: 'Get a list of litters with pagination',
        parameters: [
          { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
          { name: 'limit', type: 'number', required: false, description: 'Items per page (default: 20)' },
          { name: 'breederId', type: 'string', required: false, description: 'Filter by breeder ID' }
        ],
        responses: [
          { code: '200', description: 'Success', example: '{\n  "items": [...],\n  "total": 28,\n  "page": 1,\n  "limit": 20\n}' }
        ]
      },
      {
        path: '/api/litters/:id',
        method: 'GET',
        description: 'Get details of a specific litter',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Litter ID' }
        ],
        responses: [
          { code: '200', description: 'Success', example: '{\n  "id": "litter123",\n  "litterDate": "2022-06-10",\n  "puppyCount": 6,\n  "breederId": "user789",\n  "parents": {\n    "sire": {\n      "id": "dog456",\n      "name": "Apollo",\n      "registrationNumber": "KUG000987"\n    },\n    "dam": {\n      "id": "dog789",\n      "name": "Luna",\n      "registrationNumber": "KUG000654"\n    }\n  },\n  "puppies": [...]\n}' }
        ]
      }
    ]
  }
];

export default function ApiDocumentation() {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter endpoints based on search query
  const filteredEndpoints = endpoints.filter(endpoint => 
    endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.methods.some(method => 
      method.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <ProtectedRoute allowedRoles={[]}>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Typography variant="h4" component="h1" gutterBottom>
            API Documentation
          </Typography>
          
          <Typography variant="body1" paragraph>
            This documentation describes the endpoints available in the KUG Dog Registry API.
            Use these endpoints to integrate with our system for managing dog records, pedigrees, health data, and more.
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    API Guides
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button variant="outlined" size="small">Getting Started</Button>
                    <Button variant="outlined" size="small">Authentication</Button>
                    <Button variant="outlined" size="small">Error Handling</Button>
                    <Button variant="outlined" size="small">Rate Limits</Button>
                    <Button variant="outlined" size="small">Webhooks</Button>
                    <Button variant="outlined" size="small">GraphQL API</Button>
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Resources
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button variant="outlined" size="small">SDK Downloads</Button>
                    <Button variant="outlined" size="small">API Changelog</Button>
                    <Button component={Link} href="/docs/user-guides" variant="outlined" size="small">
                      User Guides
                    </Button>
                    <Button component={Link} href="/docs/faqs" variant="outlined" size="small">
                      FAQs
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Search API Endpoints"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Box>
                
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="API documentation tabs">
                    <Tab label="REST API" {...a11yProps(0)} />
                    <Tab label="GraphQL API" {...a11yProps(1)} />
                    <Tab label="Webhooks" {...a11yProps(2)} />
                  </Tabs>
                </Box>
                
                <TabPanel value={tabValue} index={0}>
                  {filteredEndpoints.length > 0 ? (
                    filteredEndpoints.map((endpoint, index) => (
                      <Box key={index} sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                          {endpoint.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {endpoint.description}
                        </Typography>
                        
                        {endpoint.methods.map((method, methodIndex) => (
                          <Paper 
                            key={methodIndex} 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              mb: 3,
                              border: '1px solid',
                              borderColor: 
                                method.method === 'GET' ? 'info.main' :
                                method.method === 'POST' ? 'success.main' :
                                method.method === 'PUT' ? 'warning.main' :
                                method.method === 'DELETE' ? 'error.main' : 'divider'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Chip 
                                label={method.method} 
                                color={
                                  method.method === 'GET' ? 'info' :
                                  method.method === 'POST' ? 'success' :
                                  method.method === 'PUT' ? 'warning' :
                                  method.method === 'DELETE' ? 'error' : 'default'
                                }
                                size="small"
                                sx={{ mr: 2 }}
                              />
                              <Typography variant="subtitle1" component="code" sx={{ fontFamily: 'monospace' }}>
                                {method.path}
                              </Typography>
                            </Box>
                            
                            <Typography variant="body2" paragraph>
                              {method.description}
                            </Typography>
                            
                            {method.parameters.length > 0 && (
                              <>
                                <Typography variant="subtitle2" gutterBottom>
                                  Parameters
                                </Typography>
                                <Paper variant="outlined" sx={{ mb: 2, overflow: 'auto' }}>
                                  <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <Box component="thead" sx={{ bgcolor: 'grey.100' }}>
                                      <Box component="tr">
                                        <Box component="th" sx={{ p: 1.5, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Name</Box>
                                        <Box component="th" sx={{ p: 1.5, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Type</Box>
                                        <Box component="th" sx={{ p: 1.5, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Required</Box>
                                        <Box component="th" sx={{ p: 1.5, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Description</Box>
                                      </Box>
                                    </Box>
                                    <Box component="tbody">
                                      {method.parameters.map((param, paramIndex) => (
                                        <Box component="tr" key={paramIndex}>
                                          <Box component="td" sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', fontFamily: 'monospace' }}>{param.name}</Box>
                                          <Box component="td" sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>{param.type}</Box>
                                          <Box component="td" sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>{param.required ? 'Yes' : 'No'}</Box>
                                          <Box component="td" sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>{param.description}</Box>
                                        </Box>
                                      ))}
                                    </Box>
                                  </Box>
                                </Paper>
                              </>
                            )}
                            
                            <Typography variant="subtitle2" gutterBottom>
                              Responses
                            </Typography>
                            {method.responses.map((response, responseIndex) => (
                              <Box key={responseIndex} sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                  <Chip 
                                    label={response.code} 
                                    size="small" 
                                    color={
                                      response.code.startsWith('2') ? 'success' :
                                      response.code.startsWith('4') ? 'error' :
                                      response.code.startsWith('5') ? 'warning' : 'default'
                                    }
                                    sx={{ mr: 1 }}
                                  />
                                  {response.description}
                                </Typography>
                                {response.example && (
                                  <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                      mt: 1, 
                                      p: 1.5, 
                                      bgcolor: 'grey.900',
                                      borderRadius: 1,
                                      overflow: 'auto'
                                    }}
                                  >
                                    <Typography 
                                      variant="body2" 
                                      component="pre" 
                                      sx={{ 
                                        fontFamily: 'monospace', 
                                        m: 0,
                                        color: 'grey.100'
                                      }}
                                    >
                                      {response.example}
                                    </Typography>
                                  </Paper>
                                )}
                              </Box>
                            ))}
                          </Paper>
                        ))}
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        No endpoints match your search query
                      </Typography>
                    </Box>
                  )}
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      GraphQL API Documentation
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Our GraphQL API provides a flexible way to query exactly the data you need.
                    </Typography>
                    <Button variant="contained">
                      Open GraphQL Explorer
                    </Button>
                  </Box>
                </TabPanel>
                
                <TabPanel value={tabValue} index={2}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Webhook Documentation
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Use webhooks to receive real-time updates when events occur in the system.
                    </Typography>
                    <Button variant="contained">
                      Set Up Webhooks
                    </Button>
                  </Box>
                </TabPanel>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </div>
    </ProtectedRoute>
  );
}
