import React from 'react';

interface BreedAttributeCardProps {
  title: string;
  value?: string | null;
  icon?: React.ReactNode;
}

const BreedAttributeCard: React.FC<BreedAttributeCardProps> = ({ 
  title, 
  value, 
  icon 
}) => {
  if (!value) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-start">
      {icon && <div className="mr-4 text-green-600">{icon}</div>}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default BreedAttributeCard;
