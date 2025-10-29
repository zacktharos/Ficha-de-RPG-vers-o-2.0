import { useState, useEffect, useCallback } from 'react';
import type { Ficha, DiceRoll, EditableAttributes } from '../types';
import { 
    FICHA_MATRIZ_ID, 
    RGP_FICHAS_KEY, 
    RPG_CURRENT_FICHA_ID_KEY, 
    RPG_GM_MODE_KEY,
    nivelData,
    vantagensData,
    desvantagensData,
    racasData,
    classesData
} from '../constants';
import { calcularAtributos } from '../utils/calculations';

const createDefaultFicha = (id: string, nomeFicha: string): Ficha => ({
    id,
    nomeFicha,
    nomePersonagem: '',
    descricaoPersonagem: '',
    forca: 0, destreza: 0, agilidade: 0, constituicao: 0, inteligencia: 0,
    lockedAtributos: { forca: 0, destreza: 0, agilidade: 0, constituicao: 0, inteligencia: 0 },
    ataque: 0, ataqueMagico: 0, acerto: 0, esquiva: 0, rdf: 0, rdm: 0,
    vidaTotal: 50, vidaAtual: 50, magiaTotal: 20, magiaAtual: 20, vigorTotal: 10, vigorAtual: 10,
    regeneracaoVida: 0, regeneracaoMagia: 0, regeneracaoVigor: 0,
    armaDireitaNome: '', armaDireitaAtaque: 0, armaDireitaAtaqueMagico: 0,
    armaEsquerdaNome: '', armaEsquerdaAtaque: 0, armaEsquerdaAtaqueMagico: 0,
    inventario: Array(5).fill({ item: '', peso: 0 }),
    pesoTotal: 0, capacidadeCarga: 5,
    magiasHabilidades: Array(3).fill({ nome: '', custo: 0, custoVigor: 0, dano: '', tipo: '' }),
    vantagens: [], desvantagens: [], racaSelecionada: null,
    velocidadeCorrida: 25, alturaPulo: 1, distanciaPulo: 3,
    experiencia: 0,
    lockedExperiencia: 0,
    nivel: 0, pontosHabilidadeTotais: 25, pontosHabilidadeDisponiveis: 25, pontosVantagemTotais: 8,
    classeSelecionada: null,
    habilidadesClasseAdquiridas: [],
    habilidadesClasseCompradasComPV: [],
    almasTotais: 0,
    almasGastas: 0,
    showClasseSkillsNotification: false,
    anotacoes: '',
    gmAdjustments: {},
    // Character Image
    characterImage: null,
    // Aesthetics
    theme: 'theme-medieval',
    darkMode: false,
    backgroundColor: '#f0e6d2',
    sheetBackgroundColor: '#f0e6d2',
    componentBackgroundColor: '#f0e6d2',
    fontFamily: "'Inter', sans-serif",
    sheetOpacity: 100,
    shadowColor: '#000000',
    shadowIntensity: 0,
    backgroundImage: null,
    backgroundSize: 'cover',
    borderColor: '#b8860b',
    borderStyle: 'solid',
    borderWidth: 2,
    diceColor: '#f0e6d2',
    diceNumberColor: '#000000',
    diceTexture: null,
    diceAnimation: 'padrao',
    textColor: '#000000',
    accentColor: '#f59e0b',
});


