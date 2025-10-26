import React, { useState } from 'react';
import { Ficha } from '../types';
import Modal from './Modal';

interface CustomizationModalProps {
    ficha: Ficha;
    onClose: () => void;
    onUpdate: (updates: Partial<Ficha>) => void;
    onReset: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

type Aesthetics = Pick<Ficha,
    'theme' | 'backgroundColor' | 'sheetBackgroundColor' | 'fontFamily' |
    'sheetOpacity' | 'shadowColor' | 'shadowIntensity' | 'backgroundImage' | 'backgroundSize' |
    'borderColor' | 'borderStyle' | 'borderWidth' | 'diceColor' | 'diceNumberColor' |
    'diceTexture' | 'diceAnimation'
>;


const CustomizationModal: React.FC<CustomizationModalProps> = ({ ficha, onClose, onUpdate, onReset }) => {
    const [initialAesthetics] = useState<Aesthetics>({
        theme: ficha.theme,
        backgroundColor: ficha.backgroundColor,
        sheetBackgroundColor: ficha.sheetBackgroundColor,
        fontFamily: ficha.fontFamily,
        sheetOpacity: ficha.sheetOpacity,
        shadowColor: ficha.shadowColor,
        shadowIntensity: ficha.shadowIntensity,
        backgroundImage: ficha.backgroundImage,
        backgroundSize: ficha.backgroundSize,
        borderColor: ficha.borderColor,
        borderStyle: ficha.borderStyle,
        borderWidth: ficha.borderWidth,
        diceColor: ficha.diceColor,
        diceNumberColor: ficha.diceNumberColor,
        diceTexture: ficha.diceTexture,
        diceAnimation: ficha.diceAnimation,
    });
    
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const handleUpdate = <K extends keyof Ficha>(key: K, value: Ficha[K]) => {
        onUpdate({ [key]: value });
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, key: 'backgroundImage' | 'diceTexture') => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            handleUpdate(key, base64);
        }
    };

    const handleConfirmReset = () => {
        onReset();
        setShowResetConfirm(false);
        onClose();
    };

    const handleCancel = () => {
        onUpdate(initialAesthetics);
        onClose();
    };
    
    return (
        <>
            <Modal title="Customização" onClose={handleCancel}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    
                    {/* Colors & Font */}
                    <fieldset className="border border-stone-600 p-3 rounded-md">
                        <legend className="px-2 font-medieval text-amber-400">Aparência</legend>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm">Fundo da Página</label>
                                <input type="color" value={ficha.backgroundColor || '#121212'} onChange={e => handleUpdate('backgroundColor', e.target.value)} className="w-full h-8 p-0 border-none rounded bg-stone-700" />
                            </div>
                             <div>
                                <label className="text-sm">Fundo da Ficha</label>
                                <input type="color" value={ficha.sheetBackgroundColor || '#1e1e1e'} onChange={e => handleUpdate('sheetBackgroundColor', e.target.value)} className="w-full h-8 p-0 border-none rounded bg-stone-700" />
                            </div>
                        </div>
                         <div className="mt-2">
                            <label className="text-sm">Fonte</label>
                            <select value={ficha.fontFamily} onChange={e => handleUpdate('fontFamily', e.target.value)} className="w-full p-2 bg-stone-700 rounded">
                                <option value="'Inter', sans-serif">Padrão</option>
                                <option value="'MedievalSharp', serif">Medieval</option>
                                <option value="'Orbitron', sans-serif">Futurista</option>
                            </select>
                        </div>
                    </fieldset>
                    
                     {/* Opacity & Shadow */}
                    <fieldset className="border border-stone-600 p-3 rounded-md">
                        <legend className="px-2 font-medieval text-amber-400">Opacidade e Sombra</legend>
                         <div>
                            <label className="text-sm">Opacidade da Ficha ({ficha.sheetOpacity}%)</label>
                            <input type="range" min="10" max="100" value={ficha.sheetOpacity} onChange={e => handleUpdate('sheetOpacity', parseInt(e.target.value))} className="w-full" />
                        </div>
                         <div className="mt-2">
                            <label className="text-sm">Intensidade da Sombra ({ficha.shadowIntensity}%)</label>
                            <input type="range" min="0" max="100" value={ficha.shadowIntensity} onChange={e => handleUpdate('shadowIntensity', parseInt(e.target.value))} className="w-full" />
                        </div>
                    </fieldset>

                    {/* Background Image */}
                    <fieldset className="border border-stone-600 p-3 rounded-md">
                         <legend className="px-2 font-medieval text-amber-400">Imagem de Fundo (Página)</legend>
                         <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'backgroundImage')} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-800 file:text-amber-50 hover:file:bg-amber-700" />
                         {ficha.backgroundImage && <button onClick={() => handleUpdate('backgroundImage', null)} className="text-xs text-red-400 mt-1">Remover Imagem</button>}
                    </fieldset>
                    
                    {/* Dice */}
                    <fieldset className="border border-stone-600 p-3 rounded-md">
                        <legend className="px-2 font-medieval text-amber-400">Dado</legend>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm">Cor do Fundo</label>
                                <input type="color" value={ficha.diceColor || '#a0522d'} onChange={e => handleUpdate('diceColor', e.target.value)} className="w-full h-8 p-0 border-none rounded bg-stone-700" />
                            </div>
                             <div>
                                <label className="text-sm">Cor do Número</label>
                                <input type="color" value={ficha.diceNumberColor || '#ffffff'} onChange={e => handleUpdate('diceNumberColor', e.target.value)} className="w-full h-8 p-0 border-none rounded bg-stone-700" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <label className="text-sm">Animação</label>
                            <select value={ficha.diceAnimation} onChange={e => handleUpdate('diceAnimation', e.target.value as Ficha['diceAnimation'])} className="w-full p-2 bg-stone-700 rounded">
                                <option value="padrao">Padrão</option>
                                <option value="rapido">Rápido</option>
                                <option value="salto">Salto</option>
                            </select>
                        </div>
                    </fieldset>
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-stone-700">
                        <button onClick={() => setShowResetConfirm(true)} className="w-full py-2 bg-red-800 hover:bg-red-700 rounded-md col-span-2">Reiniciar Estética</button>
                        <button onClick={handleCancel} className="w-full py-2 bg-stone-600 hover:bg-stone-500 rounded-md">Cancelar</button>
                        <button onClick={onClose} className="w-full py-2 bg-amber-700 hover:bg-amber-600 rounded-md">Salvar</button>
                    </div>
                </div>
            </Modal>
            {showResetConfirm && (
                <Modal title="Confirmar Reset" onClose={() => setShowResetConfirm(false)}>
                    <p>Tem certeza que deseja reiniciar toda a estética para o padrão medieval?</p>
                    <p className="text-sm text-stone-400 mt-1">Seus dados de personagem não serão afetados.</p>
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 bg-stone-600 rounded">Não</button>
                        <button onClick={handleConfirmReset} className="px-4 py-2 bg-red-700 rounded">Sim, Reiniciar</button>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default CustomizationModal;