'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const CodeInput: React.FC<CodeInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  placeholder = '',
  className = '',
  autoFocus = false,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Inicializar array de valores
  const values = value.split('').concat(Array(length - value.length).fill(''));

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleInputChange = (index: number, inputValue: string) => {
    if (disabled) return;

    // Solo permitir números y letras
    const sanitizedValue = inputValue.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    if (sanitizedValue.length > 1) {
      // Si se pega un código completo
      const newValue = sanitizedValue.slice(0, length);
      onChange(newValue);
      
      // Enfocar el último input o el siguiente disponible
      const nextIndex = Math.min(newValue.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      return;
    }

    // Actualizar valor en la posición específica
    const newValues = [...values];
    newValues[index] = sanitizedValue;
    
    const newValue = newValues.join('').slice(0, length);
    onChange(newValue);

    // Mover al siguiente input si se ingresó un carácter
    if (sanitizedValue && index < length - 1) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (values[index]) {
        // Si hay valor en el input actual, borrarlo
        const newValues = [...values];
        newValues[index] = '';
        const newValue = newValues.join('').replace(/\s+$/, '');
        onChange(newValue);
      } else if (index > 0) {
        // Si no hay valor, ir al input anterior y borrarlo
        const newValues = [...values];
        newValues[index - 1] = '';
        const newValue = newValues.join('').replace(/\s+$/, '');
        onChange(newValue);
        
        const prevInput = inputRefs.current[index - 1];
        if (prevInput) {
          prevInput.focus();
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const newValue = pastedData.slice(0, length);
    onChange(newValue);
    
    // Enfocar el último input
    const lastIndex = Math.min(newValue.length, length - 1);
    if (inputRefs.current[lastIndex]) {
      inputRefs.current[lastIndex].focus();
    }
  };

  return (
    <div className={`flex gap-1 sm:gap-2 ${className}`}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          value={values[index] || ''}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={1}
          className={`
            w-10 h-10 sm:w-12 sm:h-12 text-center text-base sm:text-lg font-semibold border-2 rounded-lg
            transition-all duration-200 outline-none
            ${error 
              ? 'border-red-500 bg-red-50 text-red-900' 
              : focusedIndex === index
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }
            ${disabled 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'cursor-text'
            }
            ${values[index] ? 'border-green-500 bg-green-50' : ''}
          `}
          style={{
            caretColor: 'transparent', // Ocultar cursor
          }}
        />
      ))}
    </div>
  );
};

export default CodeInput;