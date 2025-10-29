import React, { useState, useMemo } from 'react';
import { Ficha, ClasseHabilidade } from '../types';
import { classesData } from '../constants';
import Modal from './Modal';

interface ClasseHabilidadesModalProps {
    ficha: Ficha;
    pontosVantagemDisponiveis: number;
    onUpdate: (updates: Partial<Ficha>) => void;
    onClose: () => void;
    isOpeningAfterLevelUp: boolean;
    isGmMode: boolean;
}

const SoulOrb = () => <div className="soul-orb"></div>;

const ClasseHabilidadesModal: React.FC<ClasseHabilidadesModalProps> = ({
    ficha,
    pontosVantagemDisponiveis,
    onUpdate,
    onClose,
    isOpeningAfterLevelUp,
    isGmMode
}) => {
    const selectedClasseData = ficha.classeSelecionada ? classesData.find(c => c.nome === ficha.classeSelecionada) : null;
    
    const [tempAdquiridas, setTempAdquiridas] = useState<string[]>([]);
    const [tempCompradasComPV, setTempCompradasComPV] = useState<string[]>([]);

    const skillsByLevel = useMemo(() => {
        if (!selectedClasseData) return {};
        return selectedClasseData.habilidades.reduce((acc, skill) => {
            (acc[skill.nivel] = acc[skill.nivel] || []).push(skill);
            return acc;
        }, {} as Record<number, ClasseHabilidade[]>);
    }, [selectedClasseData]);

    if (!selectedClasseData) {
        return (
            <Modal title="Habilidades de Classe" onClose={onClose}>
                <p>Nenhuma classe selecionada.</p>
            </Modal>
        );
    }

    const almasDisponiveis = ficha.almasTotais - ficha.almasGastas;
    const tempAlmasGastas = tempAdquiridas.filter(h => !tempCompradasComPV.includes(h)).length;
    const tempPVGastos = tempCompradasComPV.reduce((total, nomeHabilidade) => {
        const habilidade = selectedClasseData.habilidades.find(h => h.nome === nomeHabilidade);
        return total + (habilidade?.custoPVSemAlma || 0);
    }, 0);
    
    const almasRestantes = almasDisponiveis - tempAlmasGastas;
    const pvRestantes = pontosVantagemDisponiveis - tempPVGastos;

    const handleAcquireSkill = (habilidade: ClasseHabilidade) => {
        if (ficha.habilidadesClasseAdquiridas.includes(habilidade.nome)) return;
        if (tempAdquiridas.includes(habilidade.nome)) {
             // Des-selecionar
            setTempAdquiridas(tempAdquiridas.filter(h => h !== habilidade.nome));
            setTempCompradasComPV(tempCompradasComPV.filter(h => h !== habilidade.nome));
            return;
        }

        // Tenta usar Alma primeiro
        if (almasRestantes > 0) {
            setTempAdquiridas([...tempAdquiridas, habilidade.nome]);
        } else if (pvRestantes >= habilidade.custoPVSemAlma) {
             setTempAdquiridas([...tempAdquiridas, habilidade.nome]);
             setTempCompradasComPV([...tempCompradasComPV, habilidade.nome]);
        } else {
            alert("Você não tem Almas ou Pontos de Vantagem suficientes!");
        }
    };

    const handleSave = () => {
        const novasHabilidadesAdquiridas = [...ficha.habilidadesClasseAdquiridas, ...tempAdquiridas];
        const novasHabilidadesCompradasComPV = [...ficha.habilidadesClasseCompradasComPV, ...tempCompradasComPV];
        const novosAlmasGastas = ficha.almasGastas + tempAlmasGastas;

        // Adiciona as habilidades como magias/habilidades na ficha
        const novasMagiasHabilidades = [...ficha.magiasHabilidades];
        tempAdquiridas.forEach(nomeHabilidade => {
            const habilidade = selectedClasseData.habilidades.find(h => h.nome === nomeHabilidade);
            if (habilidade && habilidade.tipo !== 'passiva') {
                novasMagiasHabilidades.push({
                    nome: habilidade.nome,
                    custo: habilidade.custoMagia || 0,
                    custoVigor: habilidade.custoVigor || 0,
                    dano: habilidade.dano || '',
                    tipo: habilidade.tipo === 'ataque' ? 'dano' : habilidade.tipo === 'defesa' ? 'buff' : 'utilidade', // Mapeamento simples
                    isClassSkill: true,
                });
            }
        });
        
        onUpdate({
            habilidadesClasseAdquiridas: novasHabilidadesAdquiridas,
            habilidadesClasseCompradasComPV: novasHabilidadesCompradasComPV,
            almasGastas: novosAlmasGastas,
            magiasHabilidades: novasMagiasHabilidades,
        });
        onClose();
    };

    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };
    
    const modalClassName = isOpeningAfterLevelUp ? 'star-shine-animation' : '';

    return (
        <Modal title={`Habilidades de ${selectedClasseData.nome}`} onClose={onClose} className={modalClassName}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                 {isOpeningAfterLevelUp && (
                    <div className="p-3 bg-green-900/50 border border-green-700 rounded-md text-center">
                        <p className="font-bold text-lg">Parabéns pelo novo nível!</p>
                        <p>Você ganhou Almas para desbloquear novas habilidades.</p>
                    </div>
                )}

                <div className="flex justify-around text-center p-2 rounded-md" style={componentStyle}>
                    <div>
                        <div className="text-sm opacity-80">Almas Restantes</div>
                        {isGmMode ? (
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <button
                                    onClick={() => onUpdate({ almasTotais: Math.max(0, ficha.almasTotais - 1) })}
                                    className="btn-interactive w-8 h-8 rounded-md bg-stone-700 hover:bg-stone-600 text-white"
                                >
                                    -
                                </button>
                                <span className="w-10 text-center font-bold text-2xl">{almasRestantes}</span>
                                <button
                                    onClick={() => onUpdate({ almasTotais: ficha.almasTotais + 1 })}
                                    className="btn-interactive w-8 h-8 rounded-md bg-stone-700 hover:bg-stone-600 text-white"
                                >
                                    +
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center gap-2 h-10 mt-1">
                                {almasRestantes > 0 ? (
                                    Array.from({ length: almasRestantes }).map((_, i) => <SoulOrb key={i} />)
                                ) : (
                                    <span className="text-2xl font-bold">0</span>
                                )}
                            </div>
                        )}
                    </div>
                     <div>
                        <div className="text-sm opacity-80">PV Restantes</div>
                        <div className="text-2xl font-bold">{pvRestantes}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    {Object.keys(skillsByLevel).sort((a, b) => Number(a) - Number(b)).map(levelStr => {
                        const level = Number(levelStr);
                        if (ficha.nivel < level) return null;

                        const habilidades = skillsByLevel[level];
                        
                        return (
                            <div key={level}>
                                <h3 className="font-medieval text-xl mb-2" style={{ color: 'var(--accent-color)' }}>Nível {level}</h3>
                                <div className="space-y-3">
                                {habilidades.map(habilidade => {
                                    const isAcquired = ficha.habilidadesClasseAdquiridas.includes(habilidade.nome);
                                    const isSelected = tempAdquiridas.includes(habilidade.nome);
                                    const isBoughtWithPV = tempCompradasComPV.includes(habilidade.nome);

                                    const statusText = isAcquired ? 'Adquirida' : '';
                                    const statusColor = isAcquired ? 'text-green-400' : '';
                                    
                                    let buttonText = 'Adquirir';
                                    if (isSelected) {
                                        buttonText = isBoughtWithPV ? `Usando ${habilidade.custoPVSemAlma} PV` : 'Usando 1 Alma';
                                    }

                                    const canAfford = almasRestantes > 0 || pvRestantes >= habilidade.custoPVSemAlma;
                                    
                                    return (
                                        <div key={habilidade.nome} className="p-3 rounded-lg border" style={{...componentStyle, borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)'}}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-lg">{habilidade.nome}</h4>
                                                    <p className="text-sm opacity-80">{habilidade.descricao}</p>
                                                </div>
                                                <span className={`text-xs font-bold whitespace-nowrap ${statusColor}`}>{statusText}</span>
                                            </div>
                                            <div className="text-xs opacity-70 mt-2 flex flex-wrap gap-x-4">
                                                {habilidade.custoMagia !== undefined && <span>✨ Magia: {habilidade.custoMagia}</span>}
                                                {habilidade.custoVigor !== undefined && <span>⚡ Vigor: {habilidade.custoVigor}</span>}
                                                {habilidade.dano && <span>💥 Dano/Efeito: {habilidade.dano}</span>}
                                            </div>

                                            {!isAcquired && (
                                                <div className="mt-3 text-right">
                                                    <button 
                                                        onClick={() => handleAcquireSkill(habilidade)}
                                                        disabled={!canAfford && !isSelected}
                                                        className={`btn-interactive px-4 py-2 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${isSelected ? 'bg-amber-800' : 'bg-stone-700 hover:bg-stone-600'} text-white`}
                                                    >
                                                        {buttonText}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                </div>
                            </div>
                        );
                    })}
                </div>
                 <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="btn-interactive px-4 py-2 bg-stone-600 rounded text-white">Cancelar</button>
                    <button onClick={handleSave} disabled={tempAdquiridas.length === 0} className="btn-interactive px-4 py-2 bg-amber-700 rounded disabled:bg-stone-500 disabled:cursor-not-allowed text-white">Confirmar Aquisição</button>
                </div>
            </div>
        </Modal>
    );
};

export default ClasseHabilidadesModal;
