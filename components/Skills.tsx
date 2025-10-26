
import React from 'react';
import { Ficha, Magia } from '../types';

interface SkillsProps {
    ficha: Ficha;
    onUpdate: (updates: Partial<Ficha>) => void;
}

const Skills: React.FC<SkillsProps> = ({ ficha, onUpdate }) => {
    
    const handleSkillChange = (index: number, field: keyof Magia, value: string) => {
        const newSkills = [...ficha.magiasHabilidades];
        const skill = { ...newSkills[index] };
        
        if (field === 'custo' || field === 'custoVigor') {
            skill[field] = parseFloat(value) || 0;
        } else {
            skill[field] = value;
        }
        
        newSkills[index] = skill;
        onUpdate({ magiasHabilidades: newSkills });
    };

    const addSkillSlot = () => {
        const newSkills = [...ficha.magiasHabilidades, { nome: '', custo: 0, custoVigor: 0, dano: '', tipo: '' }];
        onUpdate({ magiasHabilidades: newSkills });
    };
    
    const removeSkillSlot = (index: number) => {
        const newSkills = ficha.magiasHabilidades.filter((_, i) => i !== index);
        onUpdate({ magiasHabilidades: newSkills });
    };

    const handleCast = (skill: Magia) => {
        let newVida = ficha.vidaAtual;
        let newMagia = ficha.magiaAtual;
        let newVigor = ficha.vigorAtual;

        if (newMagia < skill.custo) {
            alert("Magia insuficiente!");
            return;
        }
        if (newVigor < skill.custoVigor) {
            alert("Vigor insuficiente!");
            return;
        }

        newMagia -= skill.custo;
        newVigor -= skill.custoVigor;
        
        if (skill.tipo === 'cura') {
            const healAmount = parseInt(skill.dano) || 0;
            newVida = Math.min(ficha.vidaTotal, newVida + healAmount);
        }

        onUpdate({
            vidaAtual: newVida,
            magiaAtual: newMagia,
            vigorAtual: newVigor,
        });
    }

    return (
        <div>
            <h3 className="font-medieval text-lg text-amber-400 mb-2">Magias e Habilidades</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {ficha.magiasHabilidades.map((skill, index) => (
                    <div key={index} className="bg-stone-800 p-3 rounded-lg border border-stone-700">
                        <div className="flex items-center gap-2 mb-2">
                             <input
                                type="text"
                                placeholder="Nome da Habilidade"
                                value={skill.nome}
                                onChange={(e) => handleSkillChange(index, 'nome', e.target.value)}
                                className="flex-grow p-2 bg-stone-700 border border-stone-600 rounded-md text-white font-bold"
                            />
                            <button onClick={() => removeSkillSlot(index)} className="w-8 h-8 rounded-md bg-red-800 hover:bg-red-700 text-white flex-shrink-0">-</button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                            <input
                                type="number"
                                placeholder="✨ Custo"
                                title="Custo de Magia"
                                value={skill.custo}
                                onChange={(e) => handleSkillChange(index, 'custo', e.target.value)}
                                className="p-2 bg-stone-700 border border-stone-600 rounded-md"
                            />
                             <input
                                type="number"
                                placeholder="⚡ Custo"
                                title="Custo de Vigor"
                                value={skill.custoVigor}
                                step="0.1"
                                onChange={(e) => handleSkillChange(index, 'custoVigor', e.target.value)}
                                className="p-2 bg-stone-700 border border-stone-600 rounded-md"
                            />
                            <input
                                type="text"
                                placeholder="Dano/Efeito"
                                value={skill.dano}
                                onChange={(e) => handleSkillChange(index, 'dano', e.target.value)}
                                className="p-2 bg-stone-700 border border-stone-600 rounded-md col-span-2 sm:col-span-1"
                            />
                            <select
                                value={skill.tipo}
                                onChange={(e) => handleSkillChange(index, 'tipo', e.target.value)}
                                className="p-2 bg-stone-700 border border-stone-600 rounded-md"
                            >
                                <option value="">Tipo...</option>
                                <option value="dano">Dano</option>
                                <option value="cura">Cura</option>
                                <option value="buff">Buff</option>
                                <option value="debuff">Debuff</option>
                                <option value="utilidade">Utilidade</option>
                            </select>
                             <button onClick={() => handleCast(skill)} className="p-2 bg-amber-700 rounded-md hover:bg-amber-600 text-xs">Lançar</button>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={addSkillSlot} className="mt-2 w-full py-1 bg-stone-700 hover:bg-stone-600 rounded-md transition-colors text-sm">Adicionar Habilidade</button>
        </div>
    );
};

export default Skills;
