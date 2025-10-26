
import React from 'react';
import { DiceRoll } from '../types';
import Modal from './Modal';

interface HistoryModalProps {
    history: DiceRoll[];
    onRequestClear: () => void;
    onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, onRequestClear, onClose }) => {
    return (
        <Modal title="Histórico de Rolagens" onClose={onClose}>
            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2 mb-4">
                {history.length > 0 ? (
                    history.map(roll => (
                        <div key={roll.id} className="bg-stone-800 p-2 rounded-md text-sm">
                            <p className="font-bold text-white">Total: {roll.total}</p>
                            <p className="text-stone-400">
                                Rolagem ({roll.type}): {roll.result}
                                {roll.attribute && ` + ${roll.bonus} (${roll.attribute})`}
                            </p>
                            <p className="text-xs text-stone-500 text-right">{roll.timestamp}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-stone-400">Nenhuma rolagem registrada.</p>
                )}
            </div>
            <div className="flex gap-2 mt-4">
                    <button
                    onClick={onRequestClear}
                    className="flex-1 py-2 px-4 bg-red-800 hover:bg-red-700 rounded-md transition"
                >
                    Limpar
                </button>
                <button
                    onClick={onClose}
                    className="flex-1 py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md transition"
                >
                    Fechar
                </button>
            </div>
        </Modal>
    );
};

export default HistoryModal;
