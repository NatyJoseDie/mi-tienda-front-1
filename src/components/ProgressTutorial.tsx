'use client';

import React from 'react';
import ProgressRing from './ProgressRing';
import StepIndicator from './StepIndicator';
import { TutorialStep, TutorialProgress } from '../services/tutorial';

interface ProgressTutorialProps {
  progress: TutorialProgress[];
  steps: TutorialStep[];
  currentStepId?: string;
  onStepClick?: (stepId: string) => void;
  showDetailedProgress?: boolean;
  compact?: boolean;
  className?: string;
}

const ProgressTutorial: React.FC<ProgressTutorialProps> = ({
  progress,
  steps,
  currentStepId,
  onStepClick,
  showDetailedProgress = true,
  compact = false,
  className = '',
}) => {
  // Calcular progreso general
  const totalSteps = steps.length;
  const completedSteps = steps.filter(step => step.completado).length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Preparar pasos para StepIndicator
  const indicatorSteps = steps.map(step => ({
    id: step.id,
    title: step.titulo,
    description: step.descripcion,
    isCompleted: step.completado,
    isActive: step.id === currentStepId,
    isOptional: !step.required,
  }));

  // Obtener estadísticas
  const timeSpent = progress.reduce((total, p) => total + (p.timeSpent || 0), 0) / 60; // convertir a minutos
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (compact) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          {/* Progreso circular pequeño */}
          <div className="flex items-center space-x-3">
            <ProgressRing
              progress={progressPercentage}
              size={60}
              strokeWidth={6}
              showPercentage={false}
              color="#10B981" // green-500
            />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {completedSteps} de {totalSteps} pasos
              </div>
              <div className="text-xs text-gray-500">
                {Math.round(progressPercentage)}% completado
              </div>
            </div>
          </div>

          {/* Tiempo invertido */}
          {timeSpent > 0 && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Tiempo invertido</div>
              <div className="text-sm font-medium text-gray-900">
                {formatTime(timeSpent)}
              </div>
            </div>
          )}
        </div>

        {/* Barra de progreso lineal */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header con progreso principal */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Progreso del Tutorial
          </h3>
          {progress.length > 0 && progress[0].timestamp && (
            <div className="text-sm text-gray-500">
              Iniciado: {new Date(progress[0].timestamp).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center mb-6">
          <ProgressRing
            progress={progressPercentage}
            size={120}
            strokeWidth={8}
            color="#10B981" // green-500
            animated={true}
          />
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{completedSteps}</div>
            <div className="text-sm text-gray-500">Completados</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{totalSteps - completedSteps}</div>
            <div className="text-sm text-gray-500">Pendientes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {timeSpent > 0 ? formatTime(timeSpent) : '0m'}
            </div>
            <div className="text-sm text-gray-500">Tiempo</div>
          </div>
        </div>
      </div>

      {/* Lista de pasos detallada */}
      {showDetailedProgress && (
        <div className="p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Pasos del Tutorial
          </h4>
          
          <StepIndicator
            steps={indicatorSteps}
            orientation="vertical"
            size="md"
            showDescriptions={true}
            onStepClick={onStepClick}
            allowClickOnCompleted={true}
            className="space-y-4"
          />
        </div>
      )}

      {/* Footer con acciones */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {progressPercentage === 100 ? (
              <span className="text-green-600 font-medium">
                🎉 ¡Tutorial completado!
              </span>
            ) : (
              `${Math.round(progressPercentage)}% completado`
            )}
          </div>
          
          {progress.length > 0 && (
            <div className="text-xs text-gray-500">
              Última actividad: {new Date(progress[progress.length - 1].timestamp).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de progreso para el header/navbar
export const ProgressTutorialHeader: React.FC<{
  steps: TutorialStep[];
  className?: string;
}> = ({ steps, className = '' }) => {
  const totalSteps = steps.length;
  const completedSteps = steps.filter(step => step.completado).length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <ProgressRing
        progress={progressPercentage}
        size={32}
        strokeWidth={3}
        showPercentage={false}
        color="#10B981"
      />
      <div className="text-sm">
        <span className="font-medium text-gray-900">{completedSteps}/{totalSteps}</span>
        <span className="text-gray-500 ml-1">pasos</span>
      </div>
    </div>
  );
};

// Componente de progreso flotante/sticky
export const ProgressTutorialFloating: React.FC<{
  steps: TutorialStep[];
  currentStepId?: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
}> = ({ steps, currentStepId, onStepClick, className = '' }) => {
  const totalSteps = steps.length;
  const completedSteps = steps.filter(step => step.completado).length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const indicatorSteps = steps.map(step => ({
    id: step.id,
    title: step.titulo,
    description: '',
    isCompleted: step.completado,
    isActive: step.id === currentStepId,
    isOptional: !step.required,
  }));

  return (
    <div className={`
      fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50
      max-w-sm
      ${className}
    `}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">Tutorial</h4>
        <div className="text-xs text-gray-500">
          {Math.round(progressPercentage)}%
        </div>
      </div>
      
      <StepIndicator
        steps={indicatorSteps}
        orientation="horizontal"
        size="sm"
        showDescriptions={false}
        onStepClick={onStepClick}
        className="mb-3"
      />
      
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-green-500 h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressTutorial;