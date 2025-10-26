
import React from 'react';
import { Ficha, InventarioItem } from '../types.ts';

interface InventoryProps {
    ficha: Ficha;
    onUpdate: (key: 'inventario', value: InventarioItem[]) => void;
    onRecalculate: (ficha: Ficha) => void;
}

const Inventory: React.FC<InventoryProps> = ({ ficha, onUpdate }) => {
    
    // FIX: Type 'any' is not assignable to type 'never'. Correctly typed the value parameter and simplified logic.
    const handleItemChange = (index: number, field: keyof InventarioItem, value: string) => {
        const newInventory = [...ficha.inventario];
        const item = { ...newInventory[index] };
        
        if (field === 'peso') {
            item[field] = parseFloat(value) || 0;
        } else {
            item[field] = value;
        }

        newInventory[index] = item;
        onUpdate('inventario', newInventory);
    };

    const addItemSlot = () => {
        const newInventory = [...ficha.inventario, { item: '', peso: 0 }];
        onUpdate('inventario', newInventory);
    };

    const removeItemSlot = (index: number) => {
        const newInventory = ficha.inventario.filter((_, i) => i !== index);
        onUpdate('inventario', newInventory);
    }

    const pesoColor = ficha.pesoTotal > ficha.capacidadeCarga ? 'text-red-500' : 'text-stone-300';

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-medieval text-lg text-amber-400">Inventário</h3>
                <span className={`text-sm font-mono ${pesoColor}`}>
                    {ficha.pesoTotal.toFixed(1)} / {ficha.capacidadeCarga} kg
                </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {ficha.inventario.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder={`Item ${index + 1}`}
                            value={item.item}
                            onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                            className="flex-grow p-2 bg-stone-800 border border-stone-600 rounded-md"
                        />
                        <input
                            type="number"
                            value={item.peso}
                            onChange={(e) => handleItemChange(index, 'peso', e.target.value)}
                            className="w-20 p-2 bg-stone-800 border border-stone-600 rounded-md text-center"
                            title="Peso em kg"
                        />
                        <button onClick={() => removeItemSlot(index)} className="w-8 h-8 rounded-md bg-red-800 hover:bg-red-700 text-white flex-shrink-0">-</button>
                    </div>
                ))}
            </div>
            <button onClick={addItemSlot} className="mt-2 w-full py-1 bg-stone-700 hover:bg-stone-600 rounded-md transition-colors text-sm">Adicionar Item</button>
        </div>
    );
};

export default Inventory;
