
import React, { useState } from 'react';
import { Ficha } from '../types.ts';
import { racasData, vantagensData, desvantagensData } from '../constants.ts';

interface RacasPanelProps {
    ficha: Ficha;
    pontosVantagemDisponiveis: number;
    onUpdate: <K extends keyof Ficha>(key: K, value: Ficha[K]) => void;
    onClose: () => void;
}

const RacasPanel: React.FC<RacasPanelProps> = ({ ficha, pontosVantagemDisponiveis, onUpdate, onClose }) => {
    const [tempRaca, setTempRaca] = useState<string | null>(ficha.racaSelecionada);

    const calcularPHRestante = (selectedRaca: string | null) => {
        let ph = ficha.pontosVantagemTotais;

        ficha.vantagens.forEach(v => ph -= (vantagensData.find(vd => vd.nome === v)?.custo || 0));
        ficha.desvantagens.forEach(d => ph += (desvantagensData.find(dd => dd.nome === d)?.ganho || 0));
        
        // Remove cost of old race if there was one
        if(ficha.racaSelecionada){
             ph += racasData.find(r => r.nome === ficha.racaSelecionada)?.custo || 0;
        }
        
        // Add cost of new temp race
        if(selectedRaca) {
            ph -= racasData.find(r => r.nome === selectedRaca)?.custo || 0;
        }

        return ph;
    };
    
    const phRestante = calcularPHRestante(tempRaca);

    const handleSelectRaca = (nome: string, custo: number) => {
        const isAlreadySaved = ficha.racaSelecionada === nome;
        if (isAlreadySaved) {
            // Cannot deselect a saved race.
            return;
        }

        if (tempRaca === nome) {
            // Allow deselecting a temporary choice if it's not the saved one.
            setTempRaca(null);
        } else if (calcularPHRestante(nome) >= 0) {
            setTempRaca(nome);
        } else {
            alert("Pontos de Vantagem insuficientes para selecionar esta raça!");
        }
    };
    
    const handleSave = () => {
        onUpdate('racaSelecionada', tempRaca);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-40 flex flex-col p-4">
            <div className="bg-stone-900 rounded-lg p-4 flex-grow flex flex-col border border-stone-700 relative">
                 <button onClick={onClose} className="absolute top-2 right-2 text-2xl text-stone-400 hover:text-white z-10">&times;</button>
                <h2 className="text-3xl font-medieval text-amber-400 text-center">Raças</h2>
                <p className="text-center mb-4">Pontos Restantes Após Seleção: <span className={`font-bold text-lg ${phRestante < 0 ? 'text-red-500' : 'text-green-400'}`}>{phRestante}</span></p>

                <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                    {racasData.map(raca => {
                        const isSelected = tempRaca === raca.nome;
                        const isSaved = ficha.racaSelecionada === raca.nome;
                        
                        return (
                         <div key={raca.nome} onClick={() => handleSelectRaca(raca.nome, raca.custo)} className={`p-3 rounded transition-colors border-2 ${isSaved ? 'border-amber-700 bg-amber-900/70 cursor-not-allowed' : (isSelected ? 'border-amber-500 bg-amber-900/50 cursor-pointer' : 'border-transparent bg-stone-800 hover:bg-stone-700 cursor-pointer')}`}>
                            <h3 className="font-medieval text-lg text-amber-300">{raca.nome} ({raca.custo} PH)</h3>
                            <p className="text-sm text-stone-300 mb-2">{raca.descricao}</p>
                            <ul className="list-disc list-inside text-xs text-stone-400 space-y-1">
                                {raca.vantagens.map(v => <li key={v}>{v}</li>)}
                            </ul>
                        </div>
                    )})}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-stone-700">
                    <button onClick={onClose} className="flex-1 py-2 px-4 bg-stone-700 hover:bg-stone-600 rounded-md transition">Cancelar</button>
                    <button onClick={handleSave} className="flex-1 py-2 px-4 bg-amber-700 hover:bg-amber-600 rounded-md transition">Salvar</button>
                </div>
            </div>
        </div>
    );
};

export default RacasPanel;
