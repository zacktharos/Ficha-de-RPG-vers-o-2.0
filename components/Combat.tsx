import React from 'react';
import { Ficha } from '../types';
import EditableStat from './EditableStat';

interface CombatProps {
    ficha: Ficha;
    onUpdate: <K extends keyof Ficha>(key: K, value: Ficha[K]) => void;
    onRecalculate: (ficha: Ficha) => void;
    isGmMode: boolean;
    onGmUpdate: (attr: keyof Ficha, adjustment: number) => void;
}

const WeaponInput: React.FC<{
    hand: 'Direita' | 'Esquerda';
    ficha: Ficha;
    onUpdate: <K extends keyof Ficha>(key: K, value: Ficha[K]) => void;
    isGmMode: boolean;
}> = ({ hand, ficha, onUpdate, isGmMode }) => {
    const handKey = hand === 'Direita' ? 'Direita' : 'Esquerda';
    const nameKey = `arma${handKey}Nome` as keyof Ficha;
    const ataqueKey = `arma${handKey}Ataque` as keyof Ficha;
    const ataqueMagicoKey = `arma${handKey}AtaqueMagico` as keyof Ficha;

    const handleNumberChange = (key: keyof Ficha, value: number) => {
        onUpdate(key, Math.max(0, value));
    };
    
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div className="space-y-2">
            <label className="block font-bold">{`Mão ${hand}`}</label>
            <input
                type="text"
                placeholder="Nome da Arma"
                value={ficha[nameKey] as string}
                onChange={(e) => onUpdate(nameKey, e.target.value)}
                className="w-full p-2 bg-stone-800 border border-stone-600 rounded-md"
                style={componentStyle}
            />
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-sm block text-center" style={{ color: 'var(--accent-color)' }}>Ataque</label>
                    {isGmMode ? (
                        <EditableStat
                            value={ficha[ataqueKey] as number}
                            isGmMode={isGmMode}
                            onUpdate={(val) => handleNumberChange(ataqueKey, val)}
                            inputClass="w-full p-2 bg-stone-800 border border-stone-600 rounded-md text-center"
                        />
                    ) : (
                        <div className="flex items-center justify-center gap-1 mt-1">
                            <button onClick={() => handleNumberChange(ataqueKey, (ficha[ataqueKey] as number) - 1)} className="btn-interactive w-7 h-7 rounded-md bg-stone-700 hover:bg-stone-600 text-white">-</button>
                            <span className="w-10 text-center font-bold text-lg">{ficha[ataqueKey] as number}</span>
                            <button onClick={() => handleNumberChange(ataqueKey, (ficha[ataqueKey] as number) + 1)} className="btn-interactive w-7 h-7 rounded-md bg-stone-700 hover:bg-stone-600 text-white">+</button>
                        </div>
                    )}
                </div>
                <div>
                    <label className="text-sm block text-center" style={{ color: 'var(--accent-color)' }}>Ataque Mágico</label>
                     {isGmMode ? (
                        <EditableStat
                            value={ficha[ataqueMagicoKey] as number}
                            isGmMode={isGmMode}
                            onUpdate={(val) => handleNumberChange(ataqueMagicoKey, val)}
                            inputClass="w-full p-2 bg-stone-800 border border-stone-600 rounded-md text-center"
                        />
                    ) : (
                         <div className="flex items-center justify-center gap-1 mt-1">
                            <button onClick={() => handleNumberChange(ataqueMagicoKey, (ficha[ataqueMagicoKey] as number) - 1)} className="btn-interactive w-7 h-7 rounded-md bg-stone-700 hover:bg-stone-600 text-white">-</button>
                            <span className="w-10 text-center font-bold text-lg">{ficha[ataqueMagicoKey] as number}</span>
                            <button onClick={() => handleNumberChange(ataqueMagicoKey, (ficha[ataqueMagicoKey] as number) + 1)} className="btn-interactive w-7 h-7 rounded-md bg-stone-700 hover:bg-stone-600 text-white">+</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Combat: React.FC<CombatProps> = ({ ficha, onUpdate, isGmMode }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WeaponInput hand="Direita" ficha={ficha} onUpdate={onUpdate} isGmMode={isGmMode} />
            <WeaponInput hand="Esquerda" ficha={ficha} onUpdate={onUpdate} isGmMode={isGmMode} />
        </div>
    );
};

export default Combat;
