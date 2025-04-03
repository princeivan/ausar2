
import React from 'react';
import { Check } from 'lucide-react';

interface StepsProps {
  currentStep: number;
  steps: Array<{ id: number, name: string }>;
}

export const Steps = ({ currentStep, steps }: StepsProps) => {
  return (
    <div className="overflow-hidden">
      <div className="relative flex justify-between items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div className="relative flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                    isCompleted 
                      ? 'bg-brand-blue text-white' 
                      : isCurrent
                        ? 'bg-white border-2 border-brand-blue text-brand-blue' 
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span 
                  className={`mt-2 text-sm ${
                    isCompleted || isCurrent ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
              </div>
              
              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div 
                    className={`h-1 ${
                      currentStep > index + 1 
                        ? 'bg-brand-blue' 
                        : 'bg-gray-300'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
