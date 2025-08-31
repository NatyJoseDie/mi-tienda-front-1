'use client';

import { useState } from 'react';
import ConfiguracionVisual from '@/components/admin/ConfiguracionVisual';
import SubirArchivos from '@/components/admin/SubirArchivos';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('visual');

  const tabs = [
    { id: 'visual', label: 'Configuración Visual', icon: '🎨' },
    { id: 'archivos', label: 'Archivos', icon: '📁' },
    { id: 'general', label: 'General', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración de la Tienda</h1>
          <p className="mt-2 text-gray-600">Personaliza la apariencia y configuración de tu tienda</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'visual' && <ConfiguracionVisual />}
          {activeTab === 'archivos' && <SubirArchivos />}
          {activeTab === 'general' && (
            <div className="text-center py-12">
              <p className="text-gray-500">Configuración general próximamente...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}