'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';

export default function GeneticCalculator() {
  const { user } = useAuth();
  const [gene1, setGene1] = useState<string>('');
  const [gene2, setGene2] = useState<string>('');
  const [results, setResults] = useState<{[key: string]: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Common coat color genes in dogs
  const geneOptions = [
    { value: 'B', label: 'B - Black (Dominant)' },
    { value: 'b', label: 'b - Brown/Liver/Chocolate (Recessive)' },
    { value: 'E', label: 'E - Extension (Allows black pigment)' },
    { value: 'e', label: 'e - Recessive red (Prevents black pigment)' },
    { value: 'K', label: 'K - Dominant Black' },
    { value: 'kbr', label: 'kbr - Brindle' },
    { value: 'ky', label: 'ky - Allow Agouti expression' },
    { value: 'A', label: 'A - Agouti (Wolf gray/Sable)' },
    { value: 'ay', label: 'ay - Sable/Fawn' },
    { value: 'aw', label: 'aw - Agouti/Wild' },
    { value: 'as', label: 'as - Saddle tan' },
    { value: 'at', label: 'at - Tan points/Bicolor' },
    { value: 'a', label: 'a - Recessive black' },
    { value: 'D', label: 'D - Dense pigment (Not diluted)' },
    { value: 'd', label: 'd - Diluted pigment (Blue/Gray)' },
    { value: 'M', label: 'M - Merle' },
    { value: 'm', label: 'm - Non-merle' },
    { value: 'S', label: 'S - No white spotting' },
    { value: 's', label: 's - Irish spotting' },
    { value: 'sp', label: 'sp - Piebald spotting' },
    { value: 'sw', label: 'sw - Extreme white piebald' },
  ];

  // Parse genotype into alleles
  const parseGenotype = (genotype: string): string[] => {
    // Remove spaces and split into individual characters/alleles
    return genotype.replace(/\s+/g, '').split('');
  };

  // Calculate Punnett square results
  const calculatePunnettSquare = () => {
    try {
      setError(null);
      
      // Basic validation
      if (!gene1 || !gene2) {
        setError('Please enter both parent genotypes');
        setResults(null);
        return;
      }

      const alleles1 = parseGenotype(gene1);
      const alleles2 = parseGenotype(gene2);
      
      // More validation
      if (alleles1.length === 0 || alleles2.length === 0) {
        setError('Invalid genotype format');
        setResults(null);
        return;
      }

      if (alleles1.length !== alleles2.length) {
        setError('Parent genotypes must have the same number of alleles');
        setResults(null);
        return;
      }

      // Generate all possible combinations
      const combinations: {[key: string]: number} = {};
      const totalCombinations = Math.pow(2, alleles1.length);
      
      for (let i = 0; i < alleles1.length; i += 2) {
        if (i + 1 < alleles1.length) {
          const gene1Allele1 = alleles1[i];
          const gene1Allele2 = alleles1[i + 1];
          const gene2Allele1 = alleles2[i];
          const gene2Allele2 = alleles2[i + 1];
          
          const offspring = [
            gene1Allele1 + gene2Allele1,
            gene1Allele1 + gene2Allele2,
            gene1Allele2 + gene2Allele1,
            gene1Allele2 + gene2Allele2
          ];
          
          offspring.forEach(combo => {
            // Sort alleles within each combo (e.g. "Bb" instead of "bB")
            const sortedCombo = [...combo].sort((a, b) => {
              // Uppercase letters come before lowercase
              if (a.toUpperCase() === b.toUpperCase()) {
                return a === a.toUpperCase() ? -1 : 1;
              }
              return a.toUpperCase() < b.toUpperCase() ? -1 : 1;
            }).join('');
            
            combinations[sortedCombo] = (combinations[sortedCombo] || 0) + 1;
          });
        }
      }
      
      // Calculate percentages
      const result: {[key: string]: number} = {};
      const total = Object.values(combinations).reduce((sum, count) => sum + count, 0);
      
      Object.entries(combinations).forEach(([combo, count]) => {
        result[combo] = (count / total) * 100;
      });
      
      setResults(result);
    } catch (err) {
      setError('Error calculating genetic probabilities. Please check your inputs and try again.');
      setResults(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.OWNER, UserRole.ADMIN, UserRole.HANDLER]}>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Genetic Calculator</h1>
            <p className="text-gray-600 mb-6">
              Calculate the probability of offspring genotypes based on parent genotypes. 
              Enter the genotypes for both parents and click Calculate to view the results.
            </p>
            
            {/* Input section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label htmlFor="gene1" className="block text-sm font-medium text-gray-700 mb-2">
                  Parent 1 Genotype
                </label>
                <input
                  type="text"
                  id="gene1"
                  placeholder="e.g., Bb Ee"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                  value={gene1}
                  onChange={(e) => setGene1(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format example: Bb Ee (for heterozygous black and extension)
                </p>
              </div>
              
              <div>
                <label htmlFor="gene2" className="block text-sm font-medium text-gray-700 mb-2">
                  Parent 2 Genotype
                </label>
                <input
                  type="text"
                  id="gene2"
                  placeholder="e.g., Bb ee"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                  value={gene2}
                  onChange={(e) => setGene2(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format example: Bb ee (for heterozygous black and homozygous recessive extension)
                </p>
              </div>
            </div>
            
            <div className="flex justify-center mb-8">
              <button
                type="button"
                onClick={calculatePunnettSquare}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Calculate Probabilities
              </button>
            </div>
            
            {/* Common gene reference section */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Common Dog Genetic Markers Reference</h2>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {geneOptions.map((gene) => (
                    <div key={gene.value} className="text-sm">
                      <span className="font-semibold">{gene.value}</span>: {gene.label.split(' - ')[1]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Results section */}
            {results && Object.keys(results).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Offspring Probability Results</h2>
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(results).map(([genotype, probability]) => (
                      <div key={genotype} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                        <div className="text-lg font-medium text-gray-900 mb-1">{genotype}</div>
                        <div className="text-blue-600 font-semibold">{probability.toFixed(2)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h3 className="text-md font-medium text-blue-800 mb-2">Understanding the Results</h3>
                  <p className="text-sm text-blue-700">
                    These results show the probability of each possible genotype in the offspring.
                    Remember that genotype (genetic makeup) doesn't always directly correspond to phenotype (visible traits),
                    as some traits are dominant, recessive, or influenced by multiple genes.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Additional information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use This Calculator</h2>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-medium text-gray-900">Step 1: Enter Parent Genotypes</h3>
                <p>Enter the genotypes for both parents, using capital letters for dominant alleles and lowercase for recessive.</p>
                <p className="text-sm text-gray-500">Example: "Bb Ee" means heterozygous for both the B (black) and E (extension) genes.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Step 2: Calculate</h3>
                <p>Click the "Calculate Probabilities" button to generate all possible offspring genotypes and their probabilities.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Step 3: Interpret Results</h3>
                <p>The results show the likelihood of each genotype appearing in offspring. Remember that:</p>
                <ul className="list-disc pl-5 text-sm">
                  <li>Dominant genes (uppercase) will mask recessive genes in the physical appearance</li>
                  <li>Some traits require multiple genes to work together</li>
                  <li>This is a simplified model - actual inheritance can be more complex</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                <h3 className="font-medium text-yellow-800">Important Notes</h3>
                <p className="text-sm text-yellow-700">
                  This calculator provides estimates based on Mendelian inheritance principles. 
                  Actual genetic inheritance in dogs can be more complex, with factors like linked genes, 
                  polygenic traits, and epigenetics. For professional breeding guidance, consult with a 
                  veterinary geneticist.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
