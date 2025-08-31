'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, PlayIcon } from '@heroicons/react/24/solid';
import ProgressTutorial from './ProgressTutorial';
import StepIndicator from './StepIndicator';
import { TutorialStep, TutorialProgress, tutorialService } from '../services/tutorial';

interface TutorialInteractivoProps {
  tutorialId: string;
  onComplete?: () => void;
  onExit?: () => void;
  autoStart?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
  className?: string;
}

const TutorialInteractivo: React.FC<TutorialInteractivoProps> = ({
  tutorialId,
  onComplete,
  onExit,
  autoStart = false,
  showProgress = true,
  allowSkip = true,
  className = '',
}) => {
  // Estados principales
  const [tutorial, setTutorial] = useState<{ pasos: TutorialStep[]; titulo: string; descripcion: string; estimatedTime: number } | null>(null);
  const [progress, setProgress] = useState<TutorialProgress[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [completingStep, setCompletingStep] = useState<string | null>(null);

  // Cargar tutorial y progreso
  useEffect(() => {
    const loadTutorial = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [tutorialData, progressData] = await Promise.all([
          tutorialService.obtenerTutorial(tutorialId),
          tutorialService.obtenerProgreso(tutorialId),
        ]);

        setTutorial({
          pasos: tutorialData.steps,
          titulo: tutorialData.titulo,
          descripcion: tutorialData.descripcion,
          estimatedTime: tutorialData.estimatedTime,
        });
        setProgress(progressData);

        // Encontrar el paso actual basado en el progreso
        if (progressData && tutorialData.steps.length > 0) {
          const lastCompletedIndex = tutorialData.steps.findLastIndex(step => step.completado);
          const nextStepIndex = Math.min(lastCompletedIndex + 1, tutorialData.steps.length - 1);
          setCurrentStepIndex(Math.max(0, nextStepIndex));
          
          // Si hay progreso, considerar como iniciado
          if (progressData.length > 0) {
            setIsStarted(true);
          }
        }

        if (autoStart && (!progressData || progressData.length === 0)) {
          await startTutorial();
        }
      } catch (err) {
        setError('Error al cargar el tutorial');
        console.error('Error loading tutorial:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTutorial();
  }, [tutorialId, autoStart]);

  // Iniciar tutorial
  const startTutorial = useCallback(async () => {
    try {
      await tutorialService.iniciarTutorial(tutorialId);
      setIsStarted(true);
      
      // Recargar progreso
      const newProgress = await tutorialService.obtenerProgreso(tutorialId);
      setProgress(newProgress);
    } catch (err) {
      setError('Error al iniciar el tutorial');
      console.error('Error starting tutorial:', err);
    }
  }, [tutorialId]);

  // Completar paso actual
  const completeCurrentStep = async () => {
    if (!tutorial || !tutorial.pasos[currentStepIndex]) return;

    const currentStep = tutorial.pasos[currentStepIndex];
    
    try {
      setCompletingStep(currentStep.id);
      
      await tutorialService.completarPaso({
        tutorialId,
        stepId: currentStep.id
      });
      
      // Actualizar el paso como completado localmente
      const updatedTutorial = {
        ...tutorial,
        pasos: tutorial.pasos.map(step => 
          step.id === currentStep.id ? { ...step, completado: true } : step
        ),
      };
      setTutorial(updatedTutorial);

      // Recargar progreso
      const newProgress = await tutorialService.obtenerProgreso(tutorialId);
      setProgress(newProgress);

      // Verificar si es el último paso
      const isLastStep = currentStepIndex === tutorial.pasos.length - 1;
      if (isLastStep) {
        // Tutorial completado
        if (onComplete) {
          onComplete();
        }
      } else {
        // Avanzar al siguiente paso
        setCurrentStepIndex(prev => Math.min(prev + 1, tutorial.pasos.length - 1));
      }
    } catch (err) {
      setError('Error al completar el paso');
      console.error('Error completing step:', err);
    } finally {
      setCompletingStep(null);
    }
  };

  // Saltar paso
  const skipCurrentStep = async () => {
    if (!tutorial || !allowSkip) return;

    const currentStep = tutorial.pasos[currentStepIndex];
    
    try {
      await tutorialService.saltarPaso(tutorialId, currentStep.id);
      
      // Avanzar al siguiente paso
      const isLastStep = currentStepIndex === tutorial.pasos.length - 1;
      if (isLastStep) {
        if (onComplete) {
          onComplete();
        }
      } else {
        setCurrentStepIndex(prev => Math.min(prev + 1, tutorial.pasos.length - 1));
      }
    } catch (err) {
      setError('Error al saltar el paso');
      console.error('Error skipping step:', err);
    }
  };

  // Navegar a paso específico
  const goToStep = (stepIndex: number) => {
    if (!tutorial) return;
    
    const targetIndex = Math.max(0, Math.min(stepIndex, tutorial.pasos.length - 1));
    setCurrentStepIndex(targetIndex);
  };

  // Navegar pasos
  const goToPreviousStep = () => goToStep(currentStepIndex - 1);
  const goToNextStep = () => goToStep(currentStepIndex + 1);

  // Salir del tutorial
  const exitTutorial = () => {
    if (onExit) {
      onExit();
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tutorial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!tutorial || !progress) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-gray-600">Tutorial no encontrado</p>
      </div>
    );
  }

  // Pantalla de inicio
  if (!isStarted) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <div className="mb-6">
            <PlayIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{tutorial.titulo}</h2>
            <p className="text-gray-600">{tutorial.descripcion}</p>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{tutorial.pasos.length}</div>
                <div className="text-sm text-gray-500">Pasos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {tutorial.pasos.filter(p => p.required).length}
                </div>
                <div className="text-sm text-gray-500">Obligatorios</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  ~{tutorial.estimatedTime}m
                </div>
                <div className="text-sm text-gray-500">Duración</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={startTutorial}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Comenzar Tutorial
            </button>
            {onExit && (
              <button
                onClick={exitTutorial}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Salir
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentStep = tutorial.pasos[currentStepIndex];
  const isLastStep = currentStepIndex === tutorial.pasos.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{tutorial.titulo}</h2>
          <p className="text-sm text-gray-500">
            Paso {currentStepIndex + 1} de {tutorial.pasos.length}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {showProgress && progress && (
            <div className="hidden md:block">
              <ProgressTutorial
                progress={progress}
                steps={tutorial.pasos}
                currentStepId={currentStep?.id}
                compact={true}
              />
            </div>
          )}
          
          {onExit && (
            <button
              onClick={exitTutorial}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido del paso */}
      <div className="p-6">
        {currentStep && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {currentStep.titulo}
                {!currentStep.required && (
                  <span className="ml-2 text-sm text-gray-500">(Opcional)</span>
                )}
              </h3>
              <p className="text-gray-600">{currentStep.descripcion}</p>
            </div>

            {/* Información del tipo de paso */}
            {currentStep.tipo === 'action' && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Acción requerida</h4>
                <p className="text-blue-800">Complete la acción indicada para continuar.</p>
              </div>
            )}
            
            {currentStep.tipo === 'form' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Formulario</h4>
                <p className="text-green-800">Complete el formulario para continuar.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer con navegación */}
      <div className="flex items-center justify-between p-6 border-t border-gray-100">
        <button
          onClick={goToPreviousStep}
          disabled={isFirstStep}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          <span>Anterior</span>
        </button>

        <div className="flex items-center space-x-3">
          {allowSkip && !currentStep?.completado && (
            <button
              onClick={skipCurrentStep}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Saltar
            </button>
          )}
          
          {!currentStep?.completado ? (
            <button
              onClick={completeCurrentStep}
              disabled={completingStep === currentStep?.id}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {completingStep === currentStep?.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <CheckCircleIcon className="w-5 h-5" />
              )}
              <span>{isLastStep ? 'Finalizar' : 'Completar'}</span>
            </button>
          ) : (
            <button
              onClick={goToNextStep}
              disabled={isLastStep}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <span>{isLastStep ? 'Finalizado' : 'Siguiente'}</span>
              {!isLastStep && <ChevronRightIcon className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Indicador de pasos en mobile */}
      <div className="md:hidden p-4 border-t border-gray-100">
        <StepIndicator
          steps={tutorial.pasos.map(step => ({
            id: step.id,
            title: step.titulo,
            description: '',
            isCompleted: step.completado,
            isActive: step.id === currentStep?.id,
            isOptional: !step.required,
          }))}
          orientation="horizontal"
          size="sm"
          showDescriptions={false}
          onStepClick={(stepId) => {
            const stepIndex = tutorial.pasos.findIndex(p => p.id === stepId);
            if (stepIndex !== -1) goToStep(stepIndex);
          }}
        />
      </div>
    </div>
  );
};

export default TutorialInteractivo;