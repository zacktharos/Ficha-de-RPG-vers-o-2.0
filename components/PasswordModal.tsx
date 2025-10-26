
import React, { useState, useEffect } from 'react';
import Modal from './Modal.tsx';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    title?: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSuccess, title = "Confirmação Necessária" }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setError('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        if (password === '1040') {
            onSuccess();
        } else {
            setError('Senha incorreta. Tente novamente.');
            setPassword('');
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleConfirm();
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <Modal title={title} onClose={onClose}>
            <p className="mb-2 text-stone-300">Por favor, insira a senha para continuar.</p>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-2 border rounded bg-stone-700 border-stone-600 text-white focus:ring-amber-500 focus:border-amber-500"
                autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 bg-stone-600 rounded">Cancelar</button>
                <button onClick={handleConfirm} className="px-4 py-2 bg-amber-700 rounded">Confirmar</button>
            </div>
        </Modal>
    );
};

export default PasswordModal;
