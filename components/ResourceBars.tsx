
import React from 'react';
import { Ficha } from '../types.ts';
import EditableStat from './EditableStat.tsx';

interface ResourceBarsProps {
    ficha: Ficha;
    onUpdate: (updates: Partial<Ficha>) => void;
    isGmMode: boolean;
    onGmUpdate: (attr: keyof Ficha, adjustment: number) => void;
}

const ResourceBar: React.FC<{
    label: string;
    current: number;
    total: number;
    color: string;
    icon: string;
    regeneration: number;
    onCurrentChange: (value: number) => void;
    totalKey: keyof Ficha;
    isGmMode: boolean;
    onGmUpdate: (attr: keyof Ficha, adjustment: number) => void;
    baseTotal: number;
}> = ({ label, current, total, color, icon, regeneration, onCurrentChange, totalKey, isGmMode, onGmUpdate, baseTotal }) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    
    const handleGmUpdate = (newValue: number) => {
        const adjustment = newValue - baseTotal;
        onGmUpdate(totalKey, adjustment);
    };

    return (
        <div className="bg-stone-900/50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-bold text-white">{icon} {label}</span>
                <div className="font-mono flex items-center gap-1">
                    <span>{current} /</span>
                    <EditableStat
                        value={total}
                        isGmMode={isGmMode}
                        onUpdate={handleGmUpdate}
                        displayClass="font-mono"
                        inputClass="w-16 text-center bg-stone-800 border border-stone-600 rounded-md"
                    />
                </div>
            </div>
            <div className="w-full bg-stone-700 rounded-full h-4 overflow-hidden border border-stone-600">
                <div
                    className={`${color} h-4 rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
             <div className="flex items-center justify-center mt-2 gap-2">
                <button onClick={() => onCurrentChange(Math.max(0, current - 1))} className="w-8 h-8 rounded-full bg-stone-700 hover:bg-stone-600">-</button>
                 <input
                    type="number"
                    value={current}
                    onChange={(e) => onCurrentChange(Math.max(0, Math.min(total, parseInt(e.target.value) || 0)))}
                    className="w-16 text-center bg-stone-800 border border-stone-600 rounded-md"
                />
                <button onClick={() => onCurrentChange(Math.min(total, current + 1))} className="w-8 h-8 rounded-full bg-stone-700 hover:bg-stone-600">+</button>
            </div>
            <div className="text-center text-xs text-stone-400 mt-2">
                Regeneração: {regeneration}/turno
            </div>
        </div>
    );
};


const ResourceBars: React.FC<ResourceBarsProps> = ({ ficha, onUpdate, isGmMode, onGmUpdate }) => {
    // Calculate base values without GM adjustments to compute adjustments correctly
    const baseVidaTotal = Math.ceil(50 + (ficha.constituicao * (3 + Math.floor(ficha.forca / 10))) + 10 * ficha.nivel);
    const baseMagiaTotal = Math.ceil(20 + 3 * ficha.constituicao + (ficha.inteligencia >= 10 ? ficha.constituicao * Math.floor(ficha.inteligencia / 10) : 0));
    const baseVigorTotal = parseFloat((10 + 0.4 * ficha.constituicao).toFixed(1));

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResourceBar
                label="Vida"
                icon="❤️"
                current={ficha.vidaAtual}
                total={ficha.vidaTotal}
                baseTotal={baseVidaTotal}
                regeneration={ficha.regeneracaoVida}
                color="bg-red-500"
                onCurrentChange={(val) => onUpdate({vidaAtual: val})}
                totalKey="vidaTotal"
                isGmMode={isGmMode}
                onGmUpdate={onGmUpdate}
            />
            <ResourceBar
                label="Magia"
                icon="✨"
                current={ficha.magiaAtual}
                total={ficha.magiaTotal}
                baseTotal={baseMagiaTotal}
                regeneration={ficha.regeneracaoMagia}
                color="bg-blue-500"
                onCurrentChange={(val) => onUpdate({magiaAtual: val})}
                totalKey="magiaTotal"
                isGmMode={isGmMode}
                onGmUpdate={onGmUpdate}
            />
            <ResourceBar
                label="Vigor"
                icon="⚡"
                current={ficha.vigorAtual}
                total={ficha.vigorTotal}
                baseTotal={baseVigorTotal}
                regeneration={ficha.regeneracaoVigor}
                color="bg-yellow-500"
                onCurrentChange={(val) => onUpdate({vigorAtual: val})}
                totalKey="vigorTotal"
                isGmMode={isGmMode}
                onGmUpdate={onGmUpdate}
            />
        </div>
    );
};

export default ResourceBars;
