import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...'
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full border-t-2 border-b-2 border-green-500 animate-spin`}></div>
        <div 
          className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-t-2 border-b-2 border-green-200 animate-spin`} 
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>
      </div>
      {message && <p className="mt-3 text-gray-600">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
