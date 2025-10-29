import React, { useState } from 'react';
import { Ficha, DiceRoll } from '../types';

interface DiceRollerProps {
    onRoll: (max: number) => DiceRoll;
    selectedAttribute: string | null;
    setSelectedAttribute: (attr: string | null) => void;
    ficha: Ficha;
}

const diceRollerAttributeGroups = {
    'Primários': ['forca', 'destreza', 'agilidade', 'constituicao', 'inteligencia'],
    'Combate': ['ataque', 'ataqueMagico', 'acerto', 'esquiva', 'rdf', 'rdm'],
    'Locomoção': ['velocidadeCorrida', 'alturaPulo', 'distanciaPulo'],
};

const diceRollerAttributeLabels: Record<string, string> = {
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
    const [rollStatus, setRollStatus] = useState<'none' | 'crit' | 'fail'>('none');

    const handleRoll = () => {
        if (isRolling) return;
        setIsRolling(true);
        setLastRoll(null);
        setRollStatus('none');

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
            if (result.result === diceMax) {
                setRollStatus('crit');
            } else if (result.result === 1) {
                setRollStatus('fail');
            }
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
                className="btn-interactive fixed bottom-8 left-1/2 -translate-x-1/2 sm:bottom-4 z-30 w-16 h-16 bg-stone-800 border-2 rounded-full shadow-lg flex items-center justify-center hover:bg-stone-700"
                style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)', backgroundColor: ficha.darkMode ? '#2d2d2d' : '' }}
                title="Rolar Dados"
            >
                <span className="text-4xl">🎲</span>
            </button>
        );
    }
    
    const diceStyle: React.CSSProperties = {
        backgroundColor: ficha.darkMode ? '#444' : (ficha.diceColor || '#a0522d'),
        color: ficha.darkMode ? '#fff' : (ficha.diceNumberColor || '#ffffff'),
        backgroundImage: ficha.diceTexture ? `url(${ficha.diceTexture})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };
    
    const resultClasses = `dice-result-land ${
        rollStatus === 'crit' ? 'crit-success' : rollStatus === 'fail' ? 'crit-fail' : ''
    }`;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-stone-900/90 backdrop-blur-md p-3 rounded-lg shadow-2xl border border-stone-700 w-64 flex flex-col gap-3" style={{ backgroundColor: ficha.darkMode ? 'rgba(20,20,20,0.9)' : ''}}>
            <div className="flex justify-between items-center">
                <h3 className="font-medieval">Rolagem</h3>
                <button onClick={() => setIsPanelOpen(false)} className="text-2xl opacity-70 hover:opacity-100">&times;</button>
            </div>
            
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 border-y border-stone-700 py-2">
                {Object.entries(diceRollerAttributeGroups).map(([groupName, attrs]) => (
                    <div key={groupName}>
                        <h4 className="text-xs font-bold mb-1" style={{ color: 'var(--accent-color)' }}>{groupName}</h4>
                        {attrs.map(attr => {
                            const isSelected = selectedAttribute === attr;
                            return (
                                <div key={attr} onClick={() => setSelectedAttribute(isSelected ? null : attr)} className={`flex justify-between items-center text-sm p-1 rounded cursor-pointer ${isSelected ? 'bg-amber-800/50' : 'hover:bg-stone-800'}`}>
                                    <span>{diceRollerAttributeLabels[attr]}</span>
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
                        className={`btn-interactive w-10 h-10 text-sm rounded text-white ${diceMax === d ? 'bg-amber-600' : 'bg-stone-700 hover:bg-stone-600'}`}
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
                {isRolling ? '...' : (lastRoll ? <span className={resultClasses}>{lastRoll.total}</span> : 'Roll')}
            </button>
            
            {selectedAttribute && (
                 <div className="text-xs text-center -mt-2">
                    Com <span className="capitalize" style={{ color: 'var(--accent-color)' }}>{diceRollerAttributeLabels[selectedAttribute] || selectedAttribute}</span> (+{getAttributeValue()})
                </div>
            )}
            
            {lastRoll && !isRolling && (
                <div className="text-xs text-center opacity-80">
                    <p>D{diceMax}: {lastRoll.result}
                    {lastRoll.bonus > 0 && ` + ${lastRoll.bonus}`}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DiceRoller;
