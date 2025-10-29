import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Ficha, EditableAttributes } from '../types';
import { calcularAtributos } from '../utils/calculations';
import Tooltip from './Tooltip';
import EditableStat from './EditableStat';

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

const primaryAttributeTooltips: Record<keyof EditableAttributes, string> = {
    forca: "Olá, aventureiro! Como vai a Força? Falando nela, cada ponto que você distribui aqui aumenta seu Ataque em +1. Além disso, a cada 5 pontos, sua Redução de Dano Físico (RDF) e sua Capacidade de Carga melhoram. E não para por aí: a cada 10 pontos, seus pulos ficam mais altos e sua Vida Total recebe um bônus! Poder puro!",
    destreza: "Saudações, andarilho de mãos rápidas! Sua precisão é lendária. A cada 3 pontos em Destreza, seu Acerto aumenta em +1, garantindo que seus golpes atinjam o alvo. A cada 5 pontos, você também ganha +1 de Ataque, um toque de fineza em sua ofensiva.",
    agilidade: "Veloz como o vento, não é mesmo? Sua Agilidade é a chave para a sobrevivência. A cada 3 pontos, sua Esquiva aumenta em +1, tornando-o um alvo difícil. Ela também impulsiona sua Velocidade de Corrida e a Distância dos seus Pulos. Um bônus a cada 10 pontos ainda melhora seu Acerto!",
    constituicao: "Firme como uma montanha! Sua Constituição é o pilar da sua resistência. Cada ponto investido aqui aumenta drasticamente sua Vida, Magia e Vigor totais, além de acelerar a Regeneração de todos eles. Um verdadeiro herói precisa de fôlego para grandes batalhas!",
    inteligencia: "Olá, mente brilhante! O conhecimento é sua maior arma. Cada ponto em Inteligência aumenta seu Ataque Mágico em +1. A cada 5 pontos, sua Redução de Dano Mágico (RDM) melhora. Se for sábio o suficiente (10+ de INT), sua Magia Total será ampliada pela sua Constituição. Use seu poder com sabedoria!"
};

const derivedAttributeTooltips: Record<string, string> = {
    ataque: "Este é o seu poder de esmagar inimigos! Seu Ataque é a soma da sua Força, um bônus da sua Destreza (a cada 5 pontos) e o poder da sua arma. Quanto maior, mais dano você causa!",
    ataqueMagico: "O poder arcano flui através de você! Seu Ataque Mágico é a soma da sua Inteligência e o poder de sua arma mágica. Canalize essa energia para conjurar feitiços devastadores.",
    acerto: "De que adianta a força sem precisão? Seu Acerto determina a chance de atingir o alvo. Ele vem da sua Destreza (a cada 3 pontos) com um toque de Agilidade (a cada 10 pontos). Mire bem!",
    esquiva: "Ser intocável é uma grande vantagem. Sua Esquiva é sua capacidade de desviar de golpes, vinda diretamente da sua Agilidade (a cada 3 pontos). Dance pelo campo de batalha!",
    rdf: "Resistência é fundamental. Sua Redução de Dano Físico (RDF) diminui o dano de golpes, socos e flechas. Ela é forjada a partir da sua Força (a cada 5 pontos).",
    rdm: "Sua mente é um escudo. Sua Redução de Dano Mágico (RDM) protege você de feitiços e maldições. Ela é fortalecida pela sua Inteligência (a cada 5 pontos)."
};

const DiceIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 3H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zM7.5 16.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
    </svg>
);

const QuestionMarkIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`inline-block w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);


const Attributes: React.FC<AttributesProps> = ({ ficha, onBulkUpdate, selectedAttribute, setSelectedAttribute, isGmMode, onGmUpdate }) => {
    const [tempAttrs, setTempAttrs] = useState<Partial<EditableAttributes> | null>(null);
    const [changedStats, setChangedStats] = useState<Record<string, boolean>>({});
    const prevDisplayFichaRef = useRef<Ficha>(ficha);

    useEffect(() => {
        setTempAttrs(null);
    }, [ficha.id]);

    const displayFicha = useMemo(() => {
        const baseFicha = tempAttrs ? { ...ficha, ...tempAttrs } : ficha;
        return calcularAtributos(baseFicha);
    }, [ficha, tempAttrs]);
    
    useEffect(() => {
        const changes: Record<string, boolean> = {};
        const derivedKeys: (keyof Ficha)[] = ['ataque', 'ataqueMagico', 'acerto', 'esquiva', 'rdf', 'rdm'];
        
        derivedKeys.forEach(key => {
            if (displayFicha[key] !== prevDisplayFichaRef.current[key]) {
                changes[key] = true;
            }
        });
        
        if (Object.keys(changes).length > 0) {
            setChangedStats(changes);
            const timer = setTimeout(() => {
                setChangedStats({});
            }, 800);
            return () => clearTimeout(timer);
        }
        
        prevDisplayFichaRef.current = displayFicha;
    }, [displayFicha]);


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
    
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 bg-stone-800 p-3 rounded-lg" style={componentStyle}>
                <div className="text-center mb-2">
                    <h3 className="font-medieval text-lg">Atributos Primários</h3>
                    <p className="text-sm">Pontos Disponíveis: <span className={`font-bold text-xl ${pontosDisponiveis < 0 ? 'text-red-500' : 'text-green-400'}`}>{pontosDisponiveis}</span></p>
                </div>
                <div className="divide-y divide-stone-700">
                    {primaryAttributes.map(attr => (
                         <div key={attr} className="flex justify-between items-center py-2">
                            <div className="flex items-center gap-1.5">
                                <label className="font-bold">{attributeLabels[attr]}</label>
                                <Tooltip text={primaryAttributeTooltips[attr]}>
                                    <span className="cursor-help text-xs opacity-70" aria-label={`Explicação para ${attributeLabels[attr]}`}><QuestionMarkIcon /></span>
                                </Tooltip>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isGmMode ? (
                                    <>
                                        <button onClick={() => handleAttrChange(attr, -1)} disabled={displayFicha[attr] <= ficha.lockedAtributos[attr]} className="btn-interactive w-8 h-8 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed text-white">-</button>
                                        <span className="w-10 text-center font-bold text-lg">{displayFicha[attr]}</span>
                                        <button onClick={() => handleAttrChange(attr, 1)} disabled={pontosDisponiveis <= 0} className="btn-interactive w-8 h-8 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed text-white">+</button>
                                    </>
                                ) : (
                                    <EditableStat
                                        value={displayFicha[attr]}
                                        isGmMode={isGmMode}
                                        onUpdate={(val) => onBulkUpdate({ [attr]: val })}
                                        displayClass="font-bold text-lg"
                                        inputClass="w-20 text-center bg-stone-800 border border-stone-600 rounded-md"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {tempAttrs && (
                    <div className="flex gap-2 pt-4">
                        <button onClick={handleCancel} className="btn-interactive flex-1 py-2 bg-stone-600 hover:bg-stone-500 rounded-md text-white">Cancelar</button>
                        <button onClick={handleSave} className="btn-interactive flex-1 py-2 bg-green-700 hover:bg-green-600 rounded-md text-white">Salvar</button>
                    </div>
                )}
            </div>
            <div className="space-y-2">
                 {Object.entries(derivedAttributeLabels).map(([key, label]) => {
                     const attrKey = key as keyof Ficha;
                     const isSelected = selectedAttribute === attrKey;
                     return (
                         <div key={key} className="flex justify-between items-center py-2 px-3 bg-stone-900/50 rounded-md" style={componentStyle}>
                            <div className="flex items-center gap-1.5">
                                <label className="font-bold" style={{ color: 'var(--accent-color)' }}>{label}</label>
                                <Tooltip text={derivedAttributeTooltips[key]}>
                                    <span className="cursor-help text-xs opacity-70" aria-label={`Explicação para ${label}`}><QuestionMarkIcon /></span>
                                </Tooltip>
                            </div>
                            <div className="flex items-center gap-2">
                                <EditableStat 
                                    value={displayFicha[attrKey] as number}
                                    isGmMode={isGmMode}
                                    onUpdate={(val) => handleGmUpdateDerived(attrKey, val)}
                                    displayClass={`font-bold text-lg ${changedStats[key] ? 'attribute-flash-animation' : ''}`}
                                    inputClass="w-20 text-center bg-stone-800 border border-stone-600 rounded-md"
                                />
                                <button
                                    onClick={() => setSelectedAttribute(isSelected ? null : key)}
                                    className={`transition-all ${isSelected ? 'scale-125' : 'opacity-50 hover:opacity-100'}`}
                                    style={{ color: isSelected ? 'var(--accent-color)' : 'var(--text-color)'}}
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
