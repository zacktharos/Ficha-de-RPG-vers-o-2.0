
import React from 'react';
import { categoryData } from '../assets/categoryImages.ts';

interface CategoryDisplayProps {
    selectedCategoryKey: string | null;
    onClick: () => void;
}

const CategoryDisplay: React.FC<CategoryDisplayProps> = ({ selectedCategoryKey, onClick }) => {
    const selectedCategory = categoryData.list.find(c => c.key === selectedCategoryKey);
    const displayName = selectedCategory?.name || 'Nenhuma Categoria';
    const displayImage = selectedCategory?.image || categoryData.placeholder;

    return (
        <div className="flex flex-col items-center justify-center cursor-pointer group" onClick={onClick}>
            <div 
                className="w-32 h-32 rounded-full bg-cover bg-center border-4 border-stone-600 group-hover:border-amber-400 transition-all duration-300 shadow-lg"
                style={{ backgroundImage: `url(${displayImage})` }}
                title={`Categoria: ${displayName}. Clique para alterar.`}
            >
            </div>
            <p className="mt-2 font-medieval text-lg text-amber-300 group-hover:text-amber-100 transition-colors">
                {displayName}
            </p>
        </div>
    );
};

export default CategoryDisplay;
