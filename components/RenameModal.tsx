import React, { useState } from 'react';
import Modal from './Modal';
import { Ficha } from '../types';
import { FICHA_MATRIZ_ID } from '../constants';

interface RenameModalProps {
    fichas: Record<string, Ficha>;
    onRename: (id: string, newName: string) => void;
    onClose: () => void;
}

const RenameModal: React.FC<RenameModalProps> = ({ fichas, onRename, onClose }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    const handleStartEdit = (ficha: Ficha) => {
        setEditingId(ficha.id);
        setNewName(ficha.nomeFicha);
    };

    const handleSave = () => {
        if (editingId && newName.trim()) {
            onRename(editingId, newName.trim());
        }
        setEditingId(null);
        setNewName('');
    };

    const handleCancel = () => {
        setEditingId(null);
        setNewName('');
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSave();
        }
    };

    return (
        <Modal title="Renomear Fichas" onClose={onClose}>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {Object.values(fichas)
                    // Fix: Add explicit types for array methods to fix TypeScript errors.
                    .filter((f: Ficha) => f.id !== FICHA_MATRIZ_ID)
                    .sort((a: Ficha,b: Ficha) => a.nomeFicha.localeCompare(b.nomeFicha))
                    .map((ficha: Ficha) => (
                        <div key={ficha.id} className="flex items-center justify-between p-2 bg-stone-700 rounded-md min-h-[44px]">
                            {editingId === ficha.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        onBlur={handleSave}
                                        className="bg-stone-800 border border-stone-600 rounded-md p-1 flex-grow"
                                        style={{ color: 'var(--text-color)' }}
                                        autoFocus
                                    />
                                    <div className="flex gap-2 ml-2">
                                        <button onClick={handleSave} className="text-xl hover:scale-110 transition-transform">✅</button>
                                        <button onClick={handleCancel} className="text-xl hover:scale-110 transition-transform">❌</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span style={{ color: 'var(--text-color)' }}>{ficha.nomeFicha}</span>
                                    <button onClick={() => handleStartEdit(ficha)} className="p-1 hover:bg-stone-600 rounded-full">✏️</button>
                                </>
                            )}
                        </div>
                    ))}
                 {Object.values(fichas).length <= 1 && (
                    <p className="text-center opacity-70 p-4">Nenhuma ficha para renomear. Crie uma nova ficha primeiro!</p>
                )}
            </div>
             <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="btn-interactive px-6 py-2 bg-amber-700 rounded text-white">Fechar</button>
            </div>
        </Modal>
    );
};

export default RenameModal;
