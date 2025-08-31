'use client';

import React from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number; // Tamaño en píxeles
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  className = '',
  showPercentage = true,
  color = '#3B82F6', // blue-500
  backgroundColor = '#E5E7EB', // gray-200
  animated = true,
}) => {
  // Calcular dimensiones
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Normalizar progreso
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Círculo de fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-30"
        />
        
        {/* Círculo de progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`
            ${animated ? 'transition-all duration-500 ease-out' : ''}
            drop-shadow-sm
          `}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
          }}
        />
        
        {/* Punto de inicio (opcional) */}
        {normalizedProgress > 0 && (
          <circle
            cx={size / 2}
            cy={strokeWidth / 2}
            r={strokeWidth / 3}
            fill={color}
            className={animated ? 'transition-all duration-500 ease-out' : ''}
          />
        )}
      </svg>
      
      {/* Contenido central */}
      <div className="absolute inset-0 flex items-center justify-center">
        {showPercentage ? (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(normalizedProgress)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Completado
            </div>
          </div>
        ) : (
          <div className="w-4 h-4 rounded-full bg-current" style={{ color }} />
        )}
      </div>
      
      {/* Efecto de brillo (opcional) */}
      {normalizedProgress > 0 && (
        <div 
          className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, ${color} ${normalizedProgress}%, transparent ${normalizedProgress}%)`,
            filter: 'blur(8px)',
          }}
        />
      )}
    </div>
  );
};

// Componente de progreso pequeño para uso en listas
export const ProgressRingSmall: React.FC<Omit<ProgressRingProps, 'size' | 'strokeWidth' | 'showPercentage'>> = (props) => (
  <ProgressRing
    {...props}
    size={40}
    strokeWidth={4}
    showPercentage={false}
  />
);

// Componente de progreso grande para pantallas principales
export const ProgressRingLarge: React.FC<Omit<ProgressRingProps, 'size' | 'strokeWidth'>> = (props) => (
  <ProgressRing
    {...props}
    size={160}
    strokeWidth={12}
  />
);

// Componente con animación de pulso para estados de carga
export const ProgressRingPulse: React.FC<ProgressRingProps> = (props) => {
  return (
    <div className="relative">
      <ProgressRing {...props} />
      
      {/* Efecto de pulso */}
      <div 
        className="absolute inset-0 rounded-full animate-ping opacity-20"
        style={{
          backgroundColor: props.color || '#3B82F6',
          animationDuration: '2s',
        }}
      />
    </div>
  );
};

export default ProgressRing;