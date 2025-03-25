'use client';

import { useState } from 'react';
import { UserRole } from '@/utils/permissionUtils';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemText, 
  ListItemIcon, 
  Divider,
  TextField,
  Paper,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  CardMedia
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/Article';
import PetsIcon from '@mui/icons-material/Pets';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import VerifiedIcon from '@mui/icons-material/Verified';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SettingsIcon from '@mui/icons-material/Settings';
import Link from 'next/link';

// Guide categories and guides
const guideCategories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: <ArticleIcon />,
    guides: [
      {
        id: 'account-setup',
        title: 'Account Setup & Configuration',
        description: 'Learn how to set up your account and configure your preferences',
        image: '/images/account-setup.jpg',
        roles: []
      },
      {
        id: 'navigation',
        title: 'Navigating the System',
        description: 'An overview of the system interface and main features',
        image: '/images/navigation.jpg',
        roles: []
      },
      {
        id: 'user-roles',
        title: 'Understanding User Roles & Permissions',
        description: 'Learn about different user roles and what each can access',
        image: '/images/user-roles.jpg',
        roles: []
      }
    ]
  },
  {
    id: 'dog-management',
    name: 'Dog Management',
    icon: <PetsIcon />,
    guides: [
      {
        id: 'register-dog',
        title: 'Registering a Dog',
        description: 'Step-by-step guide to registering a new dog in the system',
        image: '/images/register-dog.jpg',
        roles: [UserRole.OWNER, UserRole.OWNER, UserRole.ADMIN]
      },
      {
        id: 'dog-profile',
        title: 'Managing Dog Profiles',
        description: 'How to update information and manage dog profiles',
        image: '/images/dog-profile.jpg',
        roles: [UserRole.OWNER, UserRole.OWNER, UserRole.ADMIN]
      },
      {
        id: 'health-records',
        title: 'Health Records Management',
        description: 'Recording and tracking health information for your dogs',
        image: '/images/health-records.jpg',
        roles: [UserRole.OWNER, UserRole.OWNER, UserRole.HANDLER, UserRole.ADMIN]
      }
    ]
  },
  {
    id: 'breeding',
    name: 'Breeding Management',
    icon: <FamilyRestroomIcon />,
    guides: [
      {
        id: 'litter-registration',
        title: 'Litter Registration Process',
        description: 'Complete guide to registering a new litter',
        image: '/images/litter-registration.jpg',
        roles: [UserRole.OWNER, UserRole.ADMIN]
      },
      {
        id: 'puppy-registration',
        title: 'Puppy Registration',
        description: 'How to register individual puppies from a litter',
        image: '/images/puppy-registration.jpg',
        roles: [UserRole.OWNER, UserRole.ADMIN]
      },
      {
        id: 'breeding-tools',
        title: 'Using Breeding Tools',
        description: 'Guide to using inbreeding calculator and pedigree analysis tools',
        image: '/images/breeding-tools.jpg',
        roles: [UserRole.OWNER, UserRole.ADMIN]
      }
    ]
  },
  {
    id: 'registrations',
    name: 'Registration & Transfers',
    icon: <VerifiedIcon />,
    guides: [
      {
        id: 'ownership-transfer',
        title: 'Ownership Transfer Process',
        description: 'How to transfer dog ownership in the system',
        image: '/images/ownership-transfer.jpg',
        roles: [UserRole.OWNER, UserRole.OWNER, UserRole.ADMIN]
      },
      {
        id: 'pedigree-certificates',
        title: 'Pedigree Certificates',
        description: 'Requesting and interpreting pedigree certificates',
        image: '/images/pedigree-certificates.jpg',
        roles: []
      }
    ]
  },
  {
    id: 'competitions',
    name: 'Competitions & Events',
    icon: <EmojiEventsIcon />,
    guides: [
      {
        id: 'event-registration',
        title: 'Event Registration',
        description: 'How to register for dog shows and competitions',
        image: '/images/event-registration.jpg',
        roles: [UserRole.OWNER, UserRole.OWNER, UserRole.ADMIN]
      },
      {
        id: 'results-recording',
        title: 'Recording Results',
        description: 'Adding competition results to your dog\'s profile',
        image: '/images/results-recording.jpg',
        roles: [UserRole.HANDLER, UserRole.ADMIN]
      }
    ]
  },
  {
    id: 'admin',
    name: 'Administrator Tools',
    icon: <SettingsIcon />,
    guides: [
      {
        id: 'user-management',
        title: 'User Management',
        description: 'Managing user accounts and permissions',
        image: '/images/user-management.jpg',
        roles: [UserRole.ADMIN]
      },
      {
        id: 'breed-standards',
        title: 'Breed Standards Management',
        description: 'Updating and managing breed standards information',
        image: '/images/breed-standards.jpg',
        roles: [UserRole.ADMIN]
      }
    ]
  }
];

