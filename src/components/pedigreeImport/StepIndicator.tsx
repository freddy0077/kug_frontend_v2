'use client';

import React from 'react';

interface Step {
  name: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress" className="border-t border-b border-gray-200 bg-gray-50">
      <ol className="divide-y divide-gray-200 lg:flex lg:divide-y-0">
        {steps.map((step, index) => {
          // Determine step status
          let status = 'upcoming';
          if (index < currentStep) status = 'complete';
          if (index === currentStep) status = 'current';
          if (index > currentStep) status = 'upcoming';
          
          return (
            <li key={step.name} className="relative lg:flex-1">
              <div className="px-6 py-5 flex items-center">
                {/* Step indicator circle */}
                <div className="flex-shrink-0">
                  <span
                    className={`h-10 w-10 flex items-center justify-center rounded-full ${
                      status === 'complete' 
                        ? 'bg-green-600 group-hover:bg-green-800' 
                        : status === 'current'
                          ? 'border-2 border-green-600 bg-white'
                          : 'border-2 border-gray-300 bg-white'
                    }`}
                  >
                    {status === 'complete' ? (
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span
                        className={`text-sm font-medium ${
                          status === 'current' ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </span>
                </div>
                
                {/* Step content */}
                <div className="ml-4 min-w-0 flex-1">
                  <h3
                    className={`text-sm font-medium ${
                      status === 'complete' || status === 'current'
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
              
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-0 right-0 h-full w-5">
                  <svg
                    className="h-full w-full text-gray-200"
                    viewBox="0 0 22 80"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 -2L20 40L0 82"
                      vectorEffect="non-scaling-stroke"
                      stroke="currentcolor"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepIndicator;
