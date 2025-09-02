import api from '@/lib/api';

// Interfaces para el sistema de tutorial
export interface TutorialStep {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'info' | 'action' | 'form' | 'navigation';
  target?: string; // Selector CSS para resaltar elemento
  position?: 'top' | 'bottom' | 'left' | 'right';
  required: boolean;
  completado: boolean;
  orden: number;
}

export interface TutorialData {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: 'onboarding' | 'features' | 'advanced';
  estimatedTime: number; // en minutos
  steps: TutorialStep[];
  completado: boolean;
  progreso: number; // 0-100
  fechaInicio?: string;
  fechaCompletado?: string;
}

export interface TutorialProgress {
  tutorialId: string;
  stepId: string;
  completado: boolean;
  timestamp: string;
  timeSpent?: number; // en segundos
}

export interface TutorialStats {
  totalTutoriales: number;
  completados: number;
  enProgreso: number;
  tiempoTotal: number; // en minutos
  ultimaActividad: string;
  tutorialesPorCategoria: {
    onboarding: number;
    features: number;
    advanced: number;
  };
}

export interface CompletarPasoDto {
  tutorialId: string;
  stepId: string;
  timeSpent?: number;
  metadata?: Record<string, unknown>;
}

// Servicio de tutorial
export const tutorialService = {
  // Obtener tutorial específico
  obtenerTutorial: async (tutorialId: string): Promise<TutorialData> => {
    try {
      const res = await api.get(`/tutorial/${tutorialId}`);
      return res.data;
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || 'Error al obtener tutorial');
    }
  },

  // Obtener todos los tutoriales disponibles
  obtenerTutoriales: async (): Promise<TutorialData[]> => {
    try {
      const res = await api.get('/tutorial');
      return res.data;
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || 'Error al obtener tutoriales');
    }
  },

  // Completar un paso del tutorial
  completarPaso: async (data: CompletarPasoDto): Promise<{ success: boolean; nextStep?: TutorialStep }> => {
    try {
      const res = await api.post('/tutorial/completar-paso', data);
      return res.data;
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || 'Error al completar paso');
    }
  },

  // Obtener estadísticas del tutorial
  obtenerEstadisticas: async (): Promise<TutorialStats> => {
    try {
      const res = await api.get('/tutorial/estadisticas');
      return res.data;
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  // Reiniciar tutorial
  reiniciarTutorial: async (tutorialId: string): Promise<{ success: boolean }> => {
    try {
      const res = await api.post(`/tutorial/${tutorialId}/reiniciar`);
      return res.data;
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || 'Error al reiniciar tutorial');
    }
  },

  // Iniciar tutorial
  iniciarTutorial: async (tutorialId: string): Promise<{ success: boolean; tutorial: TutorialData }> => {
    try {
      const res = await api.post(`/tutorial/${tutorialId}/iniciar`);
      return res.data;
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || 'Error al iniciar tutorial');
    }
  },

  // Obtener progreso de tutorial específico
  obtenerProgreso: async (tutorialId: string): Promise<TutorialProgress[]> => {
    try {
      const res = await api.get(`/tutorial/${tutorialId}/progreso`);
      return res.data;
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || 'Error al obtener progreso');
    }
  },

  // Saltar paso (si es opcional)
  saltarPaso: async (tutorialId: string, stepId: string): Promise<{ success: boolean; nextStep?: TutorialStep }> => {
    try {
      const res = await api.post('/tutorial/saltar-paso', { tutorialId, stepId });
      return res.data;
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || 'Error al saltar paso');
    }
  },
};