
import React from 'react';

interface ActionsProps {
    onResetPontos: () => void;
    onRecomecar: () => void;
    onRequestDelete: () => void;
}

const Actions: React.FC<ActionsProps> = ({ onResetPontos, onRecomecar, onRequestDelete }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button onClick={onResetPontos} className="py-2 px-4 bg-yellow-800 hover:bg-yellow-700 rounded-md transition-colors">
                Reiniciar Pontos
            </button>
            <button onClick={onRecomecar} className="py-2 px-4 bg-orange-800 hover:bg-orange-700 rounded-md transition-colors">
                Recomeçar Ficha
            </button>
            <button onClick={onRequestDelete} className="py-2 px-4 bg-red-800 hover:bg-red-700 rounded-md transition-colors">
                Excluir Ficha
            </button>
        </div>
    );
};

export default Actions;
