
import React, { useState } from 'react';
import { Ficha } from '../types.ts';
import { vantagensData, desvantagensData } from '../constants.ts';

interface VantagensDesvantagensPanelProps {
    ficha: Ficha;
    pontosVantagemDisponiveis: number;
    onBulkUpdate: (updates: Partial<Ficha>) => void;
    onClose: () => void;
}

const VantagensDesvantagensPanel: React.FC<VantagensDesvantagensPanelProps> = ({ ficha, pontosVantagemDisponiveis, onBulkUpdate, onClose }) => {
    const [tempVantagens, setTempVantagens] = useState([...ficha.vantagens]);
    const [tempDesvantagens, setTempDesvantagens] = useState([...ficha.desvantagens]);

    const calcularPHRestante = () => {
        let ph = pontosVantagemDisponiveis;
        
        // Add back points from original selections to get a temporary available total
        ficha.vantagens.forEach(v => ph += (vantagensData.find(vd => vd.nome === v)?.custo || 0));
        ficha.desvantagens.forEach(d => ph -= (desvantagensData.find(dd => dd.nome === d)?.ganho || 0));

        // Subtract points from temp selections
        tempVantagens.forEach(v => ph -= (vantagensData.find(vd => vd.nome === v)?.custo || 0));
        tempDesvantagens.forEach(d => ph += (desvantagensData.find(dd => dd.nome === d)?.ganho || 0));

        return ph;
    };
    
    const phRestante = calcularPHRestante();

    const toggleVantagem = (nome: string, custo: number) => {
        const isAlreadySaved = ficha.vantagens.includes(nome);
        if (isAlreadySaved) {
            // Cannot deselect a saved advantage from this panel
            return;
        }

        const vantagem = vantagensData.find(v => v.nome === nome);
        
        if (vantagem?.restricao === 'inicio' && ficha.nivel > 0 && !tempVantagens.includes(nome)) {
            alert("Esta vantagem só pode ser comprada no nível 0.");
            return;
        }

        if (tempVantagens.includes(nome)) {
            setTempVantagens(tempVantagens.filter(v => v !== nome));
        } else if (phRestante >= custo) {
            setTempVantagens([...tempVantagens, nome]);
        } else {
            alert("Pontos de Vantagem insuficientes!");
        }
    };
    
    const toggleDesvantagem = (nome: string) => {
         const isAlreadySaved = ficha.desvantagens.includes(nome);
        if (isAlreadySaved) {
            // Cannot deselect a saved disadvantage from this panel
            return;
        }

        if (tempDesvantagens.includes(nome)) {
            setTempDesvantagens(tempDesvantagens.filter(d => d !== nome));
        } else {
             if (ficha.nivel > 0) {
                alert("Desvantagens só podem ser adquiridas no nível 0.");
                return;
            }
            if(tempDesvantagens.length >= 3) {
                alert("Você pode ter no máximo 3 desvantagens!");
                return;
            }
            setTempDesvantagens([...tempDesvantagens, nome]);
        }
    };
    
    const handleSave = () => {
        onBulkUpdate({
            vantagens: tempVantagens,
            desvantagens: tempDesvantagens,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-40 flex flex-col p-4">
            <div className="bg-stone-900 rounded-lg p-4 flex-grow flex flex-col border border-stone-700">
                <h2 className="text-3xl font-medieval text-amber-400 text-center">Vantagens e Desvantagens</h2>
                <p className="text-center mb-4">Pontos Restantes: <span className="font-bold text-lg text-green-400">{phRestante}</span></p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-y-auto">
                    <div className="space-y-2">
                        <h3 className="text-xl font-medieval text-amber-500">Vantagens</h3>
                        <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
                            {vantagensData.map(v => {
                                const isSelected = tempVantagens.includes(v.nome);
                                const isSaved = ficha.vantagens.includes(v.nome);
                                return (
                                <div key={v.nome} onClick={() => toggleVantagem(v.nome, v.custo)} 
                                className={`p-2 rounded transition-colors text-sm ${isSaved ? 'bg-amber-900/70 cursor-not-allowed' : (isSelected ? 'bg-green-800/50 cursor-pointer' : 'bg-stone-800 hover:bg-stone-700 cursor-pointer')}`}>
                                    <strong>{v.nome}</strong> ({v.custo} PH) <p className="text-xs text-stone-400">{v.descricao}</p>
                                </div>
                            )})}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <h3 className="text-xl font-medieval text-red-500">Desvantagens</h3>
                        <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
                            {desvantagensData.map(d => {
                                const isSelected = tempDesvantagens.includes(d.nome);
                                const isSaved = ficha.desvantagens.includes(d.nome);
                                return (
                                <div key={d.nome} onClick={() => toggleDesvantagem(d.nome)} className={`p-2 rounded transition-colors text-sm ${isSaved ? 'bg-amber-900/70 cursor-not-allowed' : (isSelected ? 'bg-red-800/50 cursor-pointer' : 'bg-stone-800 hover:bg-stone-700 cursor-pointer')}`}>
                                    <strong>{d.nome}</strong> (+{d.ganho} PH) <p className="text-xs text-stone-400">{d.descricao}</p>
                                </div>
                            )})}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-stone-700">
                    <button onClick={onClose} className="flex-1 py-2 px-4 bg-stone-700 hover:bg-stone-600 rounded-md transition">Cancelar</button>
                    <button onClick={handleSave} className="flex-1 py-2 px-4 bg-amber-700 hover:bg-amber-600 rounded-md transition">Salvar</button>
                </div>
            </div>
        </div>
    );
};

export default VantagensDesvantagensPanel;