export default function UserGuides() {
  const [selectedCategory, setSelectedCategory] = useState<string>('getting-started');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter guides based on search query
  const filteredGuides = guideCategories.map(category => {
    const filteredGuidesInCategory = category.guides.filter(guide => 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return {
      ...category,
      guides: filteredGuidesInCategory,
      hasMatches: filteredGuidesInCategory.length > 0
    };
  }).filter(category => category.hasMatches || category.id === selectedCategory);

  const selectedCategoryData = guideCategories.find(category => category.id === selectedCategory);

  return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Typography variant="h4" component="h1" gutterBottom>
            User Guides
          </Typography>
          
          <Typography variant="body1" paragraph>
            Browse our comprehensive guides to learn how to use the Dog Pedigree Database System.
            From basic account setup to advanced breeding management, these guides will help you
            make the most of the platform.
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Paper elevation={3} sx={{ mb: 3 }}>
                <List component="nav" aria-label="guide categories">
                  {guideCategories.map((category) => (
                    <ListItem key={category.id} disablePadding>
                      <ListItemButton
                      selected={selectedCategory === category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: 'primary.light',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                          },
                        },
                      }}
                    >
                      <ListItemIcon>
                        {category.icon}
                      </ListItemIcon>
                      <ListItemText primary={category.name} />
                    </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
              
              <Paper elevation={3}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Additional Resources
                  </Typography>
                  <List>
                    <ListItem component={Link} href="/resources/health-guidelines">
                      <ListItemText primary="Health Guidelines" />
                    </ListItem>
                    <ListItem component={Link} href="/resources/breeding-standards">
                      <ListItemText primary="Breeding Standards" />
                    </ListItem>
                    <ListItem component={Link} href="/resources/competition-rules">
                      <ListItemText primary="Competition Rules" />
                    </ListItem>
                    <ListItem component={Link} href="/docs/api-documentation">
                      <ListItemText primary="API Documentation" />
                    </ListItem>
                    <ListItem component={Link} href="/docs/faqs">
                      <ListItemText primary="FAQs" />
                    </ListItem>
                  </List>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={9}>
              {searchQuery ? (
                // Search results view
                <>
                  <Typography variant="h6" gutterBottom>
                    Search Results
                  </Typography>
                  
                  {filteredGuides.length === 0 ? (
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        No guides match your search query. Try different keywords.
                      </Typography>
                    </Paper>
                  ) : (
                    filteredGuides.map(category => (
                      <Box key={category.id} sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                          {category.name}
                        </Typography>
                        
                        <Grid container spacing={3}>
                          {category.guides.map(guide => (
                            <Grid item xs={12} sm={6} md={4} key={guide.id}>
                              <Card elevation={3}>
                                <CardMedia
                                  component="div"
                                  sx={{
                                    height: 140,
                                    bgcolor: 'primary.light',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Typography variant="h6" color="white">
                                    {guide.title}
                                  </Typography>
                                </CardMedia>
                                <CardContent>
                                  <Typography variant="body2" color="text.secondary" paragraph>
                                    {guide.description}
                                  </Typography>
                                  <Button 
                                    variant="outlined" 
                                    size="small"
                                    component={Link}
                                    href={`/docs/user-guides/${category.id}/${guide.id}`}
                                  >
                                    View Guide
                                  </Button>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    ))
                  )}
                </>
              ) : (
                // Category view
                selectedCategoryData && (
                  <>
                    <Typography variant="h5" gutterBottom>
                      {selectedCategoryData.name} Guides
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {selectedCategoryData.guides.map(guide => (
                        <Grid item xs={12} sm={6} md={4} key={guide.id}>
                          <Card elevation={3}>
                            <CardMedia
                              component="div"
                              sx={{
                                height: 140,
                                bgcolor: 'primary.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Typography variant="h6" color="white">
                                {guide.title}
                              </Typography>
                            </CardMedia>
                            <CardContent>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {guide.description}
                              </Typography>
                              <Button 
                                variant="outlined" 
                                size="small"
                                component={Link}
                                href={`/docs/user-guides/${selectedCategoryData.id}/${guide.id}`}
                              >
                                View Guide
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        Frequently Asked Questions
                      </Typography>
                      
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>What roles can access these guides?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography>
                            Most guides are accessible to all users. Some specialized guides are specifically designed for users with certain roles,
                            such as Breeders, Owners, Judges, or Administrators. Each guide indicates which roles it's relevant for.
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                      
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>How often are guides updated?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography>
                            Our guides are regularly updated to reflect the latest features and improvements to the system.
                            Each guide displays a "Last Updated" date to help you know if you're viewing the most current information.
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                      
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Can I request a new guide?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography>
                            Yes! We welcome your feedback and suggestions for new guides. Please contact our support team with your request,
                            and we'll consider adding new guides based on user demand and system updates.
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  </>
                )
              )}
            </Grid>
          </Grid>
        </div>
      </div>
  );
}
