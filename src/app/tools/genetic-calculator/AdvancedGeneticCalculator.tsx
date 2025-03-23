'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/utils/permissionUtils';

type GeneticTrait = {
  name: string;
  value: string;
  description: string;
};

type GenotypeProbability = {
  genotype: string;
  probability: number;
  phenotype?: string;
};

export default function AdvancedGeneticCalculator() {
  const { user } = useAuth();
  const [parent1Genotype, setParent1Genotype] = useState<string>('');
  const [parent2Genotype, setParent2Genotype] = useState<string>('');
  const [results, setResults] = useState<GenotypeProbability[]>([]);
  const [showHelp, setShowHelp] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Common coat color genes reference for dogs
  const geneticTraits: GeneticTrait[] = [
    { name: 'B Locus (Black/Brown)', value: 'Bb', description: 'B = Black pigment (dominant), b = brown/liver pigment (recessive)' },
    { name: 'E Locus (Extension)', value: 'Ee', description: 'E = Extension allowing black pigment (dominant), e = recessive red/yellow (recessive)' },
    { name: 'K Locus (Dominant Black)', value: 'Kky', description: 'K = Dominant black (dominant), ky = allows A locus expression (recessive)' },
    { name: 'A Locus (Agouti)', value: 'Aay', description: 'A = Wild type (agouti), ay = sable/fawn, aw = agouti, as = saddle tan, at = tan points, a = recessive black' },
    { name: 'D Locus (Dilution)', value: 'Dd', description: 'D = Full pigment (dominant), d = diluted color (recessive)' },
    { name: 'M Locus (Merle)', value: 'Mm', description: 'M = Merle pattern (dominant), m = normal coloration (recessive)' },
    { name: 'S Locus (Spotting)', value: 'Ss', description: 'S = Solid color (dominant), s = white spotting (recessive)' },
  ];

  // Parse genotype into alleles
  const parseGenotype = (genotype: string): string[] => {
    // Remove spaces and split into individual characters/alleles
    return genotype.replace(/\s+/g, '').split('');
  };

  // Add a trait to parent genotype
  const addTraitToGenotype = (currentGenotype: string, trait: string): string => {
    const updatedGenotype = currentGenotype ? `${currentGenotype} ${trait}` : trait;
    return updatedGenotype;
  };

  // Calculate Punnett square results
  const calculatePunnettSquare = () => {
    try {
      setError(null);
      
      // Basic validation
      if (!parent1Genotype || !parent2Genotype) {
        setError('Please enter both parent genotypes');
        setResults([]);
        return;
      }

      const alleles1 = parseGenotype(parent1Genotype);
      const alleles2 = parseGenotype(parent2Genotype);
      
      // More validation
      if (alleles1.length === 0 || alleles2.length === 0) {
        setError('Invalid genotype format');
        setResults([]);
        return;
      }

      if (alleles1.length !== alleles2.length) {
        setError('Parent genotypes must have the same number of alleles');
        setResults([]);
        return;
      }

      // Generate all possible combinations
      const combinations: {[key: string]: number} = {};
      
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
      const total = Object.values(combinations).reduce((sum, count) => sum + count, 0);
      const resultArray: GenotypeProbability[] = [];
      
      Object.entries(combinations).forEach(([genotype, count]) => {
        const probability = (count / total) * 100;
        resultArray.push({
          genotype,
          probability,
          phenotype: interpretGenotype(genotype)
        });
      });
      
      // Sort by probability (highest first)
      resultArray.sort((a, b) => b.probability - a.probability);
      
      setResults(resultArray);
    } catch (err) {
      setError('Error calculating genetic probabilities. Please check your inputs and try again.');
      setResults([]);
    }
  };

  // Interpret the phenotype based on genotype
  const interpretGenotype = (genotype: string): string => {
    // This is a simplified interpretation, would need to be more complex in a real app
    if (genotype.includes('ee')) {
      return 'Red/Yellow (recessive red)';
    } else if (genotype.includes('K') && !genotype.includes('ee')) {
      return 'Solid Black (dominant black)';
    } else if (genotype.includes('kbr') && !genotype.includes('ee')) {
      return 'Brindle';
    } else if (genotype.includes('bb') && !genotype.includes('ee')) {
      return 'Brown/Liver/Chocolate';
    } else if (genotype.includes('B') && !genotype.includes('ee')) {
      return 'Black';
    }
    
    return 'Unknown';
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Genetic Calculator</h1>
      
      {showHelp && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">How to Use</h2>
            <button 
              onClick={() => setShowHelp(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              ×
            </button>
          </div>
          <p className="mb-2">
            Enter the genotypes for both parents to calculate the probability of offspring genotypes.
          </p>
          <p className="mb-2">
            Format each genotype with pairs of alleles (e.g., "Bb Ee Kky").
          </p>
          <p>
            For each gene locus, uppercase letters represent dominant alleles, and lowercase represent recessive alleles.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-3">Parent 1</h2>
          <label className="block mb-2">
            Genotype
            <input
              type="text"
              value={parent1Genotype}
              onChange={(e) => setParent1Genotype(e.target.value)}
              placeholder="e.g., Bb Ee Kky"
              className="block w-full border rounded p-2 mt-1"
            />
          </label>
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Add Common Traits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {geneticTraits.map((trait, index) => (
                <button
                  key={index}
                  onClick={() => setParent1Genotype(addTraitToGenotype(parent1Genotype, trait.value))}
                  className="text-sm bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 text-left"
                  title={trait.description}
                >
                  {trait.name}: {trait.value}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-3">Parent 2</h2>
          <label className="block mb-2">
            Genotype
            <input
              type="text"
              value={parent2Genotype}
              onChange={(e) => setParent2Genotype(e.target.value)}
              placeholder="e.g., Bb ee kyky"
              className="block w-full border rounded p-2 mt-1"
            />
          </label>
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Add Common Traits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {geneticTraits.map((trait, index) => (
                <button
                  key={index}
                  onClick={() => setParent2Genotype(addTraitToGenotype(parent2Genotype, trait.value))}
                  className="text-sm bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 text-left"
                  title={trait.description}
                >
                  {trait.name}: {trait.value}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-6">
        <button
          onClick={calculatePunnettSquare}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Calculate Probabilities
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-red-700">
          {error}
        </div>
      )}
      
      {results.length > 0 && (
        <div className="border rounded-lg p-4 bg-white shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-3">Offspring Probabilities</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Genotype</th>
                  <th className="border p-2 text-left">Probability</th>
                  <th className="border p-2 text-left">Phenotype</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="border p-2 font-mono">{result.genotype}</td>
                    <td className="border p-2">{result.probability.toFixed(1)}%</td>
                    <td className="border p-2">{result.phenotype}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-3">Common Dog Genetic Markers Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Gene</th>
                <th className="border p-2 text-left">Alleles</th>
                <th className="border p-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">B Locus</td>
                <td className="border p-2 font-mono">B, b</td>
                <td className="border p-2">B = Black pigment, b = brown/liver/chocolate</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border p-2">E Locus</td>
                <td className="border p-2 font-mono">E, e</td>
                <td className="border p-2">E = Extension (allows black pigment), e = recessive red/yellow</td>
              </tr>
              <tr>
                <td className="border p-2">K Locus</td>
                <td className="border p-2 font-mono">K, kbr, ky</td>
                <td className="border p-2">K = Dominant black, kbr = brindle, ky = allows agouti expression</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border p-2">A Locus</td>
                <td className="border p-2 font-mono">Ay, aw, as, at, a</td>
                <td className="border p-2">Ay = sable/fawn, aw = agouti, as = saddle tan, at = tan points, a = recessive black</td>
              </tr>
              <tr>
                <td className="border p-2">D Locus</td>
                <td className="border p-2 font-mono">D, d</td>
                <td className="border p-2">D = Dense pigment, d = diluted color (blue/gray)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border p-2">M Locus</td>
                <td className="border p-2 font-mono">M, m</td>
                <td className="border p-2">M = Merle pattern, m = normal coloration</td>
              </tr>
              <tr>
                <td className="border p-2">S Locus</td>
                <td className="border p-2 font-mono">S, sp, si, sw</td>
                <td className="border p-2">S = Solid color, sp = piebald spotting, si = Irish spotting, sw = extreme white</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
