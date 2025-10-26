
import React from 'react';
import { Ficha } from '../types';
import { FICHA_MATRIZ_ID } from '../constants';

interface HeaderProps {
    fichas: Record<string, Ficha>;
    currentFichaId: string;
    switchFicha: (id: string) => void;
    nomePersonagem: string;
    handleUpdate: (key: 'nomePersonagem', value: string) => void;
    onNewFicha: () => void;
    isGmMode: boolean;
    onToggleGmMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ fichas, currentFichaId, switchFicha, nomePersonagem, handleUpdate, onNewFicha, isGmMode, onToggleGmMode }) => {
    return (
        <header className="bg-stone-900 p-4 border-b border-stone-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                 <input
                    type="text"
                    id="nome-personagem"
                    placeholder="Nome do Personagem"
                    value={nomePersonagem}
                    onChange={(e) => handleUpdate('nomePersonagem', e.target.value)}
                    className="w-full sm:w-auto text-2xl sm:text-3xl font-medieval bg-transparent text-center sm:text-left text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-md px-2 py-1"
                />
                <div className="flex items-center gap-2">
                     <select
                        value={currentFichaId}
                        onChange={(e) => switchFicha(e.target.value)}
                        className="bg-stone-800 border border-stone-600 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                        {/* FIX: The sort function was incorrect, causing type inference errors. It now correctly compares two elements. */}
                        {Object.values(fichas).sort((a, b) => {
                            if (a.id === FICHA_MATRIZ_ID) return -1;
                            if (b.id === FICHA_MATRIZ_ID) return 1;
                            return a.nomeFicha.localeCompare(b.nomeFicha);
                        }).map(f => (
                            <option key={f.id} value={f.id}>{f.nomeFicha}</option>
                        ))}
                    </select>
                     <button
                        onClick={onNewFicha}
                        className="bg-amber-700 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                        title="Criar Nova Ficha"
                    >
                        +
                    </button>
                    <button
                        onClick={onToggleGmMode}
                        className={`font-bold py-2 px-4 rounded-md transition-colors text-2xl ${isGmMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-stone-700 hover:bg-stone-600'}`}
                        title={isGmMode ? "Desativar Modo Mestre" : "Ativar Modo Mestre"}
                    >
                        ⚙️
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;