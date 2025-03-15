import { DogPedigreeData, PedigreeNode } from '@/types/pedigree';

/**
 * Builds a pedigree tree structure from flat dog data
 * @param dogId The ID of the root dog
 * @param allDogs Map of all dogs keyed by their ID
 * @param maxGenerations Maximum number of generations to include
 * @returns Root node of the pedigree tree
 */
export const buildPedigreeTree = (
  dogId: string,
  allDogs: Map<string, DogPedigreeData>,
  maxGenerations: number = 3,
  currentGeneration: number = 0
): PedigreeNode | null => {
  // Return null if we've exceeded the max generations or dog not found
  if (currentGeneration >= maxGenerations || !allDogs.has(dogId)) {
    return null;
  }

  const dog = allDogs.get(dogId);
  if (!dog) return null;

  // Create the current node
  const node: PedigreeNode = {
    dog,
    generation: currentGeneration,
    position: 0, // Will be calculated later
    children: []
  };

  // Add parents recursively if they exist
  if (dog.sireId) {
    const sireNode = buildPedigreeTree(
      dog.sireId,
      allDogs,
      maxGenerations,
      currentGeneration + 1
    );
    if (sireNode) {
      node.children?.push(sireNode);
    }
  }

  if (dog.damId) {
    const damNode = buildPedigreeTree(
      dog.damId,
      allDogs,
      maxGenerations,
      currentGeneration + 1
    );
    if (damNode) {
      node.children?.push(damNode);
    }
  }

  return node;
};

/**
 * Calculates positions for all nodes in the pedigree tree
 * @param root The root node of the pedigree tree
 * @returns The root node with updated positions
 */
export const calculateNodePositions = (root: PedigreeNode): PedigreeNode => {
  // Map to store the position count for each generation
  const genPositions = new Map<number, number>();
  
  // Traverse the tree to assign positions
  const traverseAndPositionNodes = (node: PedigreeNode): void => {
    const generation = node.generation;
    
    // Initialize position count for this generation if not exists
    if (!genPositions.has(generation)) {
      genPositions.set(generation, 0);
    }
    
    // Assign a position to this node based on its generation
    const currentPos = genPositions.get(generation) || 0;
    node.position = currentPos;
    
    // Increment the position counter for this generation
    genPositions.set(generation, currentPos + 1);
    
    // Process children if they exist
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => traverseAndPositionNodes(child));
    }
  };
  
  traverseAndPositionNodes(root);
  return root;
};

/**
 * Converts a pedigree chart to a flat array suitable for rendering
 * @param root The root node of the pedigree tree
 * @returns Array of all nodes in the tree
 */
export const flattenPedigreeTree = (root: PedigreeNode): PedigreeNode[] => {
  const result: PedigreeNode[] = [];
  
  const traverse = (node: PedigreeNode) => {
    result.push(node);
    if (node.children) {
      node.children.forEach(child => traverse(child));
    }
  };
  
  traverse(root);
  return result;
};

/**
 * Formats a Date object as a string for display in pedigree chart
 * @param date Date object to format
 * @returns Formatted date string
 */
export const formatPedigreeDate = (date: Date): string => {
  if (!(date instanceof Date)) {
    // Ensure date is a Date object
    date = new Date(date);
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
