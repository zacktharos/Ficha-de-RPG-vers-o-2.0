import React from 'react';
import { DiceRoll } from '../types';
import Modal from './Modal';

interface HistoryModalProps {
    history: DiceRoll[];
    onRequestClear: () => void;
    onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, onRequestClear, onClose }) => {
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };
    return (
        <Modal title="Histórico de Rolagens" onClose={onClose}>
            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2 mb-4">
                {history.length > 0 ? (
                    history.map(roll => (
                        <div key={roll.id} className="bg-stone-800 p-2 rounded-md text-sm" style={componentStyle}>
                            <p className="font-bold">Total: {roll.total}</p>
                            <p className="opacity-80">
                                Rolagem ({roll.type}): {roll.result}
                                {roll.attribute && ` + ${roll.bonus} (${roll.attribute})`}
                            </p>
                            <p className="text-xs opacity-60 text-right">{roll.timestamp}</p>
                        </div>
                    ))
                ) : (
                    <p className="opacity-70">Nenhuma rolagem registrada.</p>
                )}
            </div>
            <div className="flex gap-2 mt-4">
                    <button
                    onClick={onRequestClear}
                    className="btn-interactive flex-1 py-2 px-4 bg-red-800 hover:bg-red-700 rounded-md text-white"
                >
                    Limpar
                </button>
                <button
                    onClick={onClose}
                    className="btn-interactive flex-1 py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md text-white"
                >
                    Fechar
                </button>
            </div>
        </Modal>
    );
};

export default HistoryModal;
