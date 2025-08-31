const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
    const response = await fetch(`${API_BASE_URL}/tutorial/${tutorialId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Incluir cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener tutorial');
    }

    return response.json();
  },

  // Obtener todos los tutoriales disponibles
  obtenerTutoriales: async (): Promise<TutorialData[]> => {
    const response = await fetch(`${API_BASE_URL}/tutorial`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Incluir cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener tutoriales');
    }

    return response.json();
  },

  // Completar un paso del tutorial
  completarPaso: async (data: CompletarPasoDto): Promise<{ success: boolean; nextStep?: TutorialStep }> => {
    const response = await fetch(`${API_BASE_URL}/tutorial/completar-paso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Incluir cookies
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al completar paso');
    }

    return response.json();
  },

  // Obtener estadísticas del tutorial
  obtenerEstadisticas: async (): Promise<TutorialStats> => {
    const response = await fetch(`${API_BASE_URL}/tutorial/estadisticas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Incluir cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener estadísticas');
    }

    return response.json();
  },

  // Reiniciar tutorial
  reiniciarTutorial: async (tutorialId: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/tutorial/${tutorialId}/reiniciar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Incluir cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al reiniciar tutorial');
    }

    return response.json();
  },

  // Iniciar tutorial
  iniciarTutorial: async (tutorialId: string): Promise<{ success: boolean; tutorial: TutorialData }> => {
    const response = await fetch(`${API_BASE_URL}/tutorial/${tutorialId}/iniciar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Incluir cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al iniciar tutorial');
    }

    return response.json();
  },

  // Obtener progreso de tutorial específico
  obtenerProgreso: async (tutorialId: string): Promise<TutorialProgress[]> => {
    const response = await fetch(`${API_BASE_URL}/tutorial/${tutorialId}/progreso`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Incluir cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener progreso');
    }

    return response.json();
  },

  // Saltar paso (si es opcional)
  saltarPaso: async (tutorialId: string, stepId: string): Promise<{ success: boolean; nextStep?: TutorialStep }> => {
    const response = await fetch(`${API_BASE_URL}/tutorial/saltar-paso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Incluir cookies
      body: JSON.stringify({ tutorialId, stepId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al saltar paso');
    }

    return response.json();
  },
};