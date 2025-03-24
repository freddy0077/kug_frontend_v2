'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const healthCategories = [
  {
    id: "genetic-testing",
    name: "Genetic Health Testing",
    description: "Essential genetic tests for different breeds to detect inherited disorders.",
    content: `
      <h3 class="text-xl font-semibold mb-4">Genetic Health Testing Guidelines</h3>
      <p class="mb-4">Genetic testing is crucial for responsible breeding practices. The following guidelines will help breeders identify and reduce the prevalence of hereditary diseases:</p>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Recommended Genetic Tests by Breed Group</h4>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Sporting Dogs:</strong> Hip and Elbow Dysplasia, Exercise-Induced Collapse (EIC), Progressive Retinal Atrophy (PRA)</li>
        <li class="mb-2"><strong>Hounds:</strong> Factor VII Deficiency, Thrombopathia, Degenerative Myelopathy</li>
        <li class="mb-2"><strong>Working Dogs:</strong> Dilated Cardiomyopathy (DCM), von Willebrand's Disease, Degenerative Myelopathy</li>
        <li class="mb-2"><strong>Terriers:</strong> Primary Lens Luxation (PLL), Late Onset Ataxia, Neuronal Ceroid Lipofuscinosis (NCL)</li>
        <li class="mb-2"><strong>Toys:</strong> Patellar Luxation, Legg-Calve-Perthes Disease, Tracheal Collapse</li>
        <li class="mb-2"><strong>Non-Sporting:</strong> Multidrug Resistance (MDR1), Hyperuricosuria, Cystinuria</li>
        <li class="mb-2"><strong>Herding:</strong> Collie Eye Anomaly, Neuronal Ceroid Lipofuscinosis, MDR1 Gene Mutation</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Testing Protocols</h4>
      <p class="mb-4">For optimal results, follow these testing protocols:</p>
      <ol class="list-decimal ml-6 mb-4">
        <li class="mb-2">Test breeding stock before first breeding</li>
        <li class="mb-2">Use accredited laboratories for reliable results</li>
        <li class="mb-2">Maintain detailed records of all test results</li>
        <li class="mb-2">Share results openly with potential puppy buyers</li>
        <li class="mb-2">Follow breed-specific testing recommendations</li>
      </ol>
    `
  },
  {
    id: "screening-protocols",
    name: "Health Screening Protocols",
    description: "Standardized screening protocols for common health issues.",
    content: `
      <h3 class="text-xl font-semibold mb-4">Health Screening Protocols</h3>
      <p class="mb-4">Regular health screenings are essential for maintaining breed health and catching potential problems early. The following screening protocols should be followed by all responsible breeders:</p>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Hip Dysplasia Screening</h4>
      <p class="mb-4">Hip scoring should be performed by qualified veterinarians using standardized methodologies:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>OFA Evaluation:</strong> X-rays taken at 24 months or older</li>
        <li class="mb-2"><strong>PennHIP Method:</strong> Can be performed as early as 16 weeks</li>
        <li class="mb-2"><strong>BVA/KC Hip Scheme:</strong> X-rays taken at 12 months or older</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Eye Examinations</h4>
      <p class="mb-4">Comprehensive eye examinations should be performed by board-certified veterinary ophthalmologists:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2">Initial examination before breeding</li>
        <li class="mb-2">Annual examinations throughout breeding career</li>
        <li class="mb-2">Screening for breed-specific conditions</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Cardiac Evaluations</h4>
      <p class="mb-4">Cardiac screenings should be performed by board-certified veterinary cardiologists:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Auscultation:</strong> Basic screening for heart murmurs</li>
        <li class="mb-2"><strong>Echocardiogram:</strong> More detailed evaluation for specific conditions</li>
        <li class="mb-2"><strong>Holter Monitoring:</strong> 24-hour ECG recording for arrhythmias</li>
      </ul>
    `
  },
  {
    id: "vaccination-guidelines",
    name: "Vaccination Guidelines",
    description: "Essential vaccination schedules for puppies and adult dogs.",
    content: `
      <h3 class="text-xl font-semibold mb-4">Vaccination Guidelines</h3>
      <p class="mb-4">Proper vaccination is crucial for preventing infectious diseases in dogs. These guidelines provide a framework for vaccination schedules:</p>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Core Vaccines (Recommended for All Dogs)</h4>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Distemper:</strong> Highly contagious viral disease affecting multiple body systems</li>
        <li class="mb-2"><strong>Parvovirus:</strong> Highly contagious viral disease primarily affecting the intestinal tract</li>
        <li class="mb-2"><strong>Adenovirus (Hepatitis):</strong> Viral disease affecting the liver</li>
        <li class="mb-2"><strong>Rabies:</strong> Fatal viral disease affecting the nervous system (legally required in most regions)</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Non-Core Vaccines (Based on Risk Assessment)</h4>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Bordetella (Kennel Cough):</strong> For dogs frequently boarded or in group settings</li>
        <li class="mb-2"><strong>Leptospirosis:</strong> For dogs in areas with high prevalence</li>
        <li class="mb-2"><strong>Lyme Disease:</strong> For dogs in areas with high tick prevalence</li>
        <li class="mb-2"><strong>Canine Influenza:</strong> For dogs in regions with outbreaks</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Puppy Vaccination Schedule</h4>
      <table class="min-w-full mb-6 border">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-2 border">Age</th>
            <th class="px-4 py-2 border">Recommended Vaccines</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="px-4 py-2 border">6-8 weeks</td>
            <td class="px-4 py-2 border">Distemper, Parvovirus</td>
          </tr>
          <tr>
            <td class="px-4 py-2 border">10-12 weeks</td>
            <td class="px-4 py-2 border">DHPP (Distemper, Hepatitis, Parainfluenza, Parvovirus), optional non-core vaccines</td>
          </tr>
          <tr>
            <td class="px-4 py-2 border">14-16 weeks</td>
            <td class="px-4 py-2 border">DHPP, Rabies, optional non-core vaccines</td>
          </tr>
          <tr>
            <td class="px-4 py-2 border">12-16 months</td>
            <td class="px-4 py-2 border">DHPP, Rabies booster</td>
          </tr>
        </tbody>
      </table>
    `
  },
  {
    id: "nutrition-guidelines",
    name: "Nutrition Guidelines",
    description: "Proper nutrition recommendations for different life stages.",
    content: `
      <h3 class="text-xl font-semibold mb-4">Nutrition Guidelines</h3>
      <p class="mb-4">Proper nutrition is fundamental to a dog's health and wellbeing. These guidelines outline nutritional needs at different life stages:</p>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Puppy Nutrition (0-12 months)</h4>
      <p class="mb-4">Puppies require a diet high in protein, calories, and essential nutrients to support rapid growth:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2">22-32% protein content</li>
        <li class="mb-2">Balanced calcium to phosphorus ratio (1.2:1)</li>
        <li class="mb-2">DHA for brain and eye development</li>
        <li class="mb-2">3-4 meals per day until 6 months, then 2-3 meals</li>
        <li class="mb-2">Large/giant breed puppies require controlled growth formulas</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Adult Nutrition (1-7 years)</h4>
      <p class="mb-4">Adult dogs require balanced nutrition to maintain health and energy levels:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2">18-25% protein content</li>
        <li class="mb-2">5-15% fat content based on activity level</li>
        <li class="mb-2">Balanced omega-3 and omega-6 fatty acids</li>
        <li class="mb-2">Appropriate calorie intake to maintain ideal body condition</li>
        <li class="mb-2">1-2 meals per day depending on preference</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Senior Nutrition (7+ years)</h4>
      <p class="mb-4">Senior dogs have changing nutritional needs as metabolism slows:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2">Moderate protein (20-28%) of high biological value</li>
        <li class="mb-2">Reduced calories to prevent weight gain</li>
        <li class="mb-2">Increased fiber for digestive health</li>
        <li class="mb-2">Joint supporting nutrients (glucosamine, chondroitin)</li>
        <li class="mb-2">Antioxidants for cellular health</li>
      </ul>
    `
  },
  {
    id: "reproductive-health",
    name: "Reproductive Health",
    description: "Guidelines for breeding, whelping, and postnatal care.",
    content: `
      <h3 class="text-xl font-semibold mb-4">Reproductive Health Guidelines</h3>
      <p class="mb-4">Proper reproductive management is essential for producing healthy litters and maintaining dam health:</p>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Pre-Breeding Health Checks</h4>
      <p class="mb-4">Before breeding, ensure both dam and sire are in optimal health:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2">Complete physical examination</li>
        <li class="mb-2">Genetic testing for breed-specific conditions</li>
        <li class="mb-2">Brucellosis testing</li>
        <li class="mb-2">Reproductive organ evaluation</li>
        <li class="mb-2">Nutritional assessment and optimization</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Pregnancy Management</h4>
      <p class="mb-4">During pregnancy, the dam requires special care:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2">Pregnancy confirmation via ultrasound (21-30 days) or X-ray (after 45 days)</li>
        <li class="mb-2">Gradual transition to high-quality puppy or performance food</li>
        <li class="mb-2">Regular veterinary check-ups</li>
        <li class="mb-2">Appropriate exercise (decreasing as pregnancy progresses)</li>
        <li class="mb-2">Prenatal supplements as recommended by veterinarian</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Whelping Preparation</h4>
      <p class="mb-4">Proper preparation for whelping improves outcomes:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2">Whelping box setup 1-2 weeks before due date</li>
        <li class="mb-2">Temperature monitoring to predict labor</li>
        <li class="mb-2">Sterilized whelping supplies</li>
        <li class="mb-2">Veterinary contact information and emergency plan</li>
        <li class="mb-2">Familiarity with normal whelping progression and warning signs</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Postpartum Care</h4>
      <p class="mb-4">After whelping, both dam and puppies require close monitoring:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2">Monitor dam for signs of complications (fever, discharge, lethargy)</li>
        <li class="mb-2">Ensure puppies are nursing properly</li>
        <li class="mb-2">Weigh puppies daily for the first two weeks</li>
        <li class="mb-2">Maintain clean whelping environment</li>
        <li class="mb-2">Provide dam with high-quality nutrition for lactation</li>
      </ul>
    `
  }
];

