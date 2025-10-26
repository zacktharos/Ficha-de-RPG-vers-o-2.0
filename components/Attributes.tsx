import React, { useState, useEffect, useMemo } from 'react';
import { Ficha } from '../types';
import { calcularAtributos } from '../utils/calculations';
import EditableStat from './EditableStat';

type EditableAttributes = Pick<Ficha, 'forca' | 'destreza' | 'agilidade' | 'constituicao' | 'inteligencia'>;

interface AttributesProps {
    ficha: Ficha;
    onBulkUpdate: (updates: Partial<Ficha>) => void;
    selectedAttribute: string | null;
    setSelectedAttribute: (attr: string | null) => void;
    isGmMode: boolean;
    onGmUpdate: (attr: keyof Ficha, adjustment: number) => void;
}

const attributeLabels: Record<keyof EditableAttributes, string> = {
    forca: 'Força',
    destreza: 'Destreza',
    agilidade: 'Agilidade',
    constituicao: 'Constituição',
    inteligencia: 'Inteligência',
};
const derivedAttributeLabels: Record<string, string> = {
    ataque: "Ataque",
    ataqueMagico: "Ataque Mágico",
    acerto: "Acerto",
    esquiva: "Esquiva",
    rdf: "RDF",
    rdm: "RDM"
};

const DiceIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 3H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zM7.5 16.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
    </svg>
);


const Attributes: React.FC<AttributesProps> = ({ ficha, onBulkUpdate, selectedAttribute, setSelectedAttribute, isGmMode, onGmUpdate }) => {
    const [tempAttrs, setTempAttrs] = useState<Partial<EditableAttributes> | null>(null);

    useEffect(() => {
        setTempAttrs(null);
    }, [ficha.id]);

    const displayFicha = useMemo(() => {
        const baseFicha = tempAttrs ? { ...ficha, ...tempAttrs } : ficha;
        return calcularAtributos(baseFicha);
    }, [ficha, tempAttrs]);

    const pontosDisponiveis = displayFicha.pontosHabilidadeDisponiveis;

    const handleAttrChange = (attrKey: keyof EditableAttributes, delta: number) => {
        const currentVal = displayFicha[attrKey];
        const lockedVal = ficha.lockedAtributos[attrKey];
        const newValue = currentVal + delta;

        if (delta < 0 && newValue < lockedVal) {
            console.warn(`Cannot decrease ${attrKey} below locked value of ${lockedVal}`);
            return;
        }
        if (delta > 0 && pontosDisponiveis <= 0) {
            alert("Sem Pontos de Habilidade disponíveis.");
            return;
        }

        setTempAttrs(prev => ({
            ...(prev || {
                forca: ficha.forca,
                destreza: ficha.destreza,
                agilidade: ficha.agilidade,
                constituicao: ficha.constituicao,
                inteligencia: ficha.inteligencia,
            }),
            [attrKey]: newValue
        }));
    };
    
    const handleSave = () => {
        if (!tempAttrs) return;

        const newLockedAtributos = { ...ficha.lockedAtributos };
        const payload: Partial<Ficha> = {};

        (Object.keys(tempAttrs) as Array<keyof EditableAttributes>).forEach(key => {
            const tempValue = tempAttrs[key];
            if (tempValue !== undefined) {
                payload[key] = tempValue;
                newLockedAtributos[key] = Math.max(newLockedAtributos[key], tempValue);
            }
        });

        payload.lockedAtributos = newLockedAtributos;
        onBulkUpdate(payload);
        setTempAttrs(null);
    };

    const handleCancel = () => {
        setTempAttrs(null);
    };

    const handleGmUpdateDerived = (attrKey: keyof Ficha, newValue: number) => {
        const baseFicha = { ...ficha, gmAdjustments: { ...ficha.gmAdjustments, [attrKey]: 0 } };
        const calculatedFicha = calcularAtributos(baseFicha);
        const baseValue = calculatedFicha[attrKey] as number;
        const adjustment = newValue - baseValue;
        onGmUpdate(attrKey, adjustment);
    };
    
    const primaryAttributes: (keyof EditableAttributes)[] = ['forca', 'destreza', 'agilidade', 'constituicao', 'inteligencia'];
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 bg-stone-800 p-3 rounded-lg">
                <div className="text-center mb-2">
                    <h3 className="font-medieval text-lg text-amber-400">Atributos Primários</h3>
                    <p className="text-sm">Pontos Disponíveis: <span className={`font-bold text-xl ${pontosDisponiveis < 0 ? 'text-red-500' : 'text-green-400'}`}>{pontosDisponiveis}</span></p>
                </div>
                <div className="divide-y divide-stone-700">
                    {primaryAttributes.map(attr => (
                         <div key={attr} className="flex justify-between items-center py-2">
                            <label className="font-bold text-stone-300">{attributeLabels[attr]}</label>
                            <div className="flex items-center gap-2">
                                {!isGmMode ? (
                                    <>
                                        <button onClick={() => handleAttrChange(attr, -1)} disabled={displayFicha[attr] <= ficha.lockedAtributos[attr]} className="w-8 h-8 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed">-</button>
                                        <span className="w-10 text-center font-bold text-lg text-white">{displayFicha[attr]}</span>
                                        <button onClick={() => handleAttrChange(attr, 1)} disabled={pontosDisponiveis <= 0} className="w-8 h-8 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                                    </>
                                ) : (
                                    <EditableStat
                                        value={displayFicha[attr]}
                                        isGmMode={isGmMode}
                                        onUpdate={(val) => onBulkUpdate({ [attr]: val })}
                                        displayClass="font-bold text-lg text-white"
                                        inputClass="w-20 text-center bg-stone-800 border border-stone-600 rounded-md"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {tempAttrs && (
                    <div className="flex gap-2 pt-4">
                        <button onClick={handleCancel} className="flex-1 py-2 bg-stone-600 hover:bg-stone-500 rounded-md">Cancelar</button>
                        <button onClick={handleSave} className="flex-1 py-2 bg-green-700 hover:bg-green-600 rounded-md">Salvar</button>
                    </div>
                )}
            </div>
            <div className="space-y-2">
                 {Object.entries(derivedAttributeLabels).map(([key, label]) => {
                     const attrKey = key as keyof Ficha;
                     const isSelected = selectedAttribute === attrKey;
                     return (
                         <div key={key} className="flex justify-between items-center py-2 px-3 bg-stone-900/50 rounded-md">
                            <label className="font-bold text-amber-400">{label}</label>
                            <div className="flex items-center gap-2">
                                <EditableStat 
                                    value={displayFicha[attrKey] as number}
                                    isGmMode={isGmMode}
                                    onUpdate={(val) => handleGmUpdateDerived(attrKey, val)}
                                    displayClass="font-bold text-lg text-white"
                                    inputClass="w-20 text-center bg-stone-800 border border-stone-600 rounded-md"
                                />
                                <button
                                    onClick={() => setSelectedAttribute(isSelected ? null : key)}
                                    className={`transition-all ${isSelected ? 'text-yellow-400 scale-125' : 'text-stone-500 hover:text-yellow-500'}`}
                                    title={`Rolar com ${label}`}
                                >
                                    <DiceIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                     )
                })}
            </div>
        </div>
    );
};

export default Attributes;
