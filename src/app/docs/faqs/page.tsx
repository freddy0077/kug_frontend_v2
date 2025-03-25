'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Accordion, 
  AccordionDetails, 
  AccordionSummary, 
  TextField,
  InputAdornment,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';

// FAQ Categories and their questions
const faqCategories = [
  {
    id: 'general',
    name: 'General',
    questions: [
      {
        id: 'what-is-kug',
        question: 'What is the KUG Dog Pedigree Database?',
        answer: 'The KUG Dog Pedigree Database is a comprehensive platform for dog breeders, owners, and kennel clubs to manage dog registrations, pedigrees, health records, breeding information, and competition results. It serves as a central repository for all information related to registered dogs and their lineage.'
      },
      {
        id: 'who-can-use',
        question: 'Who can use the system?',
        answer: 'The system is designed for multiple user types including breeders, dog owners, kennel club administrators, veterinarians, judges, and event organizers. Each user type has specific permissions and access based on their role in the dog breeding community.'
      },
      {
        id: 'data-security',
        question: 'How is my data secured in the system?',
        answer: 'We implement industry-standard security protocols including encrypted data storage, secure authentication methods, regular security audits, and strict access controls. Your data is backed up regularly and we comply with data protection regulations to ensure your information remains private and secure.'
      },
      {
        id: 'system-cost',
        question: 'Is there a cost to use the system?',
        answer: 'The system uses a tiered pricing model. Basic registration and viewing capabilities are available at no cost, while premium features such as advanced breeding tools, health analytics, and extended pedigree analysis require a subscription. Specific transaction fees may also apply for services like registration certificates and transfers of ownership.'
      }
    ]
  },
  {
    id: 'registration',
    name: 'Registration & Accounts',
    questions: [
      {
        id: 'create-account',
        question: 'How do I create an account?',
        answer: 'To create an account, click on the "Sign Up" button on the homepage. You\'ll need to provide basic information including your name, email address, and intended user role (breeder, owner, etc.). After submitting, you\'ll receive a verification email to activate your account. Some roles may require additional verification by administrators.'
      },
      {
        id: 'multiple-roles',
        question: 'Can I have multiple roles in the system?',
        answer: 'Yes, users can have multiple roles in the system. For example, you can be both a breeder and an owner. During registration, you can select your primary role, and additional roles can be requested and approved by administrators as needed.'
      },
      {
        id: 'forgot-password',
        question: 'I forgot my password. How can I reset it?',
        answer: 'On the login page, click the "Forgot Password" link. Enter your registered email address, and you\'ll receive a password reset link. Follow the instructions in the email to create a new password. For security reasons, password reset links expire after 24 hours.'
      },
      {
        id: 'delete-account',
        question: 'How do I delete my account?',
        answer: 'To delete your account, go to your account settings and select the "Delete Account" option. Note that this action cannot be undone, and all personal data will be removed according to our data retention policy. Any dogs registered under your name will need to be transferred to another owner before account deletion.'
      }
    ]
  },
  {
    id: 'dog-registration',
    name: 'Dog Registration',
    questions: [
      {
        id: 'register-dog',
        question: 'How do I register a dog in the system?',
        answer: 'To register a dog, log in to your account and navigate to "Dogs" > "Register New Dog." Complete the registration form with the dog\'s details including name, breed, date of birth, microchip number, and parentage information if available. Upload required documents and pay the registration fee. Once approved by an administrator, your dog will be officially registered in the system.'
      },
      {
        id: 'registration-requirements',
        question: 'What information do I need to register a dog?',
        answer: 'Required information includes the dog\'s full name, breed, gender, date of birth, color, microchip number, and breeder information. If registering a purebred dog, you\'ll also need to provide sire and dam information. Supporting documents such as microchip certificate and photos may be required. Specific breed clubs may have additional requirements.'
      },
      {
        id: 'transfer-ownership',
        question: 'How do I transfer ownership of a dog?',
        answer: 'The current registered owner must initiate a transfer request from the dog\'s profile page by selecting "Transfer Ownership" and entering the new owner\'s email address. The new owner will receive a notification to accept the transfer. Both parties must complete their respective steps, and a transfer fee may apply. Once completed, ownership records will be updated in the system.'
      },
      {
        id: 'registration-costs',
        question: 'What are the costs for dog registration?',
        answer: 'Registration fees vary based on several factors including the dog\'s age, breed, and your membership status. Standard registration typically costs $30-50, with discounts available for litter registrations. Late registrations (dogs over 12 months old) may incur additional fees. A detailed fee schedule is available on the Pricing page.'
      }
    ]
  },
  {
    id: 'pedigrees',
    name: 'Pedigrees & Breeding',
    questions: [
      {
        id: 'access-pedigree',
        question: 'How can I access my dog\'s pedigree?',
        answer: 'You can view and print a dog\'s pedigree by navigating to the dog\'s profile page and selecting the "View Pedigree" option. The system allows you to view pedigrees up to 10 generations deep. You can also request official pedigree certificates with additional verification features for a fee.'
      },
      {
        id: 'pedigree-accuracy',
        question: 'How is pedigree accuracy verified in the system?',
        answer: 'Pedigree accuracy is verified through several methods: 1) DNA parentage verification for new registrations, 2) Administrator review of submitted documentation, 3) Cross-referencing with existing database records, and 4) Verification badges indicating the level of verification (e.g., DNA-verified, document-verified, or self-reported). Only pedigrees with sufficient verification receive official certification status.'
      },
      {
        id: 'pedigree-generation',
        question: 'What is the difference between official and unofficial pedigrees?',
        answer: 'Official pedigrees are issued by the registry after verification of all ancestry information. They include security features, unique identifiers, and are accepted for registration purposes by recognized organizations. Unofficial pedigrees are for reference only and may contain self-reported or unverified information. Official pedigrees display the organization\'s watermark and seal, while unofficial ones are clearly marked as "For Reference Only."'
      },
      {
        id: 'pedigree-analysis',
        question: 'How can I analyze my dog\'s pedigree for breeding decisions?',
        answer: 'The Pedigree Analysis Tool provides comprehensive analysis capabilities. It calculates coefficients of inbreeding, identifies line-breeding patterns, highlights influential ancestors, and flags potential genetic risks. Access this tool from your dog\'s profile page or through Tools > Pedigree Analysis. Premium members can access advanced features like breed population comparison and genetic diversity scoring. The analysis considers up to 10 generations of ancestry to provide accurate insights.'
      },
      {
        id: 'add-ancestor',
        question: 'How do I add missing ancestors to my dog\'s pedigree?',
        answer: 'To add missing ancestors to your dog\'s pedigree, navigate to your dog\'s profile, select "Edit Pedigree," and choose the "Add Ancestor" option. You\'ll need to provide the ancestor\'s details and supporting documentation. For recent generations (parents, grandparents), DNA verification may be required. For historical ancestors (3+ generations back), you can submit registration certificates or other documentation. Added ancestors require administrator verification before appearing in official pedigrees.'
      },
      {
        id: 'pedigree-export',
        question: 'Can I export my dog\'s pedigree to other formats?',
        answer: 'Yes, the system supports exporting pedigrees in multiple formats. Available formats include PDF (for printing), GEDCOM (for genealogy software), SVG/PNG (for visual representation), and JSON/XML (for data exchange with other systems). Premium members can access additional features like customized pedigree designs and interactive HTML exports. Export options are available from the pedigree view page under the "Export" dropdown menu.'
      },
      {
        id: 'breeding-tools',
        question: 'What breeding tools are available in the system?',
        answer: 'The system offers several breeding tools including: Coefficient of Inbreeding (COI) calculator, Mate selection assistant based on genetic health and diversity, Pedigree analysis tools to identify line-breeding patterns, Genetic disease carrier probability calculator, and Litter registration and tracking. Premium users have access to advanced breeding analytics and recommendations.'
      },
      {
        id: 'litter-registration',
        question: 'How do I register a litter?',
        answer: 'To register a litter, navigate to "Breeding" > "Register Litter." Enter information about the sire, dam, whelping date, and number of puppies. You\'ll need to provide details for each puppy including gender, color, and identifiers. Once the litter is registered, you can add health checks and eventually register individual puppies with their permanent names. The system will automatically link the litter to both parents\' records and update their breeding history.'
      },
      {
        id: 'litter-management',
        question: 'How are litters managed in the pedigree system?',
        answer: 'Litters are managed as unified records that connect dam, sire, and offspring. Once registered, a litter record serves as the foundation for puppy registrations. The system tracks key information including whelping date, litter size, survival rates, and health records. Littermates can be easily compared and tracked as a group. As puppies are individually registered, they remain linked to their litter record while establishing their own pedigree entries. This approach ensures pedigree continuity and simplifies breeding record management.'
      },
      {
        id: 'inbreeding-calculator',
        question: 'How does the inbreeding calculator work?',
        answer: 'The inbreeding calculator analyzes the pedigrees of two dogs to determine the coefficient of inbreeding (COI) for potential offspring. It identifies common ancestors and calculates the probability of genetic material being identical by descent. The tool considers up to 10 generations and provides a percentage that indicates the level of relatedness, along with recommendations based on breed-specific guidelines. Results include a breakdown of which ancestral lines contribute most to the inbreeding coefficient.'
      },
      {
        id: 'pedigree-verification',
        question: 'How can I verify the authenticity of a pedigree?',
        answer: 'Every official pedigree includes a unique verification code and QR code that can be used to confirm authenticity. Visit the "Verify Pedigree" section on our website and enter the verification code, or scan the QR code using your mobile device. The system will display the current official version of the pedigree for comparison. Digital pedigrees also include blockchain verification technology to prevent tampering or unauthorized modifications.'
      }
    ]
  },
  {
    id: 'health',
    name: 'Health Records',
    questions: [
      {
        id: 'health-testing',
        question: 'How do I add health test results for my dog?',
        answer: 'To add health test results, navigate to your dog\'s profile and select "Health Records" > "Add Health Test." Select the test type from the available options, enter the date performed, results, and upload supporting documentation. For official certification, the results should be submitted by a verified veterinarian or testing laboratory. Health test entries may require verification before becoming official.'
      },
      {
        id: 'health-requirements',
        question: 'What are the breed-specific health testing requirements?',
        answer: 'Health testing requirements vary by breed based on known genetic conditions and health issues. The system provides breed-specific recommendations on the Health Guidelines page. Generally, common tests include hip and elbow dysplasia, eye examinations, heart evaluations, and genetic tests for breed-specific conditions. These requirements may be mandatory for dogs participating in the breeding program.'
      },
      {
        id: 'view-health-records',
        question: 'Who can see my dog\'s health records?',
        answer: 'By default, a dog\'s health records are visible to its registered owner, the breeder, and system administrators. You can adjust privacy settings to make certain records visible to potential puppy buyers or other system users. Anonymized health data may be used for breed health research. Veterinarians assigned to your dog can also access health records when granted permission.'
      },
      {
        id: 'health-certificates',
        question: 'How do I get official health clearance certificates?',
        answer: 'Official health clearance certificates are issued based on verified health test results in the system. Navigate to your dog\'s health records section and select "Request Certificate" for eligible health clearances. These certificates may require administrator verification and include security features to prevent falsification. A processing fee applies for official certificates.'
      }
    ]
  },
  {
    id: 'competitions',
    name: 'Shows & Competitions',
    questions: [
      {
        id: 'add-competition-results',
        question: 'How do I add show or competition results?',
        answer: 'To add competition results, go to your dog\'s profile and select "Competitions" > "Add Result." Enter the event details, date, judges, class entered, and placement achieved. Upload supporting documentation such as judge\'s critiques or win photos. Results submitted by event organizers or judges are automatically verified, while owner-submitted results may require validation.'
      },
      {
        id: 'find-competitions',
        question: 'How can I find upcoming competitions for my dog?',
        answer: 'You can find upcoming competitions in the "Events" section of the platform. Use filters to search by date, location, event type, and breed classes offered. You can also subscribe to event notifications for your breed or geographical area. Premium members can access an integrated competition calendar with automatic recommendations based on your dog\'s eligibility.'
      },
      {
        id: 'competition-eligibility',
        question: 'How is my dog\'s competition eligibility determined?',
        answer: 'Competition eligibility is determined by factors including your dog\'s age, breed, registration status, previous titles, and specific event requirements. The system automatically calculates eligibility for different classes and events based on these factors. Some competitions may have additional requirements such as qualifying scores from previous events or specific health clearances.'
      }
    ]
  },
  {
    id: 'technical',
    name: 'Technical Support',
    questions: [
      {
        id: 'browser-compatibility',
        question: 'Which browsers are supported?',
        answer: 'The system is optimized for modern browsers including the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend keeping your browser updated to the latest version. Internet Explorer is not supported. The platform is also accessible via mobile browsers on iOS and Android devices.'
      },
      {
        id: 'app-availability',
        question: 'Is there a mobile app available?',
        answer: 'Yes, we offer mobile apps for both iOS and Android devices. The apps provide most of the functionality of the web platform with optimized interfaces for mobile use. You can download the apps from the Apple App Store or Google Play Store. Your account credentials work across web and mobile platforms.'
      },
      {
        id: 'data-export',
        question: 'Can I export my data from the system?',
        answer: 'Yes, the system allows you to export your data in several formats. From your account settings, select "Export Data" and choose the type of data you wish to export (dogs, health records, pedigrees, etc.) and your preferred format (PDF, CSV, or GEDCOM for pedigree data). Premium users have access to additional export options including customized reports and data visualization.'
      },
      {
        id: 'report-issue',
        question: 'How do I report a technical issue?',
        answer: 'To report a technical issue, click on the "Support" link in the footer menu and select "Report a Problem." Provide detailed information about the issue, including what you were doing when it occurred, any error messages, and your device and browser information. Screenshots are helpful. Our technical team will investigate and respond via your registered email address.'
      }
    ]
  },
  {
    id: 'api',
    name: 'API & Integration',
    questions: [
      {
        id: 'api-access',
        question: 'How do I access the API?',
        answer: 'API access is available to all users with a Premium or Developer subscription. To get started, navigate to "My Account" > "API Access" to generate your API key. We provide both REST and GraphQL APIs. Complete documentation is available in the "API Documentation" section, which includes endpoint references, example requests, and authentication instructions.'
      },
      {
        id: 'graphql-usage',
        question: 'How do I use the GraphQL API?',
        answer: 'Our GraphQL API is available at /api/graphql. Authentication requires a Bearer token in the Authorization header. The API supports queries for dogs, litters, health records, and other data. Key queries include GET_DOGS, GET_DOG, GET_LITTERS, GET_LITTER, and GET_DOG_LITTERS. Mutations include CREATE_LITTER, UPDATE_LITTER, and REGISTER_LITTER_PUPPIES. A GraphQL playground is available for premium users to test queries before implementation.'
      },
      {
        id: 'api-rate-limits',
        question: 'Are there rate limits for API usage?',
        answer: 'Yes, API usage is subject to rate limits based on your subscription tier. Free accounts are limited to 100 requests per day, Premium accounts to 1,000 requests per day, and Developer accounts to 10,000 requests per day. Rate limit information is included in the response headers. If you need higher limits, contact our support team to discuss custom plans.'
      },
      {
        id: 'webhooks',
        question: 'Does the system support webhooks?',
        answer: 'Yes, we offer webhooks to notify your systems of events in real-time. Webhooks can be configured in "My Account" > "API Access" > "Webhooks". Available events include new dog registrations, litter registrations, health record updates, and ownership transfers. Each webhook requires a secure HTTPS endpoint URL and can be filtered by event type.'
      },
      {
        id: 'litter-api',
        question: 'How do I manage litters through the API?',
        answer: 'Litter management is fully supported through our API. Use the CREATE_LITTER mutation to register a new litter, providing sire and dam IDs, whelping date, and puppy count. The UPDATE_LITTER mutation allows modifying litter details. For puppy registration, use REGISTER_LITTER_PUPPIES which accepts multiple puppy records in a single call. The GET_LITTERS query supports pagination and filtering by breed, date range, or breeder. GET_DOG_LITTERS retrieves all litters associated with a specific dog, either as sire or dam.'
      },
      {
        id: 'user-permissions-api',
        question: 'How are user permissions handled in the API?',
        answer: 'API access respects the same permission model as the web interface. User roles (ADMIN, OWNER, BREEDER, JUDGE, MEMBER) determine accessible operations. For example, only users with OWNER or ADMIN roles can register puppies for a litter. The API validates permissions for each request based on the authenticated user\'s roles and ownership relationships. Permission errors return a 403 status code with a detailed message explaining which permission is missing.'
      }
    ]
  }
];

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('general');
  
  // Filter FAQs based on search query
  const filteredFAQs = searchQuery 
    ? faqCategories.map(category => ({
        ...category,
        questions: category.questions.filter(q => 
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        hasMatches: category.questions.some(q => 
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.hasMatches)
    : faqCategories;

  return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Typography variant="h4" component="h1" gutterBottom>
            Frequently Asked Questions
          </Typography>
          
          <Typography variant="body1" paragraph>
            Find answers to common questions about the KUG Dog Pedigree Database System. 
            If you can't find the answer you're looking for, please contact our support team.
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search FAQs..."
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
              <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Categories
                </Typography>
                <List component="nav" disablePadding>
                  {faqCategories.map((category) => (
                    <ListItem 
                      key={category.id}
                      component="div"
                      disablePadding
                      sx={{
                        borderRadius: 1,
                        my: 0.5,
                      }}
                    >
                      <Button
                        fullWidth
                        sx={{
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          borderRadius: 1,
                          py: 1,
                          ...(activeCategory === category.id && !searchQuery ? {
                            backgroundColor: 'primary.light',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                            },
                          } : {}),
                        }}
                        onClick={() => {
                          setActiveCategory(category.id);
                          setSearchQuery('');
                        }}
                      >
                        <ListItemText primary={category.name} />
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Paper>
              
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Need More Help?
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button variant="contained" fullWidth>
                    Contact Support
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    component={Link}
                    href="/docs/user-guides"
                  >
                    View User Guides
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    component={Link}
                    href="/community/forum"
                  >
                    Community Forum
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={9}>
              {searchQuery ? (
                // Search results
                <>
                  <Typography variant="h6" gutterBottom>
                    Search Results
                    <Chip 
                      label={`${filteredFAQs.reduce((count, category) => count + category.questions.length, 0)} results`} 
                      size="small"
                      color="primary"
                      sx={{ ml: 2 }}
                    />
                  </Typography>
                  
                  {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((category) => (
                      <Box key={category.id} sx={{ mb: 4 }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                          {category.name}
                        </Typography>
                        
                        {category.questions.map((faq, index) => (
                          <Accordion key={faq.id} defaultExpanded={index === 0}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography>{faq.question}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography paragraph>{faq.answer}</Typography>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Box>
                    ))
                  ) : (
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body1" paragraph>
                        No results found for "{searchQuery}".
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try different keywords or browse the categories.
                      </Typography>
                    </Paper>
                  )}
                </>
              ) : (
                // Category view
                faqCategories.find(c => c.id === activeCategory) && (
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {faqCategories.find(c => c.id === activeCategory)?.name} Questions
                    </Typography>
                    
                    {faqCategories
                      .find(c => c.id === activeCategory)
                      ?.questions.map((faq, index) => (
                        <Accordion key={faq.id} defaultExpanded={index === 0}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>{faq.question}</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography paragraph>{faq.answer}</Typography>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                  </Box>
                )
              )}
              
              <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Didn't find what you're looking for?
                </Typography>
                <Typography variant="body2" paragraph>
                  Our support team is here to help. You can contact us through the support portal or browse our detailed user guides for more information.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="contained">
                    Contact Support
                  </Button>
                  <Button 
                    variant="outlined"
                    component={Link}
                    href="/docs/user-guides"
                  >
                    Browse User Guides
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </div>
      </div>
  );
}
