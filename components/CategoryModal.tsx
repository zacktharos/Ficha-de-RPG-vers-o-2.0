
import React from 'react';
import Modal from './Modal.tsx';
import { categoryData } from '../assets/categoryImages.ts';

interface CategoryModalProps {
    onClose: () => void;
    onSelect: (key: string) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ onClose, onSelect }) => {
    const animalOrder = ['Lobo', 'Onça', 'Gorila', 'Tigre', 'Urso'];
    const legendaryOrder = ['Fênix', 'Dragão'];

    return (
        <Modal title="Selecionar Categoria" onClose={onClose}>
            <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
                <div>
                    <h3 className="font-medieval text-xl text-amber-300 mb-2 border-b-2 border-amber-800 pb-1">Categorias de Feras</h3>
                    {animalOrder.map(animalName => (
                        <div key={animalName} className="mb-4">
                            <h4 className="font-bold text-lg text-stone-300">{animalName}</h4>
                            <div className="flex justify-center gap-4 mt-2">
                                {categoryData.groups[animalName].map(cat => (
                                    <div key={cat.key} className="flex flex-col items-center">
                                        <button
                                            onClick={() => onSelect(cat.key)}
                                            className="w-20 h-20 rounded-full bg-cover bg-center border-4 border-stone-600 hover:border-amber-400 hover:scale-110 transition-all duration-200"
                                            style={{ backgroundImage: `url(${cat.image})` }}
                                            title={`Selecionar ${cat.name}`}
                                        ></button>
                                        <span className="text-xs mt-1 text-stone-400">{cat.tier}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div>
                    <h3 className="font-medieval text-xl text-red-500 mb-2 border-b-2 border-red-800 pb-1">Categorias Lendárias</h3>
                     <div className="flex justify-center gap-4 mt-2">
                        {legendaryOrder.map(animalName => (
                            categoryData.groups[animalName].map(cat => (
                                <div key={cat.key} className="flex flex-col items-center">
                                    <button
                                        onClick={() => onSelect(cat.key)}
                                        className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-stone-600 hover:border-red-400 hover:scale-110 transition-all duration-200"
                                        style={{ backgroundImage: `url(${cat.image})` }}
                                        title={`Selecionar ${cat.name}`}
                                    ></button>
                                    <span className="text-sm mt-1 text-stone-300 font-bold">{cat.name}</span>
                                </div>
                            ))
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CategoryModal;
