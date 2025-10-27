import { useState, useEffect, useCallback } from 'react';
import type { Ficha, DiceRoll } from '../types';
import { FICHA_MATRIZ_ID, RGP_FICHAS_KEY, RPG_CURRENT_FICHA_ID_KEY, nivelData, vantagensData, desvantagensData, racasData } from '../constants';
import { calcularAtributos } from '../utils/calculations';
import { generateNpcData } from '../utils/generator';

const safeLocalStorage = {
    getItem: (key: string): string | null => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(key);
            }
        } catch (e) {
            console.warn(`Could not read from localStorage for key "${key}":`, e);
        }
        return null;
    },
    setItem: (key: string, value: string): void => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(key, value);
            }
        } catch (e) {
            console.warn(`Could not write to localStorage for key "${key}":`, e);
        }
    },
};

const RPG_GM_MODE_KEY = 'rpgGmMode';

export const createDefaultFicha = (id: string, nomeFicha: string): Ficha => ({
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
    inventario: Array.from({ length: 5 }, () => ({ item: '', peso: 0 })),
    pesoTotal: 0, capacidadeCarga: 5,
    magiasHabilidades: Array.from({ length: 3 }, () => ({ nome: '', custo: 0, custoVigor: 0, dano: '', tipo: '' })),
    vantagens: [], desvantagens: [], racaSelecionada: null,
    velocidadeCorrida: 25, alturaPulo: 1, distanciaPulo: 3,
    experiencia: 0,
    lockedExperiencia: 0,
    nivel: 0, pontosHabilidadeTotais: 25, pontosHabilidadeDisponiveis: 25, pontosVantagemTotais: 8,
    classeNome: '',
    classeDescricao: '',
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

export const useCharacterSheet = (onLevelUp?: () => void) => {
    const [fichas, setFichas] = useState<Record<string, Ficha>>({});
    const [currentFichaId, setCurrentFichaId] = useState<string>(FICHA_MATRIZ_ID);
    const [diceHistory, setDiceHistory] = useState<DiceRoll[]>([]);
    const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
    const [passwordRequest, setPasswordRequest] = useState<(() => void) | null>(null);
    const [isGmMode, setIsGmMode] = useState(false);

    const saveFichasToStorage = useCallback((fichasToSave: Record<string, Ficha>) => {
        safeLocalStorage.setItem(RGP_FICHAS_KEY, JSON.stringify(fichasToSave));
    }, []);

     const updateFicha = useCallback((id: string, updatedFichaData: Partial<Ficha>) => {
        setFichas(prevFichas => {
            const oldFicha = prevFichas[id];
            if (!oldFicha) return prevFichas;
            
            const oldLevel = oldFicha.nivel;

            let newFicha = { ...oldFicha, ...updatedFichaData };
            
            const nivelInfo = [...nivelData].reverse().find(data => newFicha.experiencia >= data.xp) || nivelData[0];
            newFicha.nivel = nivelInfo.nivel;
            newFicha.pontosHabilidadeTotais = nivelInfo.pd + (newFicha.gmAdjustments?.pontosHabilidadeTotais || 0);
            newFicha.pontosVantagemTotais = nivelInfo.ph + (newFicha.gmAdjustments?.pontosVantagemTotais || 0);
            
            newFicha.pesoTotal = newFicha.inventario.reduce((sum, item) => sum + (item.peso || 0), 0);
            
            const finalFicha = calcularAtributos(newFicha);
            
            if (finalFicha.nivel > oldLevel && onLevelUp) {
                onLevelUp();
            }

            const updatedFichas = { ...prevFichas, [id]: finalFicha };
            saveFichasToStorage(updatedFichas);
            return updatedFichas;
        });
    }, [saveFichasToStorage, onLevelUp]);

    useEffect(() => {
        let loadedFichas: Record<string, Ficha> = {};
        
        const fichasJSON = safeLocalStorage.getItem(RGP_FICHAS_KEY);
        if (fichasJSON) {
            try {
                const parsedData = JSON.parse(fichasJSON);
                if (typeof parsedData === 'object' && parsedData !== null && !Array.isArray(parsedData)) {
                    loadedFichas = parsedData;
                } else {
                    console.warn('Corrupted data in localStorage, initializing.');
                }
            } catch (error) {
                 console.error("Failed to parse fichas from storage. Data will be reset.", error);
                 loadedFichas = {};
            }
        }
        const savedFichaId = safeLocalStorage.getItem(RPG_CURRENT_FICHA_ID_KEY);
        const savedGmMode = safeLocalStorage.getItem(RPG_GM_MODE_KEY);


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

        if (savedFichaId && loadedFichas[savedFichaId]) {
            setCurrentFichaId(savedFichaId);
        } else {
            setCurrentFichaId(FICHA_MATRIZ_ID);
        }

        setIsGmMode(savedGmMode === 'true');

    }, []);

    const closePasswordRequest = useCallback(() => setPasswordRequest(null), []);

    const toggleGmMode = useCallback(() => {
        if (isGmMode) {
            setIsGmMode(false);
            safeLocalStorage.setItem(RPG_GM_MODE_KEY, 'false');
        } else {
            setPasswordRequest(() => () => {
                setIsGmMode(true);
                safeLocalStorage.setItem(RPG_GM_MODE_KEY, 'true');
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
            safeLocalStorage.setItem(RPG_CURRENT_FICHA_ID_KEY, id);
        }
    }, [fichas]);

    const createFicha = useCallback((nomeFicha: string) => {
        const id = `ficha_${Date.now()}`;
        const newFicha = createDefaultFicha(id, nomeFicha);
        const newFichas = { ...fichas, [id]: newFicha };
        setFichas(newFichas);
        saveFichasToStorage(newFichas);
        switchFicha(id);
    }, [fichas, saveFichasToStorage, switchFicha]);

    const createCustomFicha = useCallback((nomeFicha: string, customData: Partial<Ficha>) => {
        const id = `ficha_${Date.now()}`;
        const newFichaTemplate = createDefaultFicha(id, nomeFicha);
        
        const nivelInfo = nivelData.find(n => n.nivel === customData.nivel) || nivelData[0];
        const baseData = {
            ...newFichaTemplate,
            pontosHabilidadeTotais: nivelInfo.pd,
            pontosVantagemTotais: nivelInfo.ph,
            vidaAtual: 0, 
            magiaAtual: 0,
            vigorAtual: 0,
        };

        const newFicha = { ...baseData, ...customData };
        
        const finalFichaWithCalculations = calcularAtributos(newFicha);
        
        finalFichaWithCalculations.vidaAtual = finalFichaWithCalculations.vidaTotal;
        finalFichaWithCalculations.magiaAtual = finalFichaWithCalculations.magiaTotal;
        finalFichaWithCalculations.vigorAtual = finalFichaWithCalculations.vigorTotal;

        const finalFicha = calcularAtributos(finalFichaWithCalculations);

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
        safeLocalStorage.setItem(RPG_CURRENT_FICHA_ID_KEY, FICHA_MATRIZ_ID);

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

    const excludeItems = useCallback((itemsToRemove: { vantagens: string[], desvantagens: string[], removeRaca: boolean }) => {
        const current = fichas[currentFichaId];
        if (current) {
            const newVantagens = current.vantagens.filter(v => !itemsToRemove.vantagens.includes(v));
            const newDesvantagens = current.desvantagens.filter(d => !itemsToRemove.desvantagens.includes(d));
            const newRaca = itemsToRemove.removeRaca ? null : current.racaSelecionada;
            
            updateFicha(currentFichaId, { 
                vantagens: newVantagens, 
                desvantagens: newDesvantagens,
                racaSelecionada: newRaca
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

        return phBase;
    }, [fichas, currentFichaId]);

    return {
        fichas,
        currentFicha: fichas[currentFichaId],
        currentFichaId,
        switchFicha,
        updateFicha,
        createFicha,
        createCustomFicha,
        deleteFicha,
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
    };
};
