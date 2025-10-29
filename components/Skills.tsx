import React from 'react';
import { Ficha, Magia } from '../types';

interface SkillsProps {
    ficha: Ficha;
    onUpdate: (updates: Partial<Ficha>) => void;
    isGmMode: boolean;
}

const Skills: React.FC<SkillsProps> = ({ ficha, onUpdate, isGmMode }) => {
    
    const classSkills = ficha.magiasHabilidades.filter(s => s.isClassSkill);
    const regularSkills = ficha.magiasHabilidades.filter(s => !s.isClassSkill);

    const handleSkillChange = (index: number, field: keyof Magia, value: string, isClass: boolean) => {
        const newSkills = [...ficha.magiasHabilidades];
        // Find the original index in the main array
        const originalIndex = ficha.magiasHabilidades.findIndex(s => s.nome === (isClass ? classSkills[index].nome : regularSkills[index].nome));
        
        if (originalIndex === -1) return;

        const skill = { ...newSkills[originalIndex] };
        
        if (field === 'custo' || field === 'custoVigor') {
            (skill as any)[field] = parseFloat(value) || 0;
        } else {
            (skill as any)[field] = value;
        }
        
        newSkills[originalIndex] = skill;
        onUpdate({ magiasHabilidades: newSkills });
    };

    const addSkillSlot = () => {
        const newSkills = [...ficha.magiasHabilidades, { nome: '', custo: 0, custoVigor: 0, dano: '', tipo: '' }];
        onUpdate({ magiasHabilidades: newSkills });
    };
    
    const removeSkillSlot = (index: number) => {
        const skillToRemove = regularSkills[index];
        const newSkills = ficha.magiasHabilidades.filter(s => s.nome !== skillToRemove.nome || s.isClassSkill);
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

    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };
    const inputStyle = {
      backgroundColor: 'white',
      color: 'black',
      border: '1px solid #ccc'
    };
    const disabledInputStyle = {
      backgroundColor: '#f0f0f0',
      color: '#555',
      cursor: 'not-allowed',
      border: '1px solid #ccc'
    }
    
    const renderSkillList = (skills: Magia[], isClassSkill: boolean) => (
        <div className="space-y-3">
            {skills.map((skill, index) => (
                <div key={`${isClassSkill}-${skill.nome}-${index}`} className="bg-stone-800 p-3 rounded-lg border border-stone-700" style={componentStyle}>
                    <div className="flex items-center gap-2 mb-2">
                         <input
                            type="text"
                            placeholder="Nome da Habilidade"
                            value={skill.nome}
                            onChange={(e) => handleSkillChange(index, 'nome', e.target.value, isClassSkill)}
                            disabled={isClassSkill && !isGmMode}
                            className="flex-grow p-2 bg-stone-700 border border-stone-600 rounded-md font-bold disabled:bg-stone-800 disabled:opacity-70"
                        />
                        {!isClassSkill && (
                            <button onClick={() => removeSkillSlot(index)} className="btn-interactive w-8 h-8 rounded-md bg-red-800 hover:bg-red-700 text-white flex-shrink-0">-</button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                        <input
                            type="number"
                            placeholder="✨ Custo"
                            title="Custo de Magia"
                            value={skill.custo}
                            onChange={(e) => handleSkillChange(index, 'custo', e.target.value, isClassSkill)}
                            disabled={isClassSkill && !isGmMode}
                            className="p-2 rounded-md"
                            style={(isClassSkill && !isGmMode) ? disabledInputStyle : inputStyle}
                        />
                         <input
                            type="number"
                            placeholder="⚡ Custo"
                            title="Custo de Vigor"
                            value={skill.custoVigor}
                            step="0.1"
                            onChange={(e) => handleSkillChange(index, 'custoVigor', e.target.value, isClassSkill)}
                            disabled={isClassSkill && !isGmMode}
                            className="p-2 rounded-md"
                            style={(isClassSkill && !isGmMode) ? disabledInputStyle : inputStyle}
                        />
                        <input
                            type="text"
                            placeholder="Dano/Efeito"
                            value={skill.dano}
                            onChange={(e) => handleSkillChange(index, 'dano', e.target.value, isClassSkill)}
                            disabled={isClassSkill && !isGmMode}
                            className="p-2 rounded-md col-span-2 sm:col-span-1"
                            style={(isClassSkill && !isGmMode) ? disabledInputStyle : inputStyle}
                        />
                        <select
                            value={skill.tipo}
                            onChange={(e) => handleSkillChange(index, 'tipo', e.target.value, isClassSkill)}
                            disabled={isClassSkill && !isGmMode}
                            className="p-2 rounded-md"
                            style={(isClassSkill && !isGmMode) ? disabledInputStyle : inputStyle}
                        >
                            <option value="">Tipo...</option>
                            <option value="dano">Dano</option>
                            <option value="cura">Cura</option>
                            <option value="buff">Buff</option>
                            <option value="debuff">Debuff</option>
                            <option value="utilidade">Utilidade</option>
                        </select>
                         <button onClick={() => handleCast(skill)} className="btn-interactive p-2 bg-amber-700 rounded-md hover:bg-amber-600 text-xs text-white">Lançar</button>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {classSkills.length > 0 && (
                <div>
                    <h3 className="font-medieval text-lg mb-2">Habilidades de Classe</h3>
                    {renderSkillList(classSkills, true)}
                </div>
            )}
            
            <div>
                <h3 className="font-medieval text-lg mb-2">Magias e Habilidades</h3>
                {renderSkillList(regularSkills, false)}
                <button onClick={addSkillSlot} className="btn-interactive mt-2 w-full py-1 bg-stone-700 hover:bg-stone-600 rounded-md text-sm text-white">Adicionar Habilidade</button>
            </div>
        </div>
    );
};

export default Skills;