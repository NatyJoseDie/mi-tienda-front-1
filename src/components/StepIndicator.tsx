'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

interface Step {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  isActive: boolean;
  isOptional?: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showDescriptions?: boolean;
  className?: string;
  onStepClick?: (stepId: string) => void;
  allowClickOnCompleted?: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  orientation = 'horizontal',
  size = 'md',
  showDescriptions = true,
  className = '',
  onStepClick,
  allowClickOnCompleted = true,
}) => {
  const sizeClasses = {
    sm: {
      circle: 'w-8 h-8 text-sm',
      title: 'text-sm',
      description: 'text-xs',
      connector: orientation === 'horizontal' ? 'h-0.5' : 'w-0.5',
    },
    md: {
      circle: 'w-10 h-10 text-base',
      title: 'text-base',
      description: 'text-sm',
      connector: orientation === 'horizontal' ? 'h-1' : 'w-1',
    },
    lg: {
      circle: 'w-12 h-12 text-lg',
      title: 'text-lg',
      description: 'text-base',
      connector: orientation === 'horizontal' ? 'h-1.5' : 'w-1.5',
    },
  };

  const classes = sizeClasses[size];

  const handleStepClick = (step: Step) => {
    if (onStepClick && (step.isCompleted && allowClickOnCompleted || step.isActive)) {
      onStepClick(step.id);
    }
  };

  const getStepStatus = (step: Step) => {
    if (step.isCompleted) return 'completed';
    if (step.isActive) return 'active';
    return 'pending';
  };

  const getStepClasses = (step: Step) => {
    const status = getStepStatus(step);
    const isClickable = onStepClick && (step.isCompleted && allowClickOnCompleted || step.isActive);
    
    const baseClasses = `
      ${classes.circle}
      rounded-full flex items-center justify-center font-semibold
      transition-all duration-200 ease-in-out
      ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
    `;

    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-500 text-white shadow-lg hover:bg-green-600`;
      case 'active':
        return `${baseClasses} bg-blue-500 text-white shadow-lg ring-4 ring-blue-200 hover:bg-blue-600`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-500 hover:bg-gray-300`;
    }
  };

  const getConnectorClasses = () => {
    const baseClasses = `
      ${classes.connector}
      transition-all duration-300 ease-in-out
    `;

    if (orientation === 'horizontal') {
      return `${baseClasses} flex-1 mx-2`;
    } else {
      return `${baseClasses} my-2 mx-auto`;
    }
  };

  const getConnectorColor = (index: number) => {
    const step = steps[index];
    return step.isCompleted ? 'bg-green-500' : 'bg-gray-200';
  };

  const renderStepContent = (step: Step, index: number) => (
    <div
      key={step.id}
      className={`
        flex items-center
        ${orientation === 'vertical' ? 'flex-col' : ''}
        ${orientation === 'horizontal' ? 'flex-1' : 'w-full'}
      `}
    >
      {/* Círculo del paso */}
      <div
        className={getStepClasses(step)}
        onClick={() => handleStepClick(step)}
        role={onStepClick ? 'button' : undefined}
        tabIndex={onStepClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onStepClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleStepClick(step);
          }
        }}
      >
        {step.isCompleted ? (
          <CheckIcon className="w-5 h-5" />
        ) : (
          <span>{index + 1}</span>
        )}
      </div>

      {/* Contenido del paso */}
      {(step.title || (showDescriptions && step.description)) && (
        <div className={`
          ${orientation === 'horizontal' ? 'ml-3 text-left' : 'mt-2 text-center'}
          ${orientation === 'horizontal' ? 'flex-1' : ''}
        `}>
          <div className={`
            ${classes.title}
            font-medium
            ${step.isActive ? 'text-blue-600' : step.isCompleted ? 'text-green-600' : 'text-gray-500'}
          `}>
            {step.title}
            {step.isOptional && (
              <span className="ml-1 text-xs text-gray-400">(Opcional)</span>
            )}
          </div>
          
          {showDescriptions && step.description && (
            <div className={`
              ${classes.description}
              text-gray-500 mt-1
              ${orientation === 'horizontal' ? 'max-w-xs' : ''}
            `}>
              {step.description}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderConnector = (index: number) => {
    if (index === steps.length - 1) return null;

    return (
      <div
        key={`connector-${index}`}
        className={`
          ${getConnectorClasses()}
          ${getConnectorColor(index)}
        `}
      />
    );
  };

  return (
    <div className={`
      ${className}
      ${orientation === 'horizontal' ? 'flex items-start' : 'flex flex-col'}
    `}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {renderStepContent(step, index)}
          {renderConnector(index)}
        </React.Fragment>
      ))}
    </div>
  );
};

// Componente simplificado para pasos horizontales pequeños
export const StepIndicatorMini: React.FC<Omit<StepIndicatorProps, 'size' | 'showDescriptions' | 'orientation'>> = (props) => (
  <StepIndicator
    {...props}
    size="sm"
    showDescriptions={false}
    orientation="horizontal"
  />
);

// Componente para navegación vertical en sidebar
export const StepIndicatorSidebar: React.FC<Omit<StepIndicatorProps, 'orientation'>> = (props) => (
  <StepIndicator
    {...props}
    orientation="vertical"
  />
);

export default StepIndicator;