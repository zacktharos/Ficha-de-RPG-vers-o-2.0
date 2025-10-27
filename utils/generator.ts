import type { Ficha } from '../types';
import { nivelData, racasData, desvantagensData, vantagensData } from '../constants';

export type Atributo = 'forca' | 'destreza' | 'agilidade' | 'constituicao' | 'inteligencia';
export type Arquétipo = 'Mago' | 'Guerreiro (Ataque)' | 'Guerreiro (Tanque)' | 'Ladino' | 'Paladino';

interface ArchetypeConfig {
    weights: Record<Atributo, number>;
    multiples?: Partial<Record<Atributo, number>>;
}

const archetypeConfigs: Record<Arquétipo, ArchetypeConfig> = {
    'Mago': {
        weights: { inteligencia: 6, constituicao: 3, agilidade: 2, destreza: 1, forca: 1 },
        multiples: { destreza: 3, agilidade: 3 }
    },
    'Guerreiro (Ataque)': {
        weights: { forca: 5, destreza: 4, constituicao: 3, agilidade: 2, inteligencia: 1 },
        multiples: { destreza: 3, agilidade: 3 }
    },
    'Guerreiro (Tanque)': {
        weights: { constituicao: 5, forca: 4, destreza: 2, agilidade: 2, inteligencia: 1 },
        multiples: { destreza: 3, agilidade: 3 }
    },
    'Ladino': {
        weights: { agilidade: 5, destreza: 5, inteligencia: 2, constituicao: 2, forca: 1 },
        multiples: { destreza: 3, agilidade: 3 }
    },
    'Paladino': {
        weights: { forca: 4, inteligencia: 4, constituicao: 4, destreza: 2, agilidade: 1 },
        multiples: { destreza: 3, agilidade: 3 }
    }
};

export const distributePoints = (totalPoints: number, archetype: Arquétipo): Record<Atributo, number> => {
    const config = archetypeConfigs[archetype];
    const stats: Record<Atributo, number> = { forca: 0, destreza: 0, agilidade: 0, constituicao: 0, inteligencia: 0 };
    let pointsPool = totalPoints;

    const totalWeight = Object.values(config.weights).reduce((sum, weight) => sum + weight, 0);

    // Initial distribution based on weights
    for (const attr of Object.keys(stats) as Atributo[]) {
        const share = Math.floor((config.weights[attr] / totalWeight) * totalPoints);
        stats[attr] = share;
        pointsPool -= share;
    }

    // Distribute remaining points randomly based on weights
    while (pointsPool > 0) {
        let random = Math.random() * totalWeight;
        for (const attr of Object.keys(stats) as Atributo[]) {
            random -= config.weights[attr];
            if (random <= 0) {
                stats[attr]++;
                pointsPool--;
                break;
            }
        }
    }

    // Clean up for multiples
    if (config.multiples) {
        let unspentPoints = 0;
        for (const attr of Object.keys(config.multiples) as Atributo[]) {
            const multiple = config.multiples[attr]!;
            const remainder = stats[attr] % multiple;
            if (remainder > 0) {
                stats[attr] -= remainder;
                unspentPoints += remainder;
            }
        }
        // Add unspent points to the highest weight attribute that doesn't have a multiple rule
        const highestWeightAttr = (Object.keys(config.weights) as Atributo[]).sort((a, b) => config.weights[b] - config.weights[a]).find(a => !config.multiples?.[a]);
        if (highestWeightAttr) {
            stats[highestWeightAttr] += unspentPoints;
        }
    }

    return stats;
};

export const generateNpcData = (level: number, archetype: Arquétipo): Partial<Ficha> => {
    const nivelInfo = nivelData.find(n => n.nivel === level) || nivelData[0];
    const pd = nivelInfo.pd;
    let ph = nivelInfo.ph;

    const atributos = distributePoints(pd, archetype);

    const data: Partial<Ficha> = {
        ...atributos,
        nivel: level,
        experiencia: nivelInfo.xp,
    };

    const affordableRacas = racasData.filter(r => r.custo <= ph);
    if (affordableRacas.length > 0) {
        const raca = affordableRacas[Math.floor(Math.random() * affordableRacas.length)];
        data.racaSelecionada = raca.nome;
        ph -= raca.custo;
    }

    const numDesvantagens = Math.floor(Math.random() * 3); // 0, 1, or 2
    const shuffledDesvantagens = [...desvantagensData].sort(() => 0.5 - Math.random());
    data.desvantagens = [];
    for (let i = 0; i < numDesvantagens && i < shuffledDesvantagens.length; i++) {
        const desvantagem = shuffledDesvantagens[i];
        data.desvantagens.push(desvantagem.nome);
        ph += desvantagem.ganho;
    }

    data.vantagens = [];
    let attempts = 0;
    while (ph > 0 && attempts < 100) {
        const affordableVantagens = vantagensData.filter(v => v.custo <= ph && v.restricao !== 'inicio');
        if (affordableVantagens.length === 0) break;
        
        const vantagem = affordableVantagens[Math.floor(Math.random() * affordableVantagens.length)];
        data.vantagens.push(vantagem.nome);
        ph -= vantagem.custo;
        attempts++;
    }
    
    return data;
};
