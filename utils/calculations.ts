
import { Ficha } from '../types';

/**
 * Calculates all derived attributes of a character sheet based on its primary stats and equipment.
 * This is a pure function that takes a Ficha object and returns a new, updated Ficha object.
 * @param ficha - The character sheet data to calculate from.
 * @returns A new Ficha object with updated derived attributes.
 */
export const calcularAtributos = (ficha: Ficha): Ficha => {
    const newFicha = { ...ficha };
    const adj = newFicha.gmAdjustments || {};

    const { forca, destreza, agilidade, inteligencia, constituicao, nivel, armaDireitaAtaque, armaEsquerdaAtaque, armaDireitaAtaqueMagico, armaEsquerdaAtaqueMagico, pesoTotal, vantagens } = newFicha;
    
    // Combat Attributes
    newFicha.ataque = forca + Math.floor(destreza / 5) + armaDireitaAtaque + armaEsquerdaAtaque + (adj.ataque || 0);
    newFicha.ataqueMagico = inteligencia + armaDireitaAtaqueMagico + armaEsquerdaAtaqueMagico + (adj.ataqueMagico || 0);
    newFicha.acerto = Math.floor(destreza / 3) + Math.floor(agilidade / 10) + (adj.acerto || 0);
    newFicha.esquiva = Math.floor(agilidade / 3) + (adj.esquiva || 0);
    newFicha.rdf = Math.floor(forca / 5) + (adj.rdf || 0);
    newFicha.rdm = Math.floor(inteligencia / 5) + (adj.rdm || 0);
    
    // Encumbrance
    newFicha.capacidadeCarga = 5 + Math.floor(forca / 5) + (adj.capacidadeCarga || 0);
    if (pesoTotal > newFicha.capacidadeCarga) {
        const sobrecarga = pesoTotal - newFicha.capacidadeCarga;
        const penalidade = -1 - Math.floor(Math.max(0, sobrecarga - 3) / 3);
        newFicha.acerto += penalidade;
        newFicha.esquiva += penalidade;
    }

    // Locomotion with Vantagens
    const bonusVelocidade = vantagens.includes("Combo Físico (4)") ? 25 : 0;
    const bonusAlturaPulo = vantagens.includes("Combo Físico (4)") ? 2 : 0;
    const bonusDistanciaPulo = vantagens.includes("Combo Físico (4)") ? 6 : 0;
    newFicha.velocidadeCorrida = 25 + Math.floor(agilidade / 3) * 3 + bonusVelocidade + (adj.velocidadeCorrida || 0);
    newFicha.alturaPulo = 1 + Math.floor(forca / 10) + bonusAlturaPulo + (adj.alturaPulo || 0);
    newFicha.distanciaPulo = 3 + 3 * Math.min(Math.floor(forca / 5), Math.floor(agilidade / 5)) + bonusDistanciaPulo + (adj.distanciaPulo || 0);

    // Resources and Regeneration
    newFicha.vidaTotal = Math.ceil(50 + (constituicao * (3 + Math.floor(forca / 10))) + 10 * nivel) + (adj.vidaTotal || 0);
    newFicha.magiaTotal = Math.ceil(20 + 3 * constituicao + (inteligencia >= 10 ? constituicao * Math.floor(inteligencia / 10) : 0)) + (adj.magiaTotal || 0);
    newFicha.vigorTotal = parseFloat((10 + 0.4 * constituicao).toFixed(1)) + (adj.vigorTotal || 0);

    newFicha.regeneracaoVida = parseFloat((0.2 * constituicao).toFixed(1)) + (adj.regeneracaoVida || 0);
    newFicha.regeneracaoMagia = parseFloat((0.8 * constituicao).toFixed(1)) + (adj.regeneracaoMagia || 0);
    newFicha.regeneracaoVigor = parseFloat((0.4 * constituicao).toFixed(1)) + (adj.regeneracaoVigor || 0);

    // Skill Points
    const pdGastos = forca + destreza + agilidade + constituicao + inteligencia;
    newFicha.pontosHabilidadeDisponiveis = newFicha.pontosHabilidadeTotais - pdGastos;

    return newFicha;
};
