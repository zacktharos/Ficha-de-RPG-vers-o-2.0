import React from 'react';
import { Ficha } from '../types';
import Tooltip from './Tooltip';

interface LocomotionProps {
    ficha: Ficha;
    selectedAttribute: string | null;
    setSelectedAttribute: (attr: string | null) => void;
}

const locomotionTooltips: Record<string, string> = {
    velocidadeCorrida: "Corra como o vento! Sua velocidade base é 25 km/h, e cada 3 pontos em Agilidade te deixam 3 km/h mais rápido. A vantagem 'Combo Físico' te transforma num verdadeiro velocista com +25 km/h!",
    alturaPulo: "Alcance os céus! Você já pula 1 metro, e cada 10 pontos em Força te impulsionam 1 metro mais alto. Com o 'Combo Físico', você ganha +2 metros de altura, superando qualquer obstáculo.",
    distanciaPulo: "Cruze abismos com um salto! Seu pulo básico tem 3 metros. Sua Força e Agilidade (a cada 5 pontos em ambos) te impulsionam mais longe. O 'Combo Físico' adiciona impressionantes 6 metros à sua distância!"
};

const QuestionMarkIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`inline-block w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);

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

    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div className="flex justify-between items-center py-2 px-3 bg-stone-900/50 rounded-md" style={componentStyle}>
             <div className="font-bold flex items-center gap-2">
                <span>{icon}</span>
                <span>{label}</span>
                <Tooltip text={locomotionTooltips[attrKey]}>
                    <span className="cursor-help text-xs opacity-70" aria-label={`Explicação para ${label}`}><QuestionMarkIcon /></span>
                </Tooltip>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-bold text-lg">
                    {value}
                    <span className="text-sm opacity-70 ml-1">{unit}</span>
                </span>
                <button
                    onClick={toggleSelection}
                    className={`transition-all ${isSelected ? 'scale-125' : 'opacity-50 hover:opacity-100'}`}
                    style={{ color: isSelected ? 'var(--accent-color)' : 'var(--text-color)'}}
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
