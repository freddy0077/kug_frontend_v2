import React from 'react';

interface BreedSectionProps {
  title: string;
  children: React.ReactNode;
}

const BreedSection: React.FC<BreedSectionProps> = ({ title, children }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default BreedSection;
