'use client';

import { useState, useCallback } from 'react';
import { tutorialService, TutorialStep, TutorialData, TutorialProgress, TutorialStats } from '../services/tutorial';

interface UseTutorialReturn {
  // Estados de carga
  isLoading: boolean;
  isStarting: boolean;
  isCompleting: boolean;
  isResetting: boolean;
  
  // Estados de datos
  tutorial: TutorialData | null;
  progress: TutorialProgress[] | null;
  stats: TutorialStats | null;
  error: string | null;
  
  // Estados de navegación
  currentStepIndex: number;
  currentStep: TutorialStep | null;
  isStarted: boolean;
  isCompleted: boolean;
  
  // Funciones principales
  loadTutorial: (tutorialId: string) => Promise<boolean>;
  startTutorial: (tutorialId: string) => Promise<boolean>;
  completeStep: (tutorialId: string, stepId: string) => Promise<boolean>;
  skipStep: (tutorialId: string, stepId: string) => Promise<boolean>;
  resetTutorial: (tutorialId: string) => Promise<boolean>;
  
  // Funciones de navegación
  goToStep: (stepIndex: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  
  // Funciones de utilidad
  clearError: () => void;
  refreshProgress: (tutorialId: string) => Promise<void>;
  getStepProgress: () => { completed: number; total: number; percentage: number };
}

export const useTutorial = (): UseTutorialReturn => {
  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  // Estados de datos
  const [tutorial, setTutorial] = useState<TutorialData | null>(null);
  const [progress, setProgress] = useState<TutorialProgress[] | null>(null);
  const [stats, setStats] = useState<TutorialStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de navegación
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Estados derivados
  const currentStep = tutorial?.steps[currentStepIndex] || null;
  const isStarted = Boolean(progress && progress.length > 0);
  const isCompleted = tutorial ? tutorial.steps.every(step => step.completado) : false;

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar tutorial
  const loadTutorial = useCallback(async (tutorialId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [tutorialData, progressData, statsData] = await Promise.all([
        tutorialService.obtenerTutorial(tutorialId),
        tutorialService.obtenerProgreso(tutorialId).catch(() => null), // El progreso puede no existir
        tutorialService.obtenerEstadisticas().catch(() => null), // Las estadísticas pueden no existir
      ]);
      
      setTutorial(tutorialData);
      setProgress(progressData);
      setStats(statsData);
      
      // Determinar el paso actual basado en el progreso
      if (progressData && tutorialData.steps.length > 0) {
        const lastCompletedIndex = tutorialData.steps.findLastIndex((step: TutorialStep) => step.completado);
        const nextStepIndex = Math.min(lastCompletedIndex + 1, tutorialData.steps.length - 1);
        setCurrentStepIndex(Math.max(0, nextStepIndex));
      } else {
        setCurrentStepIndex(0);
      }
      
      return true;
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Error al cargar el tutorial';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Iniciar tutorial
  const startTutorial = useCallback(async (tutorialId: string): Promise<boolean> => {
    try {
      setIsStarting(true);
      setError(null);
      
      await tutorialService.iniciarTutorial(tutorialId);
      
      // Recargar progreso
      const newProgress = await tutorialService.obtenerProgreso(tutorialId);
      setProgress(newProgress);
      
      return true;
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Error al iniciar el tutorial';
      setError(errorMessage);
      return false;
    } finally {
      setIsStarting(false);
    }
  }, []);

  // Completar paso
  const completeStep = useCallback(async (tutorialId: string, stepId: string): Promise<boolean> => {
    try {
      setIsCompleting(true);
      setError(null);
      
      await tutorialService.completarPaso({ tutorialId, stepId });
      
      // Actualizar el paso como completado localmente
      if (tutorial) {
        const updatedTutorial = {
          ...tutorial,
          steps: tutorial.steps.map(step => 
            step.id === stepId ? { ...step, completado: true } : step
          ),
        };
        setTutorial(updatedTutorial);
      }
      
      // Recargar progreso y estadísticas
      const [newProgress, newStats] = await Promise.all([
        tutorialService.obtenerProgreso(tutorialId),
        tutorialService.obtenerEstadisticas().catch(() => stats), // Mantener stats anteriores si falla
      ]);
      
      setProgress(newProgress);
      if (newStats) setStats(newStats);
      
      return true;
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Error al completar el paso';
      setError(errorMessage);
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [tutorial, stats]);

  // Saltar paso
  const skipStep = useCallback(async (tutorialId: string, stepId: string): Promise<boolean> => {
    try {
      setError(null);
      
      await tutorialService.saltarPaso(tutorialId, stepId);
      
      // Recargar progreso
      const newProgress = await tutorialService.obtenerProgreso(tutorialId);
      setProgress(newProgress);
      
      return true;
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Error al saltar el paso';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Reiniciar tutorial
  const resetTutorial = useCallback(async (tutorialId: string): Promise<boolean> => {
    try {
      setIsResetting(true);
      setError(null);
      
      await tutorialService.reiniciarTutorial(tutorialId);
      
      // Recargar todo
      await loadTutorial(tutorialId);
      
      return true;
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Error al reiniciar el tutorial';
      setError(errorMessage);
      return false;
    } finally {
      setIsResetting(false);
    }
  }, [loadTutorial]);

  // Refrescar progreso
  const refreshProgress = useCallback(async (tutorialId: string): Promise<void> => {
    try {
      const [newProgress, newStats] = await Promise.all([
        tutorialService.obtenerProgreso(tutorialId),
        tutorialService.obtenerEstadisticas().catch(() => stats),
      ]);
      
      setProgress(newProgress);
      if (newStats) setStats(newStats);
    } catch (err: unknown) {
      console.error('Error refreshing progress:', err);
    }
  }, [stats]);

  // Navegar a paso específico
  const goToStep = useCallback((stepIndex: number) => {
    if (!tutorial) return;
    
    const targetIndex = Math.max(0, Math.min(stepIndex, tutorial.steps.length - 1));
    setCurrentStepIndex(targetIndex);
  }, [tutorial]);

  // Ir al siguiente paso
  const goToNextStep = useCallback(() => {
    if (!tutorial) return;
    
    const nextIndex = Math.min(currentStepIndex + 1, tutorial.steps.length - 1);
    setCurrentStepIndex(nextIndex);
  }, [tutorial, currentStepIndex]);

  // Ir al paso anterior
  const goToPreviousStep = useCallback(() => {
    const prevIndex = Math.max(currentStepIndex - 1, 0);
    setCurrentStepIndex(prevIndex);
  }, [currentStepIndex]);

  // Obtener progreso de pasos
  const getStepProgress = useCallback(() => {
    if (!tutorial) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    
    const total = tutorial.steps.length;
    const completed = tutorial.steps.filter(step => step.completado).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  }, [tutorial]);

  return {
    // Estados de carga
    isLoading,
    isStarting,
    isCompleting,
    isResetting,
    
    // Estados de datos
    tutorial,
    progress,
    stats,
    error,
    
    // Estados de navegación
    currentStepIndex,
    currentStep,
    isStarted,
    isCompleted,
    
    // Funciones principales
    loadTutorial,
    startTutorial,
    completeStep,
    skipStep,
    resetTutorial,
    
    // Funciones de navegación
    goToStep,
    goToNextStep,
    goToPreviousStep,
    
    // Funciones de utilidad
    clearError,
    refreshProgress,
    getStepProgress,
  };
};

export default useTutorial;