import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step {
  id: number;
  label: string;
}

interface BranchStepperProps {
  steps: Step[];
  currentStep: number;
}

export default function BranchStepper({ steps, currentStep }: BranchStepperProps) {
  return (
    <div className="flex items-center justify-center mb-6 pb-8 px-4 w-full">
      <div className="flex items-center w-full max-w-2xl relative">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <div key={step.id} className={`flex items-center ${index !== steps.length - 1 ? 'flex-1' : ''}`}>
              {/* Step Circle */}
              <div className="flex flex-col items-center relative z-10">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isCompleted || isActive ? '#f97316' : '#ffffff',
                    borderColor: isCompleted || isActive ? '#f97316' : '#e5e7eb',
                    color: isCompleted || isActive ? '#ffffff' : '#9ca3af',
                    boxShadow: isActive ? '0 0 0 4px rgba(249, 115, 22, 0.2)' : '0 0 0 0px rgba(0,0,0,0)',
                  }}
                  transition={{ duration: 0.3 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm ${
                    isActive ? 'ring-4 ring-brand-orange-500/20 ring-offset-2 ring-offset-gray-50' : ''
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 text-white" /> : step.id}
                </motion.div>
                <div className="absolute top-12 whitespace-nowrap">
                  <span className={`text-sm font-bold ${isActive ? 'text-brand-navy' : isCompleted ? 'text-brand-orange-600' : 'text-text-secondary'}`}>
                    {step.label}
                  </span>
                </div>
              </div>

              {/* Connector Line */}
              {index !== steps.length - 1 && (
                <div className="flex-1 px-4 relative z-0 mt-[-20px]">
                  <div className={`h-1 w-full rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-brand-orange-500' : 'bg-gray-200 border-t border-dashed border-gray-300 bg-transparent'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
