
export interface Ficha {
    id: string;
    nomeFicha: string;
    nomePersonagem: string;
    descricaoPersonagem: string;

    forca: number;
    destreza: number;
    agilidade: number;
    constituicao: number;
    inteligencia: number;

    ataque: number;
    ataqueMagico: number;
    acerto: number;
    esquiva: number;
    rdf: number;
    rdm: number;

    vidaTotal: number;
    vidaAtual: number;
    magiaTotal: number;
    magiaAtual: number;
    vigorTotal: number;
    vigorAtual: number;

    regeneracaoVida: number;
    regeneracaoMagia: number;
    regeneracaoVigor: number;

    armaDireitaNome: string;
    armaDireitaAtaque: number;
    armaDireitaAtaqueMagico: number;
    armaEsquerdaNome: string;
    armaEsquerdaAtaque: number;
    armaEsquerdaAtaqueMagico: number;

    inventario: InventarioItem[];
    pesoTotal: number;
    capacidadeCarga: number;

    magiasHabilidades: Magia[];
    vantagens: string[];
    desvantagens: string[];
    racaSelecionada: string | null;

    velocidadeCorrida: number;
    alturaPulo: number;
    distanciaPulo: number;

    experiencia: number;
    lockedExperiencia: number;
    nivel: number;
    pontosHabilidadeTotais: number;
    pontosHabilidadeDisponiveis: number;
    pontosVantagemTotais: number;
    
    classeNome: string;
    classeDescricao: string;

    anotacoes: string;
    lockedAtributos: {
        forca: number;
        destreza: number;
        agilidade: number;
        constituicao: number;
        inteligencia: number;
    };
    
    gmAdjustments?: Partial<Record<keyof Ficha, number>>;

    // Aesthetic properties
    theme: string;
    darkMode: boolean;
    backgroundColor: string | null;
    sheetBackgroundColor: string | null;
    fontFamily: string;
    sheetOpacity: number;
    shadowColor: string;
    shadowIntensity: number;
    backgroundImage: string | null;
    backgroundSize: 'cover' | '100% 100%' | 'auto';
    borderColor: string;
    borderStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge';
    borderWidth: number;
    diceColor: string | null;
    diceNumberColor: string | null;
    diceTexture: string | null;
    diceAnimation: 'padrao' | 'rapido' | 'salto';
}

export interface InventarioItem {
    item: string;
    peso: number;
}

export interface Magia {
    nome: string;
    custo: number;
    custoVigor: number;
    dano: string;
    tipo: string;
}

export interface Vantagem {
    nome: string;
    custo: number;
    descricao: string;
    restricao?: string;
}

export interface Desvantagem {
    nome: string;
    ganho: number;
    descricao: string;
}

export interface Raca {
    nome: string;
    custo: number;
    descricao: string;
    vantagens: string[];
}

export interface NivelInfo {
    nivel: number;
    xp: number;
    pd: number;
    ph: number;
}

export interface DiceRoll {
    id: string;
    type: string;
    result: number;
    bonus: number;
    total: number;
    attribute?: string;
    timestamp: string;
}
