
import React from 'react';
import Modal from './Modal.tsx';

interface NotesModalProps {
    notes: string;
    onUpdate: (notes: string) => void;
    onClose: () => void;
}

const NotesModal: React.FC<NotesModalProps> = ({ notes, onUpdate, onClose }) => {
    return (
        <Modal title="Anotações" onClose={onClose}>
             <textarea
                value={notes}
                onChange={(e) => onUpdate(e.target.value)}
                className="w-full h-64 p-2 bg-stone-700 border border-stone-600 rounded-md resize-none text-stone-100 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Suas anotações aqui..."
            />
            <div className="flex justify-end mt-4">
                 <button
                    onClick={onClose}
                    className="py-2 px-6 bg-amber-800 hover:bg-amber-700 rounded-md transition"
                >
                    Fechar
                </button>
            </div>
        </Modal>
    );
};

export default NotesModal;
