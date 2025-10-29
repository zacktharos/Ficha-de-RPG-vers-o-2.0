import React, { useState, useEffect } from 'react';
import { Ficha } from '../types';
import { classesData, racasData, vantagensData, desvantagensData } from '../constants';

interface ClassesPanelProps {
    ficha: Ficha;
    pontosVantagemDisponiveis: number;
    onUpdate: <K extends keyof Ficha>(key: K, value: Ficha[K]) => void;
    onClose: () => void;
}

const ClassesPanel: React.FC<ClassesPanelProps> = ({ ficha, pontosVantagemDisponiveis, onUpdate, onClose }) => {
    const [tempClasse, setTempClasse] = useState<string | null>(ficha.classeSelecionada);
    const [showSavedMessage, setShowSavedMessage] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    useEffect(() => {
        setTempClasse(ficha.classeSelecionada);
    }, [ficha.classeSelecionada]);

    const calcularPHRestante = (selectedClasse: string | null) => {
        let ph = ficha.pontosVantagemTotais;

        ficha.vantagens.forEach(v => ph -= (vantagensData.find(vd => vd.nome === v)?.custo || 0));
        ficha.desvantagens.forEach(d => ph += (desvantagensData.find(dd => dd.nome === d)?.ganho || 0));
        if (ficha.racaSelecionada) {
            ph -= racasData.find(r => r.nome === ficha.racaSelecionada)?.custo || 0;
        }
        
        if (ficha.classeSelecionada) {
             ph += classesData.find(c => c.nome === ficha.classeSelecionada)?.custo || 0;
        }
        
        if (selectedClasse) {
            ph -= classesData.find(c => c.nome === selectedClasse)?.custo || 0;
        }

        return ph;
    };
    
    const phRestante = calcularPHRestante(tempClasse);

    const handleSelectClasse = (nome: string) => {
        if (ficha.classeSelecionada) {
            alert("Uma classe já foi selecionada. Para alterar, use a opção 'Excluir...' na ficha.");
            return;
        }

        if (tempClasse === nome) {
            setTempClasse(null);
        } else if (calcularPHRestante(nome) >= 0) {
            setTempClasse(nome);
        } else {
            alert("Pontos de Vantagem insuficientes para selecionar esta classe!");
        }
    };
    
    const handleSave = () => {
        onUpdate('classeSelecionada', tempClasse);
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000);
    };
    
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };
    const isClasseLocked = !!ficha.classeSelecionada;

    return (
        <div className={`fixed inset-0 bg-black/80 z-40 flex flex-col p-4 ${isClosing ? 'modal-exit' : 'modal-enter'}`}>
            <div className="bg-stone-900 rounded-lg p-4 flex-grow flex flex-col border border-stone-700 relative min-h-0">
                <button onClick={handleClose} className="absolute top-4 right-4 text-3xl font-bold text-yellow-500 hover:text-yellow-400 z-10">&times;</button>
                <div className="text-center mb-4">
                    <h2 className="text-3xl font-medieval">Classes</h2>
                    <p>Pontos Restantes Após Seleção: <span className={`font-bold text-lg ${phRestante < 0 ? 'text-red-500' : 'text-green-400'}`}>{phRestante}</span></p>
                    <div className="mt-2 flex justify-center items-center gap-4">
                         <button 
                            onClick={handleSave} 
                            className="btn-interactive py-2 px-6 bg-amber-700 hover:bg-amber-600 rounded-md text-white disabled:bg-stone-600 disabled:cursor-not-allowed" 
                            disabled={isClasseLocked || tempClasse === ficha.classeSelecionada}
                         >
                            Salvar
                        </button>
                        {showSavedMessage && <span className="text-green-400 text-sm">Salvo!</span>}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto space-y-3 pr-2 min-h-0">
                    {classesData.map(classe => {
                        const isSelected = tempClasse === classe.nome;
                        const isSavedAndLocked = isClasseLocked && ficha.classeSelecionada === classe.nome;
                        const isDisabled = isClasseLocked && !isSavedAndLocked;

                        let containerClasses = 'p-3 rounded transition-all border-2 ';
                        if (isSavedAndLocked) {
                            containerClasses += 'border-amber-700 bg-amber-900/70 cursor-default';
                        } else if (isDisabled) {
                            containerClasses += 'border-transparent bg-stone-800 opacity-50 cursor-not-allowed';
                        } else if (isSelected) {
                            containerClasses += 'border-amber-500 bg-amber-900/50 cursor-pointer';
                        } else {
                            containerClasses += 'border-transparent bg-stone-800 hover:bg-stone-700 cursor-pointer';
                        }
                        
                        return (
                         <div 
                            key={classe.nome} 
                            onClick={() => handleSelectClasse(classe.nome)} 
                            className={containerClasses}
                            style={isSavedAndLocked || isSelected ? {} : componentStyle}
                         >
                            <h3 className="font-medieval text-lg" style={{ color: 'var(--accent-color)' }}>{classe.nome} ({classe.custo} PV)</h3>
                            <p className="text-sm mb-2">{classe.descricao}</p>
                        </div>
                    )})}
                </div>
            </div>
        </div>
    );
};

export default ClassesPanel;
