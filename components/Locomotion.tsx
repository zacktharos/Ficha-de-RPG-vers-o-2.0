import React from 'react';
import { Ficha } from '../types';

interface LocomotionProps {
    ficha: Ficha;
    selectedAttribute: string | null;
    setSelectedAttribute: (attr: string | null) => void;
}

const DiceIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 3H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zM7.5 16.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
    </svg>
);


const LocomotionStat: React.FC<{
    label: string;
    value: number;
    unit: string;
    icon: string;
    attrKey: string;
    selectedAttribute: string | null;
    setSelectedAttribute: (attr: string | null) => void;
}> = ({ label, value, unit, icon, attrKey, selectedAttribute, setSelectedAttribute }) => {
    const isSelected = selectedAttribute === attrKey;

    const toggleSelection = () => {
        setSelectedAttribute(isSelected ? null : attrKey);
    };

    return (
        <div className="flex justify-between items-center py-2 px-3 bg-stone-900/50 rounded-md">
            <label className="font-bold text-stone-300 flex items-center gap-2">
                <span>{icon}</span>
                {label}
            </label>
            <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white">
                    {value}
                    <span className="text-sm text-stone-400 ml-1">{unit}</span>
                </span>
                <button
                    onClick={toggleSelection}
                    className={`transition-all ${isSelected ? 'text-yellow-400 scale-125' : 'text-stone-500 hover:text-yellow-500'}`}
                    title={`Rolar com ${label}`}
                >
                    <DiceIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};


const Locomotion: React.FC<LocomotionProps> = ({ ficha, selectedAttribute, setSelectedAttribute }) => {
    return (
        <div className="space-y-2">
            <LocomotionStat 
                label="Velocidade de Corrida"
                value={ficha.velocidadeCorrida}
                unit="km/h"
                icon="🏃‍♂️"
                attrKey="velocidadeCorrida"
                selectedAttribute={selectedAttribute}
                setSelectedAttribute={setSelectedAttribute}
            />
            <LocomotionStat 
                label="Altura do Pulo"
                value={ficha.alturaPulo}
                unit="m"
                icon="⬆️"
                attrKey="alturaPulo"
                selectedAttribute={selectedAttribute}
                setSelectedAttribute={setSelectedAttribute}
            />
            <LocomotionStat 
                label="Distância do Pulo"
                value={ficha.distanciaPulo}
                unit="m"
                icon="➡️"
                attrKey="distanciaPulo"
                selectedAttribute={selectedAttribute}
                setSelectedAttribute={setSelectedAttribute}
            />
        </div>
    );
};

export default Locomotion;
