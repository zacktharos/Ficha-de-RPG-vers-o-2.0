
import React from 'react';

interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-stone-600">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-medieval text-amber-400">{title}</h2>
                    <button onClick={onClose} className="text-2xl text-stone-400 hover:text-white">&times;</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
