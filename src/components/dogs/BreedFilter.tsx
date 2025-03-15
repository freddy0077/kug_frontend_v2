'use client';

interface BreedFilterProps {
  selectedBreed: string;
  onBreedSelect: (breed: string) => void;
  breeds: { id: string; name: string }[];
}

const BreedFilter: React.FC<BreedFilterProps> = ({ selectedBreed, onBreedSelect, breeds }) => {
  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex space-x-2 pb-2">
        <button
          onClick={() => onBreedSelect("")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
            selectedBreed === "" 
              ? "bg-green-600 text-white" 
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          All Breeds
        </button>
        
        {breeds.map(breed => (
          <button
            key={breed.id}
            onClick={() => onBreedSelect(breed.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedBreed === breed.id 
                ? "bg-green-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {breed.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BreedFilter;