export const useCharacterSheet = () => {
    const [fichas, setFichas] = useState<Record<string, Ficha>>({});
    const [currentFichaId, setCurrentFichaId] = useState<string>(FICHA_MATRIZ_ID);
    const [diceHistory, setDiceHistory] = useState<DiceRoll[]>([]);
    const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
    const [passwordRequest, setPasswordRequest] = useState<(() => void) | null>(null);
    const [isGmMode, setIsGmMode] = useState(false);
    const [levelUpEffect, setLevelUpEffect] = useState(false);
    const [justCreatedFichaId, setJustCreatedFichaId] = useState<string | null>(null);

    const saveFichasToStorage = useCallback((fichasToSave: Record<string, Ficha>) => {
        try {
            localStorage.setItem(RGP_FICHAS_KEY, JSON.stringify(fichasToSave));
        } catch (error) {
            console.error("Failed to save fichas to storage", error);
        }
    }, []);

     const updateFicha = useCallback((id: string, updatedFichaData: Partial<Ficha>) => {
        setFichas(prevFichas => {
            const oldFicha = prevFichas[id];
            if (!oldFicha) return prevFichas;

            let newFicha = { ...oldFicha, ...updatedFichaData };
            
            const oldLevel = oldFicha.nivel;
            const nivelInfo = [...nivelData].reverse().find(data => newFicha.experiencia >= data.xp) || nivelData[0];
            const newLevel = nivelInfo.nivel;
            
            newFicha.nivel = newLevel;
            newFicha.pontosHabilidadeTotais = nivelInfo.pd + (newFicha.gmAdjustments?.pontosHabilidadeTotais || 0);
            newFicha.pontosVantagemTotais = nivelInfo.ph + (newFicha.gmAdjustments?.pontosVantagemTotais || 0);
            
            if (newLevel > oldLevel) {
                setLevelUpEffect(true);
                setTimeout(() => setLevelUpEffect(false), 3000);

                const keyLevels = [1, 5, 10, 15, 20, 25, 30];
                let almasGanhadas = 0;
                for (let i = oldLevel + 1; i <= newLevel; i++) {
                    if (keyLevels.includes(i)) {
                        almasGanhadas++;
                    }
                }
                if(almasGanhadas > 0) {
                    newFicha.almasTotais = (oldFicha.almasTotais || 0) + almasGanhadas;
                    newFicha.showClasseSkillsNotification = true;
                }
            }

            newFicha.pesoTotal = newFicha.inventario.reduce((sum, item) => sum + (item.peso || 0), 0);
            
            const finalFicha = calcularAtributos(newFicha);
            
            const updatedFichas = { ...prevFichas, [id]: finalFicha };
            saveFichasToStorage(updatedFichas);
            return updatedFichas;
        });
    }, [saveFichasToStorage]);

    useEffect(() => {
        let loadedFichas: Record<string, Ficha> = {};
        try {
            const fichasJSON = localStorage.getItem(RGP_FICHAS_KEY);
            if (fichasJSON) {
                const parsedData = JSON.parse(fichasJSON);
                if (typeof parsedData === 'object' && parsedData !== null && !Array.isArray(parsedData)) {
                    loadedFichas = parsedData;
                } else {
                    console.warn('Corrupted data in localStorage, initializing.');
                }
            }
        } catch (error) {
            console.error("Failed to parse fichas from storage, initializing.", error);
        }

        if (!loadedFichas[FICHA_MATRIZ_ID]) {
            loadedFichas[FICHA_MATRIZ_ID] = createDefaultFicha(FICHA_MATRIZ_ID, "Matriz");
        }

        const defaultFichaTemplate = createDefaultFicha('', '');

        for (const key in loadedFichas) {
            const ficha = loadedFichas[key];

            if (typeof ficha !== 'object' || ficha === null || Array.isArray(ficha)) {
                console.warn(`Invalid data for ficha with key ${key}. Replacing with default.`);
                loadedFichas[key] = createDefaultFicha(key, (ficha as any)?.nomeFicha || `Ficha Corrompida`);
                continue;
            }

            for (const prop in defaultFichaTemplate) {
                const typedProp = prop as keyof Ficha;
                const defaultValue = defaultFichaTemplate[typedProp];
                const currentValue = ficha[typedProp];
                
                if (currentValue === undefined) {
                    (ficha as any)[typedProp] = defaultValue;
                } else if (typeof defaultValue === 'number' && typeof currentValue !== 'number') {
                    (ficha as any)[typedProp] = parseFloat(currentValue as any) || 0;
                } else if (Array.isArray(defaultValue) && !Array.isArray(currentValue)) {
                    (ficha as any)[typedProp] = defaultValue;
                }
            }
            
            if (Array.isArray(ficha.inventario)) {
                ficha.inventario = ficha.inventario.map(item => ({
                    item: String(item?.item || ''),
                    peso: parseFloat(item?.peso as any) || 0
                }));
            } else {
                 ficha.inventario = defaultFichaTemplate.inventario;
            }

            if (Array.isArray(ficha.magiasHabilidades)) {
                ficha.magiasHabilidades = ficha.magiasHabilidades.map(magia => ({
                    nome: String(magia?.nome || ''),
                    custo: parseFloat(magia?.custo as any) || 0,
                    custoVigor: parseFloat(magia?.custoVigor as any) || 0,
                    dano: String(magia?.dano || ''),
                    tipo: String(magia?.tipo || ''),
                    isClassSkill: !!magia?.isClassSkill,
                }));
            } else {
                ficha.magiasHabilidades = defaultFichaTemplate.magiasHabilidades;
            }

            if (typeof ficha.lockedAtributos === 'object' && ficha.lockedAtributos !== null) {
                 for (const attr in defaultFichaTemplate.lockedAtributos) {
                    const typedAttr = attr as keyof typeof defaultFichaTemplate.lockedAtributos;
                    if (typeof ficha.lockedAtributos[typedAttr] !== 'number') {
                        (ficha.lockedAtributos as any)[typedAttr] = parseFloat((ficha.lockedAtributos as any)[typedAttr] as any) || 0;
                    }
                }
            } else {
                ficha.lockedAtributos = defaultFichaTemplate.lockedAtributos;
            }
        }
        
        setFichas(loadedFichas);

        const savedFichaId = localStorage.getItem(RPG_CURRENT_FICHA_ID_KEY);
        if (savedFichaId && loadedFichas[savedFichaId]) {
            setCurrentFichaId(savedFichaId);
        } else {
            setCurrentFichaId(FICHA_MATRIZ_ID);
        }

        const savedGmMode = localStorage.getItem(RPG_GM_MODE_KEY);
        setIsGmMode(savedGmMode === 'true');

    }, []);

    const closePasswordRequest = useCallback(() => setPasswordRequest(null), []);

    const toggleGmMode = useCallback(() => {
        if (isGmMode) {
            setIsGmMode(false);
            localStorage.setItem(RPG_GM_MODE_KEY, 'false');
        } else {
            setPasswordRequest(() => () => {
                setIsGmMode(true);
                localStorage.setItem(RPG_GM_MODE_KEY, 'true');
            });
        }
    }, [isGmMode]);

    const updateGmAdjustment = useCallback((attr: keyof Ficha, adjustment: number) => {
        const current = fichas[currentFichaId];
        if (current) {
            const newAdjustments = { ...current.gmAdjustments, [attr]: adjustment };
            if (adjustment === 0) {
                 delete newAdjustments[attr];
            }
            updateFicha(currentFichaId, { gmAdjustments: newAdjustments });
        }
    }, [currentFichaId, fichas, updateFicha]);

    const switchFicha = useCallback((id: string) => {
        if (fichas[id]) {
            setCurrentFichaId(id);
            localStorage.setItem(RPG_CURRENT_FICHA_ID_KEY, id);
        }
    }, [fichas]);

    const createFicha = useCallback((nomeFicha: string) => {
        const id = `ficha_${Date.now()}`;
        const newFicha = createDefaultFicha(id, nomeFicha);
        const newFichas = { ...fichas, [id]: newFicha };
        setFichas(newFichas);
        saveFichasToStorage(newFichas);
        setJustCreatedFichaId(id);
        switchFicha(id);
    }, [fichas, saveFichasToStorage, switchFicha]);
    
    const renameFicha = useCallback((id: string, newName: string) => {
        if (id === FICHA_MATRIZ_ID) {
            alert("A ficha Matriz não pode ser renomeada.");
            return;
        }
        if (!newName.trim()) {
            alert("O nome da ficha não pode ser vazio.");
            return;
        }
        updateFicha(id, { nomeFicha: newName.trim() });
    }, [updateFicha]);

    const importFicha = useCallback((fichaData: Omit<Ficha, 'id'>) => {
        try {
            const id = `ficha_${Date.now()}`;
            const defaultFicha = createDefaultFicha(id, "");
            const newFicha = {
                ...defaultFicha,
                ...fichaData,
                id,
                nomeFicha: `${fichaData.nomeFicha || "Ficha"} (Importada)`
            };

            const newFichas = { ...fichas, [id]: newFicha };
            setFichas(newFichas);
            saveFichasToStorage(newFichas);
            switchFicha(id);
            alert(`Ficha "${newFicha.nomeFicha}" importada com sucesso!`);
        } catch (error) {
            console.error("Error importing ficha in hook:", error);
            alert("Ocorreu um erro interno ao adicionar a ficha importada.");
        }
    }, [fichas, saveFichasToStorage, switchFicha]);

    const generateNpc = useCallback((level: number, archetype: string) => {
        const id = `npc_${Date.now()}`;
        const nomeFicha = `NPC: ${archetype} Nvl ${level}`;
        let newFicha = createDefaultFicha(id, nomeFicha);
        newFicha.nomePersonagem = nomeFicha;

        const nivelInfo = nivelData[level] || nivelData[0];
        newFicha.nivel = nivelInfo.nivel;
        newFicha.experiencia = nivelInfo.xp;
        const totalPoints = nivelInfo.pd;
        newFicha.pontosHabilidadeTotais = totalPoints;
        newFicha.pontosVantagemTotais = nivelInfo.ph;

        const weights: Record<string, Record<keyof EditableAttributes, number>> = {
            Guerreiro: { forca: 5, constituicao: 4, destreza: 3, agilidade: 2, inteligencia: 1 },
            Mago: { inteligencia: 5, constituicao: 4, destreza: 2, agilidade: 2, forca: 1 },
            Ladino: { agilidade: 5, destreza: 4, inteligencia: 3, forca: 2, constituicao: 2 },
            Tanque: { constituicao: 5, forca: 4, destreza: 2, agilidade: 1, inteligencia: 1 },
            Equilibrado: { forca: 1, destreza: 1, agilidade: 1, constituicao: 1, inteligencia: 1 },
        };
        
        let currentArchetype = archetype;
        if (archetype === 'Aleatório') {
            const archetypes = Object.keys(weights).filter(a => a !== 'Equilibrado');
            currentArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];
        }
        
        const attrWeights = weights[currentArchetype as keyof typeof weights];
        const attributes: EditableAttributes = { forca: 0, destreza: 0, agilidade: 0, constituicao: 0, inteligencia: 0 };
        const attributeKeys: (keyof EditableAttributes)[] = ['forca', 'destreza', 'agilidade', 'constituicao', 'inteligencia'];

        for (let i = 0; i < totalPoints; i++) {
            const desirabilityScores: Record<keyof EditableAttributes, number> = { forca: 0, destreza: 0, agilidade: 0, constituicao: 0, inteligencia: 0 };
            
            attributeKeys.forEach(attr => {
                let score = attrWeights[attr] * 10;
                const currentValue = attributes[attr];

                if (attr === 'forca' && ((currentValue + 1) % 5 === 0 || (currentValue + 1) % 10 === 0)) score *= 1.5;
                if (attr === 'destreza' && ((currentValue + 1) % 3 === 0 || (currentValue + 1) % 5 === 0)) score *= 1.5;
                if (attr === 'agilidade' && ((currentValue + 1) % 3 === 0 || (currentValue + 1) % 5 === 0 || (currentValue + 1) % 10 === 0)) score *= 1.5;
                if (attr === 'inteligencia' && ((currentValue + 1) % 5 === 0 || (currentValue + 1) % 10 === 0)) score *= 1.5;

                desirabilityScores[attr] = score;
            });
            
            const totalScore = attributeKeys.reduce((sum, attr) => sum + desirabilityScores[attr], 0);
            let random = Math.random() * totalScore;
            
            let chosenAttr: keyof EditableAttributes = 'forca';
            for (const attr of attributeKeys) {
                if (random < desirabilityScores[attr]) {
                    chosenAttr = attr;
                    break;
                }
                random -= desirabilityScores[attr];
            }
            attributes[chosenAttr]++;
        }
        newFicha = { ...newFicha, ...attributes };

        let pontosVantagem = newFicha.pontosVantagemTotais;
        const numDesvantagens = Math.floor(Math.random() * 3) + 1;
        const availableDesvantagens = [...desvantagensData];
        for (let i = 0; i < numDesvantagens && availableDesvantagens.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableDesvantagens.length);
            const chosen = availableDesvantagens.splice(randomIndex, 1)[0];
            newFicha.desvantagens.push(chosen.nome);
            pontosVantagem += chosen.ganho;
        }

        const affordableRaces = racasData.filter(r => r.custo <= pontosVantagem);
        if (affordableRaces.length > 0) {
            const chosenRace = affordableRaces[Math.floor(Math.random() * affordableRaces.length)];
            newFicha.racaSelecionada = chosenRace.nome;
            pontosVantagem -= chosenRace.custo;
        }
        
        const availableVantagens = [...vantagensData].filter(v => v.restricao !== 'inicio');
        availableVantagens.sort(() => 0.5 - Math.random()); 

        while (pontosVantagem > 0 && availableVantagens.length > 0) {
            let advantageToPick = availableVantagens.find(v => v.custo <= pontosVantagem);
            if (advantageToPick) {
                newFicha.vantagens.push(advantageToPick.nome);
                pontosVantagem -= advantageToPick.custo;
                availableVantagens.splice(availableVantagens.indexOf(advantageToPick), 1);
            } else {
                break; 
            }
        }
        
        if (currentArchetype === 'Guerreiro' || currentArchetype === 'Tanque') {
            newFicha.armaDireitaNome = "Espada Longa";
            newFicha.armaDireitaAtaque = 5;
            if (currentArchetype === 'Tanque') newFicha.armaEsquerdaNome = "Escudo de Madeira";
        } else if (currentArchetype === 'Mago') {
            newFicha.armaDireitaNome = "Cajado de Aprendiz";
            newFicha.armaDireitaAtaqueMagico = 5;
        } else if (currentArchetype === 'Ladino') {
            newFicha.armaDireitaNome = "Adaga Afiada";
            newFicha.armaDireitaAtaque = 3;
        }

        const utilityItems = [
            { item: 'Corda (15m)', peso: 1.5 },
            { item: 'Tochas (5)', peso: 1.0 },
            { item: 'Ração de viagem (3 dias)', peso: 1.5 },
            { item: 'Cantil de água', peso: 1.0 },
            { item: 'Pederneira', peso: 0.1 },
            { item: 'Mapa simples da região', peso: 0.1 },
            { item: 'Bolsa com 1d6 moedas', peso: 0.2 },
        ];
        
        newFicha.inventario = []; 
        const numItems = Math.floor(Math.random() * 3) + 2;
        const shuffledItems = utilityItems.sort(() => 0.5 - Math.random());
        for (let i = 0; i < numItems && i < shuffledItems.length; i++) {
            newFicha.inventario.push(shuffledItems[i]);
        }
        
        let finalFicha = calcularAtributos(newFicha);
        finalFicha.vidaAtual = finalFicha.vidaTotal;
        finalFicha.magiaAtual = finalFicha.magiaTotal;
        finalFicha.vigorAtual = finalFicha.vigorTotal;

        const newFichas = { ...fichas, [id]: finalFicha };
        setFichas(newFichas);
        saveFichasToStorage(newFichas);
        switchFicha(id);

    }, [fichas, saveFichasToStorage, switchFicha]);


    const deleteFicha = useCallback(() => {
        if (currentFichaId === FICHA_MATRIZ_ID) {
            alert("A ficha matriz não pode ser excluída!");
            return;
        }

        const newFichas = { ...fichas };
        delete newFichas[currentFichaId];
        
        setFichas(newFichas);
        saveFichasToStorage(newFichas);
        setCurrentFichaId(FICHA_MATRIZ_ID);
        localStorage.setItem(RPG_CURRENT_FICHA_ID_KEY, FICHA_MATRIZ_ID);

    }, [currentFichaId, fichas, saveFichasToStorage]);

    const resetPontos = useCallback(() => {
        setPasswordRequest(() => () => {
             updateFicha(currentFichaId, { 
                forca: 0, destreza: 0, agilidade: 0, constituicao: 0, inteligencia: 0,
                lockedAtributos: { forca: 0, destreza: 0, agilidade: 0, constituicao: 0, inteligencia: 0 }
            });
        });
    }, [currentFichaId, updateFicha]);

    const recomecarFicha = useCallback(() => {
         setPasswordRequest(() => () => {
            const current = fichas[currentFichaId];
            if(current) {
                const newFicha = createDefaultFicha(current.id, current.nomeFicha);
                setFichas(prev => {
                    const updated = {...prev, [current.id]: newFicha};
                    saveFichasToStorage(updated);
                    return updated;
                });
            }
        });
    }, [currentFichaId, fichas, saveFichasToStorage]);

    const excludeItems = useCallback((itemsToRemove: { vantagens: string[], desvantagens: string[], removeRaca: boolean, removeClasse: boolean }) => {
        const current = fichas[currentFichaId];
        if (current) {
            const newVantagens = current.vantagens.filter(v => !itemsToRemove.vantagens.includes(v));
            const newDesvantagens = current.desvantagens.filter(d => !itemsToRemove.desvantagens.includes(d));
            const newRaca = itemsToRemove.removeRaca ? null : current.racaSelecionada;
            const newClasse = itemsToRemove.removeClasse ? null : current.classeSelecionada;
            
            updateFicha(currentFichaId, { 
                vantagens: newVantagens, 
                desvantagens: newDesvantagens,
                racaSelecionada: newRaca,
                classeSelecionada: newClasse
            });
        }
    }, [currentFichaId, fichas, updateFicha]);

     const resetAesthetics = useCallback(() => {
        const defaults = createDefaultFicha('', '');
        updateFicha(currentFichaId, {
            theme: defaults.theme,
            darkMode: false, 
            backgroundColor: defaults.backgroundColor,
            sheetBackgroundColor: defaults.sheetBackgroundColor,
            componentBackgroundColor: defaults.componentBackgroundColor,
            fontFamily: defaults.fontFamily,
            sheetOpacity: defaults.sheetOpacity,
            shadowColor: defaults.shadowColor,
            shadowIntensity: defaults.shadowIntensity,
            backgroundImage: defaults.backgroundImage,
            backgroundSize: defaults.backgroundSize,
            borderColor: defaults.borderColor,
            borderStyle: defaults.borderStyle,
            borderWidth: defaults.borderWidth,
            diceColor: defaults.diceColor,
            diceNumberColor: defaults.diceNumberColor,
            diceTexture: defaults.diceTexture,
            diceAnimation: defaults.diceAnimation,
            textColor: defaults.textColor,
            accentColor: defaults.accentColor,
        });
    }, [currentFichaId, updateFicha]);

    const resetClasseNotification = useCallback(() => {
        if(fichas[currentFichaId]?.showClasseSkillsNotification) {
            updateFicha(currentFichaId, { showClasseSkillsNotification: false });
        }
      }, [fichas, currentFichaId, updateFicha]);
    
    const rollDice = useCallback((max: number) => {
        const result = Math.floor(Math.random() * max) + 1;
        let bonus = 0;
        let attributeValue = 0;
        let attributeName: string | undefined = undefined;

        if (selectedAttribute && fichas[currentFichaId]) {
            const ficha = fichas[currentFichaId];
            const attrKey = selectedAttribute as keyof Ficha;
            if (typeof ficha[attrKey] === 'number') {
                attributeValue = ficha[attrKey] as number;
                bonus = attributeValue;
                attributeName = selectedAttribute;
            }
            setSelectedAttribute(null);
        }

        const newRoll: DiceRoll = {
            id: `roll_${Date.now()}`,
            type: `d${max}`,
            result,
            bonus,
            total: result + bonus,
            attribute: attributeName,
            timestamp: new Date().toLocaleTimeString(),
        };
        setDiceHistory(prev => [newRoll, ...prev].slice(0, 50));
        return newRoll;

    }, [selectedAttribute, fichas, currentFichaId]);

    const clearDiceHistory = useCallback(() => setDiceHistory([]), []);

    const getPontosVantagem = useCallback(() => {
        const ficha = fichas[currentFichaId];
        if (!ficha) return 0;

        let phBase = ficha.pontosVantagemTotais;
        
        ficha.vantagens.forEach(vNome => {
            const vantagem = vantagensData.find(d => d.nome === vNome);
            if (vantagem) phBase -= vantagem.custo;
        });
        ficha.desvantagens.forEach(dNome => {
            const desvantagem = desvantagensData.find(d => d.nome === dNome);
            if (desvantagem) phBase += desvantagem.ganho;
        });
        if (ficha.racaSelecionada) {
            const raca = racasData.find(r => r.nome === ficha.racaSelecionada);
            if (raca) phBase -= raca.custo;
        }
        if (ficha.classeSelecionada) {
            const classe = classesData.find(c => c.nome === ficha.classeSelecionada);
            if (classe) {
                phBase -= classe.custo;
                if (ficha.habilidadesClasseCompradasComPV?.length > 0) {
                    ficha.habilidadesClasseCompradasComPV.forEach(nomeHabilidade => {
                        const habilidade = classe.habilidades.find(h => h.nome === nomeHabilidade);
                        if (habilidade) {
                            phBase -= habilidade.custoPVSemAlma;
                        }
                    });
                }
            }
        }

        return phBase;
    }, [fichas, currentFichaId]);

    return {
        fichas,
        currentFicha: fichas[currentFichaId],
        currentFichaId,
        switchFicha,
        updateFicha,
        createFicha,
        renameFicha,
        deleteFicha,
        importFicha,
        generateNpc,
        resetPontos,
        recomecarFicha,
        resetAesthetics,
        calcularAtributos: (ficha: Ficha) => updateFicha(ficha.id, {}),
        diceHistory,
        rollDice,
        clearDiceHistory,
        selectedAttribute,
        setSelectedAttribute,
        getPontosVantagem,
        passwordRequest,
        setPasswordRequest,
        closePasswordRequest,
        excludeItems,
        isGmMode,
        toggleGmMode,
        updateGmAdjustment,
        levelUpEffect,
        resetClasseNotification,
        justCreatedFichaId,
        setJustCreatedFichaId,
    };
};