export default function HealthGuidelines() {
  const [selectedCategory, setSelectedCategory] = useState<string>(healthCategories[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter categories based on search query
  const filteredCategories = healthCategories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find the selected category
  const selectedCategoryData = selectedCategory 
    ? healthCategories.find(category => category.id === selectedCategory) 
    : healthCategories[0];

  return (
    <ProtectedRoute allowedRoles={[]}>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Health Guidelines</h1>
          <p className="text-gray-600 mb-8">
            Comprehensive health guidelines for dog breeders, owners, and handlers. These resources provide 
            essential information for maintaining optimal health throughout a dog's life, from puppyhood through 
            senior years, and for reproductive health during breeding.
          </p>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Category List */}
            <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <label htmlFor="search-categories" className="sr-only">Search Health Categories</label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="search-categories"
                    id="search-categories"
                    className="block w-full rounded-md border-0 py-2 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    placeholder="Search health topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <h2 className="text-lg font-medium text-gray-900 mb-3">Health Categories</h2>
              <ul className="space-y-2">
                {filteredCategories.map(category => (
                  <li key={category.id}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-gray-500">{category.description}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Category Details */}
            {selectedCategoryData && (
              <div className="w-full md:w-2/3 bg-white p-6 rounded-lg shadow-md">
                <article className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedCategoryData.content }} />
                </article>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Resources</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link 
                        href="/docs/user-guides"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                          <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                        </svg>
                        Download Health Guidelines PDF
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/tools/genetic-calculator"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M15.988 3.012A2.25 2.25 0 0118 5.25v6.5A2.25 2.25 0 0115.75 14H13.5v-3.379a3 3 0 00-.879-2.121l-3.12-3.121a3 3 0 00-1.402-.791 2.997 2.997 0 00-.288-.044l.1.099a3 3 0 00-.12-.436l-.152-.45a2.989 2.989 0 00-.111-.252l-.242-.481a3.017 3.017 0 00-.137-.217l-.35-.467a2.99 2.99 0 00-.16-.203L5.98 1.394A2.25 2.25 0 018.239 2.99l7.75.022zM2 8.876V15.25A2.25 2.25 0 004.25 17.5h9.5A2.25 2.25 0 0016 15.25v-5.834l-.5.037a2.25 2.25 0 01-1.893-.747l-2.896-3.374A2.25 2.25 0 008.25 5.25h-.012c.074.012.147.026.22.044.145.036.285.08.42.13l.013.005.013.005.076.027.161.06.016.006.142.054.099.039c.007.003.013.005.02.008l.001.001a2.25 2.25 0 011.12 1.949v3.89c0 .617.492 1.126 1.11 1.143l3.833.035a2.248 2.248 0 012.004 1.447L18 13.991v-8.74A2.25 2.25 0 0015.75 3h-9.5A2.25 2.25 0 004 5.25v2.876l.883-.584a2.25 2.25 0 011.117-.33z" clipRule="evenodd" />
                        </svg>
                        Use the Genetic Calculator
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/health-records"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                        </svg>
                        Browse Health Records Database
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
