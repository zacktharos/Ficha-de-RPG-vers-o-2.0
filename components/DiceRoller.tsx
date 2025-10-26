
import React, { useState } from 'react';
import { DiceRoll, Ficha } from '../types.ts';

interface DiceRollerProps {
    onRoll: (max: number) => DiceRoll;
    selectedAttribute: string | null;
    setSelectedAttribute: (attr: string | null) => void;
    ficha: Ficha;
}

const DiceIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 3H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zM7.5 16.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
    </svg>
);

const attributeGroups = {
    'Primários': ['forca', 'destreza', 'agilidade', 'constituicao', 'inteligencia'],
    'Combate': ['ataque', 'ataqueMagico', 'acerto', 'esquiva', 'rdf', 'rdm'],
    'Locomoção': ['velocidadeCorrida', 'alturaPulo', 'distanciaPulo'],
};

const attributeLabels: Record<string, string> = {
    forca: 'Força', destreza: 'Destreza', agilidade: 'Agilidade', constituicao: 'Constituição', inteligencia: 'Inteligência',
    ataque: "Ataque", ataqueMagico: "Ataque Mágico", acerto: "Acerto", esquiva: "Esquiva", rdf: "RDF", rdm: "RDM",
    velocidadeCorrida: 'Velocidade', alturaPulo: 'Pulo (Altura)', distanciaPulo: 'Pulo (Dist.)'
};


const DiceRoller: React.FC<DiceRollerProps> = ({ onRoll, selectedAttribute, setSelectedAttribute, ficha }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isRolling, setIsRolling] = useState(false);
    const [diceMax, setDiceMax] = useState(20);
    const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);
    const [animationClass, setAnimationClass] = useState('');

    const handleRoll = () => {
        if (isRolling) return;
        setIsRolling(true);
        setLastRoll(null);

        let animClass = 'animate-roll-default';
        let animDuration = 1000;
        if (ficha.diceAnimation === 'rapido') {
            animClass = 'animate-roll-fast';
            animDuration = 500;
        } else if (ficha.diceAnimation === 'salto') {
            animClass = 'animate-roll-jump';
            animDuration = 1200;
        }
        setAnimationClass(animClass);

        setTimeout(() => {
            const result = onRoll(diceMax);
            setLastRoll(result);
            setIsRolling(false);
            setAnimationClass('');
        }, animDuration);
    };

    const getAttributeValue = () => {
        if (!selectedAttribute || !ficha) return 0;
        const attrValue = ficha[selectedAttribute as keyof Ficha];
        return typeof attrValue === 'number' ? attrValue : 0;
    }
    
    if (!isPanelOpen) {
        return (
            <button 
                onClick={() => setIsPanelOpen(true)}
                className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-14 h-14 bg-stone-800 border-2 border-amber-500 rounded-full shadow-lg flex items-center justify-center text-amber-400 hover:bg-stone-700 transition-all"
                title="Rolar Dados"
            >
                <DiceIcon className="w-8 h-8" />
            </button>
        );
    }
    
    const diceStyle: React.CSSProperties = {
        backgroundColor: ficha.diceColor || '#a0522d',
        color: ficha.diceNumberColor || '#ffffff',
        backgroundImage: ficha.diceTexture ? `url(${ficha.diceTexture})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-stone-900/90 backdrop-blur-md p-3 rounded-lg shadow-2xl border border-stone-700 text-white w-64 flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <h3 className="font-medieval text-amber-400">Rolagem</h3>
                <button onClick={() => setIsPanelOpen(false)} className="text-2xl text-stone-400 hover:text-white">&times;</button>
            </div>
            
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 border-y border-stone-700 py-2">
                {Object.entries(attributeGroups).map(([groupName, attrs]) => (
                    <div key={groupName}>
                        <h4 className="text-xs font-bold text-amber-500 mb-1">{groupName}</h4>
                        {attrs.map(attr => {
                            const isSelected = selectedAttribute === attr;
                            return (
                                <div key={attr} onClick={() => setSelectedAttribute(isSelected ? null : attr)} className={`flex justify-between items-center text-sm p-1 rounded cursor-pointer ${isSelected ? 'bg-amber-800/50' : 'hover:bg-stone-800'}`}>
                                    <span>{attributeLabels[attr]}</span>
                                    {/* FIX: Cast to number to satisfy ReactNode type requirement. */}
                                    <span className="font-bold">{ficha[attr as keyof Ficha] as number}</span>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

            <div className="flex gap-1 justify-center">
                {[4, 6, 12, 20].map(d => (
                    <button 
                        key={d}
                        onClick={() => setDiceMax(d)}
                        className={`w-10 h-10 text-sm rounded ${diceMax === d ? 'bg-amber-600' : 'bg-stone-700 hover:bg-stone-600'}`}
                    >
                        D{d}
                    </button>
                ))}
            </div>

            <button 
                onClick={handleRoll} 
                className={`w-20 h-20 self-center rounded-full flex items-center justify-center text-2xl font-bold font-medieval shadow-inner shadow-black/50 hover:bg-amber-600 transition-colors disabled:opacity-50 ${animationClass}`} 
                style={diceStyle}
                disabled={isRolling}
            >
                {isRolling ? '...' : (lastRoll ? lastRoll.total : 'Roll')}
            </button>
            
            {selectedAttribute && (
                 <div className="text-xs text-center -mt-2">
                    Com <span className="capitalize text-amber-300">{attributeLabels[selectedAttribute] || selectedAttribute}</span> (+{getAttributeValue()})
                </div>
            )}
            
            {lastRoll && !isRolling && (
                <div className="text-xs text-center text-stone-300">
                    <p>D{diceMax}: {lastRoll.result}
                    {lastRoll.bonus > 0 && ` + ${lastRoll.bonus}`}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DiceRoller;
