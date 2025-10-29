
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';

// ==========================================================================================
// Conteúdo de: types.ts
// ==========================================================================================

interface Ficha {
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
    
    classeSelecionada: string | null;
    habilidadesClasseAdquiridas: string[];
    habilidadesClasseCompradasComPV: string[];
    almasTotais: number;
    almasGastas: number;
    showClasseSkillsNotification: boolean;


    anotacoes: string;
    lockedAtributos: {
        forca: number;
        destreza: number;
        agilidade: number;
        constituicao: number;
        inteligencia: number;
    };
    
    gmAdjustments?: Partial<Record<keyof Ficha, number>>;

    // Character Image
    characterImage: string | null;

    // Aesthetic properties
    theme: string;
    darkMode: boolean;
    backgroundColor: string | null;
    sheetBackgroundColor: string | null;
    componentBackgroundColor: string | null;
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
    textColor: string | null;
    accentColor: string | null;
}

interface InventarioItem {
    item: string;
    peso: number;
}

interface Magia {
    nome: string;
    custo: number;
    custoVigor: number;
    dano: string;
    tipo: string;
    isClassSkill?: boolean;
}

interface Vantagem {
    nome: string;
    custo: number;
    descricao: string;
    restricao?: string;
}

interface Desvantagem {
    nome: string;
    ganho: number;
    descricao: string;
}

interface Raca {
    nome: string;
    custo: number;
    descricao: string;
    vantagens: string[];
}

interface ClasseHabilidade {
    nome: string;
    nivel: number;
    tipo: 'ataque' | 'defesa' | 'passiva';
    descricao: string;
    dano?: string;
    custoMagia?: number;
    custoVigor?: number;
    efeito?: { 
        atributo: keyof Ficha; 
        valor: number;
    };
    custoPVSemAlma: number;
}

interface Classe {
    nome: string;
    custo: number; // Custo em Pontos de Vantagem para adquirir a classe
    descricao: string;
    habilidades: ClasseHabilidade[];
}


interface NivelInfo {
    nivel: number;
    xp: number;
    pd: number;
    ph: number;
}

interface DiceRoll {
    id: string;
    type: string;
    result: number;
    bonus: number;
    total: number;
    attribute?: string;
    timestamp: string;
}

// ==========================================================================================
// Conteúdo de: constants.ts
// ==========================================================================================

const FICHA_MATRIZ_ID = "ficha-matriz";
const RGP_FICHAS_KEY = 'rpgFichasMobile';
const RPG_CURRENT_FICHA_ID_KEY = 'rpgCurrentFichaIdMobile';

const vantagensData: Vantagem[] = [
    { nome: "Maestria com Armas curtas (2)", custo: 2, descricao: "+1 em ataque, +1 em acerto com armas curtas." },
    { nome: "Maestria com armas pesadas (2)", custo: 2, descricao: "+2 em ataque com armas pesadas." },
    { nome: "Maestria com armas de longo alcance (2)", custo: 2, descricao: "+2 em acerto com armas de longo alcance." },
    { nome: "Furtar (2)", custo: 2, descricao: "+4 em testes de furto." },
    { nome: "Lábia (2)", custo: 2, descricao: "+5 em testes de lábia." },
    { nome: "Velejar (1)", custo: 1, descricao: "" },
    { nome: "Beleza (1)", custo: 1, descricao: "+3 o teste em lábia, paquera e persuasão." },
    { nome: "Boa Fama (2)", custo: 2, descricao: "+4 chance de descontos em armamentos, pousadas, alimentos, etc." },
    { nome: "Arremedo (2)", custo: 2, descricao: "Capacidade de imitar qualquer som SIMPLES." },
    { nome: "Destemor (1)", custo: 1, descricao: "Dificilmente é assustado por algo." },
    { nome: "Empatia (3)", custo: 3, descricao: "Sensibilidade extraordinária em relação aos outras pessoas." },
    { nome: "Empatia com animais (1)", custo: 1, descricao: "Pode compreender as motivações dos animais." },
    { nome: "Patrono (4)", custo: 4, descricao: "Possui um mentor/mestre/organização que pode lhe oferecer ajuda." },
    { nome: "Reconhecimento Social (2)", custo: 2, descricao: "Membro de um grupo respeitado. +2 teste em lábia, paquera e persuasão." },
    { nome: "Riqueza (2)", custo: 2, descricao: "Inicia com 20 moedas de ouro." },
    { nome: "Aptidão para magia (4)", custo: 4, descricao: "+15% dano e -15% custo de magia para a magia que tem aptidão." },
    { nome: "Combo Físico (4)", custo: 4, descricao: "Inicia com 50km/h velocidade, pulo de 3m altura e 9m distância.", restricao: "inicio" },
    { nome: "Nadar (1)", custo: 1, descricao: "" },
    { nome: "Escalar (2)", custo: 2, descricao: "" },
    { nome: "Segunda língua (1)", custo: 1, descricao: "Fala mais um idioma." },
    { nome: "Paquerador (2)", custo: 2, descricao: "+4 em teste para paquera e persuasão envolvendo flerte." },
    { nome: "Senso de perigo (5)", custo: 5, descricao: "Quando algo grave ocorrer o mestre pedirá pra você jogar um dado para reagir." },
    { nome: "Acrobata (3)", custo: 3, descricao: "+ fama ao lutar em público." },
    { nome: "Equilíbrio Perfeito (3)", custo: 3, descricao: "+8 em testes de equilíbrio." },
    { nome: "Tecnologia (2)", custo: 2, descricao: "Engenhoso, pode inventar coisas, criar objetos improvisados." },
    { nome: "Poder Oculto (7)", custo: 7, descricao: "Com 10% vida, ativa +50% em todos atributos." },
    { nome: "Sobrevivência em floresta (2)", custo: 2, descricao: "Facilidade para achar comida, gravar caminhos, etc." }
];

const desvantagensData: Desvantagem[] = [
    { nome: "Fobia (+2)", ganho: 2, descricao: "Medo irracional de algo específico." },
    { nome: "Má Fama (+2)", ganho: 2, descricao: "Mal visto pela sociedade, dificultando interações sociais." },
    { nome: "Alcoolismo (+2)", ganho: 2, descricao: "Dependência de álcool que afeta suas decisões." },
    { nome: "Altruísmo (+2)", ganho: 2, descricao: "Se sacrifica por outras pessoas, pouco se importa com fama ou riqueza." },
    { nome: "Avareza (+2)", ganho: 2, descricao: "Preocupação permanente na conservação de riquezas." },
    { nome: "Bullying (+3)", ganho: 3, descricao: "Gosta de caçoar, agredir, difamar e apontar defeitos." },
    { nome: "Circunspeção (+2)", ganho: 2, descricao: "Não entende piadas, entende tudo literal." },
    { nome: "Compulsões (+3)", ganho: 3, descricao: "Hábito ou vício que toma boa parte dos seus recursos e tempo." },
    { nome: "Covardia (+2)", ganho: 2, descricao: "Extremo cuidado com bem-estar físico e dificuldade em assumir riscos." },
    { nome: "Dependentes (+4)", ganho: 4, descricao: "Alguém depende de você a todo momento." },
    { nome: "Fúria (+2)", ganho: 2, descricao: "Tendência a perder o controle e atacar freneticamente." },
    { nome: "Honestidade (+3)", ganho: 3, descricao: "Não consegue mentir ou omitir, sempre fala a verdade." },
    { nome: "Impulsividade (+2)", ganho: 2, descricao: "Sempre age sem pensar." },
    { nome: "Luxúria (+2)", ganho: 2, descricao: "Desejo incontrolável por romance." },
    { nome: "Magnetismo Sobrenatural (+2)", ganho: 2, descricao: "Coisas estranhas acontecem com seu personagem." },
    { nome: "No Limite (+4)", ganho: 4, descricao: "Assume riscos extremamente irracionais diante de perigo mortal." },
    { nome: "Teimosia (+1)", ganho: 1, descricao: "Quer sempre fazer as coisas do seu modo." },
    { nome: "Amnésia (+2)", ganho: 2, descricao: "Em certos momentos, não consegue lembrar de coisas importantes." }
];

const racasData: Raca[] = [
    { nome: "Humano (3)", custo: 3, descricao: "Versáteis, ambiciosos, mestres em adaptação.", vantagens: ["Explorador Nato: Cavalo superior, equipamentos, mapa.", "Mestre das Profissões: Escolha uma profissão com bônus.", "Rede de Influência: Aliado influente.", "Determinação Inabalável: Ignore uma desvantagem por um curto período."] },
    { nome: "Elfo (4)", custo: 4, descricao: "Sábios, mágicos, conectados à natureza.", vantagens: ["Sabedoria Ancestral: Domina uma área, aprende 1 língua extra.", "Visão Élfica Suprema: Enxerga no escuro, detecta magias fracas.", "Escudo Mágico: Resistência a um tipo de efeito mágico."] },
    { nome: "Anão (4)", custo: 4, descricao: "Resilientes, habilidosos, ligados à terra.", vantagens: ["Fortitude Indomável: Trabalha 3 dias sem descanso, recupera-se 2x mais rápido.", "Artesão: Escolha uma especialidade de criação com bônus.", "Senhor das Profundezas: Nunca se perde no subterrâneo."] },
    { nome: "Orc (3)", custo: 3, descricao: "Guerreiros ferozes, líderes pela força.", vantagens: ["Lenda entre Guerreiros: Inspira temor/respeito.", "Resiliência Brutal: Luta sem penalidades com ferimentos graves.", "Domínio da Intimidação: Força inimigos a render/recuar.", "Fúria Ancestral: Fúria 2x/dia (dobra força/resistência)."] },
    { nome: "Meio Animal (Selvagem) (4)", custo: 4, descricao: "Instinto primal com astúcia.", vantagens: ["Sentidos Predatórios: Escolha um sentido aguçado.", "Senhor dos Terrenos: Adapta-se a 1 ambiente.", "Frenesi Instintivo: 1x/dia, velocidade e ataques extras."] }
];

const classesData: Classe[] = [
    {
        nome: "Guerreiro",
        custo: 5,
        descricao: "Mestres do combate corporal, os guerreiros confiam em sua força, habilidade com armas e resistência para superar seus inimigos no campo de batalha.",
        habilidades: [
            // Nível 1
            { nome: "Golpe Preciso", nivel: 1, tipo: 'ataque', descricao: "Você se concentra em acertar o ponto mais vulnerável possível do oponente. Cooldown: 2 turnos.", dano: "15 + 1d20 + 1d6", custoMagia: 0, custoVigor: 2, custoPVSemAlma: 3 },
            { nome: "Braços de escudo", nivel: 1, tipo: 'defesa', descricao: "Você levanta a guarda recebendo o golpe nos braços amenizando o dano. Cooldown: 1 turno.", dano: "+12 RDF", custoMagia: 0, custoVigor: 2, custoPVSemAlma: 3 },
            { nome: "Saúde de um Cavalo", nivel: 1, tipo: 'passiva', descricao: "Habilidade passiva que concede +25 de Vida permanentemente.", dano: "+25 Vida Total", efeito: { atributo: 'vidaTotal', valor: 25 }, custoPVSemAlma: 5 },
            // Nível 5
            { nome: "Combo espada e escudo", nivel: 5, tipo: 'ataque', descricao: "Requer espada e escudo. Um corte rápido seguido por uma pancada com o escudo. Cooldown: 2 turnos.", dano: "Espada: 20 + Atq. Físico + 1d20 / Escudo: 5 + Atq. Físico + 1d20", custoMagia: 0, custoVigor: 4, custoPVSemAlma: 5 },
            { nome: "Muralha de escudo", nivel: 5, tipo: 'defesa', descricao: "Requer escudo. Aumenta drasticamente sua defesa por 3 turnos, mas causa fadiga. Efeito Negativo: -15 de ataque por 1 turno após o efeito.", dano: "+20 RDF + RDF do escudo", custoMagia: 0, custoVigor: 3, custoPVSemAlma: 5 },
            { nome: "Folego instantâneo", nivel: 5, tipo: 'passiva', descricao: "Recupera 1d12 de vigor quando seu vigor chega a zero. Usável 1 vez por batalha.", dano: "Recupera 1d12 Vigor", custoPVSemAlma: 7 },
            // Nível 10
            { nome: "Golpes Múltiplos", nivel: 10, tipo: 'ataque', descricao: "Ataque 3 vezes no mesmo turno com redutores de acerto (-2 no segundo, -5 no terceiro). Cooldown: 4 turnos.", dano: "3x (Ataque + 1d20)", custoMagia: 0, custoVigor: 9, custoPVSemAlma: 7 },
            { nome: "Pele de pedra", nivel: 10, tipo: 'defesa', descricao: "A adrenalina endurece seus músculos. Dura 3 turnos, Casting Time de 1 turno. Cooldown: 4 turnos. Efeito Negativo: +15% de dano sofrido por 2 turnos após o efeito.", dano: "+3d20 RDF, +2 RDM", custoMagia: 0, custoVigor: 9, custoPVSemAlma: 7 },
            { nome: "Grito de guerra", nivel: 10, tipo: 'passiva', descricao: "Buffa até dois aliados aleatórios com +10 de ataque, +2 de acerto e +2 de esquiva por 2 turnos. 1 vez por batalha.", dano: "Buff em 2 aliados", custoPVSemAlma: 9 },
            // Nível 15
            { nome: "Corte Pulverizador", nivel: 15, tipo: 'ataque', descricao: "Corte de longo alcance que atinge até 3 oponentes e causa sangramento. Cooldown: 4 turnos. Efeito Negativo: 1 turno de fadiga sem ação.", dano: "50 + 3d20 + sangramento (1d12 por 1d6 turnos)", custoMagia: 0, custoVigor: 15, custoPVSemAlma: 9 },
            { nome: "Dança da lâmina", nivel: 15, tipo: 'ataque', descricao: "Um contra-ataque que exige que você receba o golpe do inimigo. Cooldown: 4 turnos.", dano: "Ataque + 1d20 (no turno do oponente)", custoMagia: 0, custoVigor: 8, custoPVSemAlma: 9 },
            { nome: "Senso de perigo", nivel: 15, tipo: 'passiva', descricao: "Passivamente sente quando um oponente é significativamente mais forte (5+ níveis acima).", custoPVSemAlma: 11 },
            // Nível 20
            { nome: "Conjuração de espadas", nivel: 20, tipo: 'ataque', descricao: "Invoca duas espadas flutuantes que atacam com você por 1d6 turnos. Casting Time: 1 turno. Cooldown: 5 turnos.", dano: "3 ataques/turno (50% acerto, dano de Ataque Físico)", custoMagia: 100, custoVigor: 18, custoPVSemAlma: 11 },
            { nome: "Conjurador de escudo", nivel: 20, tipo: 'defesa', descricao: "Conjura um escudo gigante que anula dano bruto por 1 turno para até 4 aliados. Cooldown: 3 turnos.", dano: "Imunidade a dano bruto", custoMagia: 80, custoVigor: 12, custoPVSemAlma: 11 },
            { nome: "Magnetismo magico", nivel: 20, tipo: 'passiva', descricao: "Sua arma pessoal sempre retornará à sua mão se for derrubada (alcance de 1km).", custoPVSemAlma: 13 },
            // Nível 25
            { nome: "Conjuração temporária", nivel: 25, tipo: 'ataque', descricao: "Invoca uma espada poderosa por 3 turnos (+30 de ataque). Custo de 3 de vigor por ataque. Cooldown: 5 turnos.", dano: "+30 Ataque", custoMagia: 50, custoVigor: 0, custoPVSemAlma: 13 },
            { nome: "Quanto mais dor, mais forte", nivel: 25, tipo: 'defesa', descricao: "Por 4 turnos, ganha +10% do dano sofrido como bônus de ataque (acumulativo, reseta ao atacar). Custa 1 de vigor por dano recebido e 2 por ataque com bônus. Cooldown: 5 turnos.", dano: "Bônus de Ataque", custoMagia: 0, custoVigor: 0, custoPVSemAlma: 13 },
            { nome: "Visão de batalha", nivel: 25, tipo: 'passiva', descricao: "Uma vez por batalha, pode descobrir os pontos de ataque de um oponente.", custoPVSemAlma: 15 },
            // Nível 30
            { nome: "Furacão de lâminas", nivel: 30, tipo: 'ataque', descricao: "Ataque em área devastador (30m de diâmetro) que pode atingir aliados. Casting Time: 2 turnos, Duração: 2 turnos. Cooldown: 1x por batalha. Efeito Negativo: 2 turnos de tontura.", dano: "Ataque Físico + 100 + 4d20", custoMagia: 0, custoVigor: 25, custoPVSemAlma: 15 },
            { nome: "Imunidade a Dano fisico", nivel: 30, tipo: 'defesa', descricao: "Torna-se imune a dano físico por 2 turnos, contanto que o dano não seja o dobro da sua vida. Cooldown: 1x por dia. Efeito Negativo: +30% de dano sofrido por 2 turnos após o efeito.", dano: "Imunidade a dano físico", custoMagia: 0, custoVigor: 25, custoPVSemAlma: 15 },
            { nome: "Resistência natural", nivel: 30, tipo: 'passiva', descricao: "Passivamente aumenta sua Redução de Dano Físico em 10 pontos permanentemente.", dano: "+10 RDF", efeito: { atributo: 'rdf', valor: 10 }, custoPVSemAlma: 20 },
        ]
    },
     {
        nome: "Paladino",
        custo: 6,
        descricao: "Guerreiros sagrados que canalizam poder divino para proteger os inocentes e punir o mal, combinando habilidades marciais com magias de cura e proteção.",
        habilidades: [
            { nome: "Golpe Divino", nivel: 1, tipo: 'ataque', descricao: "Infunde sua arma com energia sagrada.", dano: "Ataque +3 de dano mágico.", custoMagia: 2, custoVigor: 1, custoPVSemAlma: 3 },
            { nome: "Bênção da Cura", nivel: 1, tipo: 'defesa', descricao: "Invoca uma luz curativa.", dano: "Cura 15 de Vida.", custoMagia: 3, custoVigor: 0, custoPVSemAlma: 4 },
            { nome: "Aura de Proteção", nivel: 1, tipo: 'passiva', descricao: "Uma aura divina te protege de danos mágicos. Bônus: RDM +2.", efeito: { atributo: 'rdm', valor: 2 }, custoPVSemAlma: 5 },
        ]
    },
];


const nivelData: NivelInfo[] = [
    { nivel: 0, xp: 0, pd: 25, ph: 8 }, { nivel: 1, xp: 10, pd: 31, ph: 9 }, { nivel: 2, xp: 30, pd: 37, ph: 10 },
    { nivel: 3, xp: 60, pd: 43, ph: 11 }, { nivel: 4, xp: 100, pd: 49, ph: 12 }, { nivel: 5, xp: 150, pd: 55, ph: 13 },
    { nivel: 6, xp: 210, pd: 61, ph: 14 }, { nivel: 7, xp: 280, pd: 67, ph: 15 }, { nivel: 8, xp: 360, pd: 73, ph: 16 },
    { nivel: 9, xp: 450, pd: 79, ph: 17 }, { nivel: 10, xp: 550, pd: 85, ph: 18 }, { nivel: 11, xp: 670, pd: 91, ph: 19 },
    { nivel: 12, xp: 810, pd: 97, ph: 20 }, { nivel: 13, xp: 970, pd: 103, ph: 21 }, { nivel: 14, xp: 1150, pd: 109, ph: 22 },
    { nivel: 15, xp: 1350, pd: 115, ph: 23 }, { nivel: 16, xp: 1570, pd: 121, ph: 24 }, { nivel: 17, xp: 1810, pd: 127, ph: 25 },
    { nivel: 18, xp: 2070, pd: 133, ph: 26 }, { nivel: 19, xp: 2350, pd: 139, ph: 27 }, { nivel: 20, xp: 2650, pd: 145, ph: 28 },
    { nivel: 21, xp: 2980, pd: 148, ph: 29 }, { nivel: 22, xp: 3340, pd: 151, ph: 30 }, { nivel: 23, xp: 3730, pd: 154, ph: 31 },
    { nivel: 24, xp: 4150, pd: 157, ph: 32 }, { nivel: 25, xp: 4600, pd: 160, ph: 33 }, { nivel: 26, xp: 5080, pd: 163, ph: 34 },
    { nivel: 27, xp: 5590, pd: 166, ph: 35 }, { nivel: 28, xp: 6130, pd: 169, ph: 36 }, { nivel: 29, xp: 8000, pd: 219, ph: 37 },
    { nivel: 30, xp: 10000, pd: 319, ph: 38 }
];

// ==========================================================================================
// Conteúdo de: utils/calculations.ts
// ==========================================================================================

const calcularAtributos = (ficha: Ficha): Ficha => {
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

    // Passive Class Skill Bonuses
    if (newFicha.classeSelecionada && newFicha.habilidadesClasseAdquiridas.length > 0) {
        const classe = classesData.find(c => c.nome === newFicha.classeSelecionada);
        if (classe) {
            newFicha.habilidadesClasseAdquiridas.forEach(nomeHabilidade => {
                const habilidade = classe.habilidades.find(h => h.nome === nomeHabilidade);
                if (habilidade?.efeito && habilidade.tipo === 'passiva') {
                    const { atributo, valor } = habilidade.efeito;
                    if (typeof newFicha[atributo] === 'number') {
                        // This is a type assertion to tell TypeScript it's safe
                        (newFicha as any)[atributo] += valor;
                    }
                }
            });
        }
    }


    // Skill Points
    const pdGastos = forca + destreza + agilidade + constituicao + inteligencia;
    newFicha.pontosHabilidadeDisponiveis = newFicha.pontosHabilidadeTotais - pdGastos;

    return newFicha;
};

// ==========================================================================================
// Conteúdo de: hooks/useDynamicStyles.ts
// ==========================================================================================

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

const useDynamicStyles = (ficha: Ficha | null) => {
    useEffect(() => {
        if (!ficha) return;

        const root = document.documentElement as HTMLElement;

        if (ficha.darkMode) {
            // Aplicar estilos do modo escuro, sobrepondo qualquer customização
            document.body.style.fontFamily = "'Inter', sans-serif";
            document.body.style.backgroundColor = '#121212';
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundAttachment = 'fixed';

            root.style.setProperty('--sheet-bg-color', 'rgba(20, 20, 20, 0.95)');
            root.style.setProperty('--section-bg-color', 'rgba(30, 30, 30, 0.9)');
            root.style.setProperty('--component-bg-color', '#2d2d2d');
            root.style.setProperty('--border-color', '#555');
            root.style.setProperty('--border-style', 'solid');
            root.style.setProperty('--border-width', `2px`);
            root.style.setProperty('--sheet-shadow', 'inset 0 0 10px 2px #000000');
            root.style.setProperty('--text-color', '#f1f1f1');
            root.style.setProperty('--accent-color', '#f59e0b');
        } else {
            // Aplicar o tema customizado pelo usuário (ou o padrão)
            document.body.style.fontFamily = ficha.fontFamily || "'Inter', sans-serif";
            document.body.style.backgroundColor = ficha.backgroundColor || '#f0e6d2';
            if (ficha.backgroundImage) {
                document.body.style.backgroundImage = `url(${ficha.backgroundImage})`;
                document.body.style.backgroundSize = ficha.backgroundSize || 'cover';
                document.body.style.backgroundAttachment = ficha.backgroundSize === 'cover' ? 'fixed' : 'scroll';
            } else {
                document.body.style.backgroundImage = 'none';
            }

            const sheetBgColor = ficha.sheetBackgroundColor || '#f0e6d2';
            const sectionBgColor = ficha.sheetBackgroundColor || '#f0e6d2';
            
            const sheetRgb = hexToRgb(sheetBgColor);
            const sectionRgb = hexToRgb(sectionBgColor);
            const opacity = ficha.sheetOpacity / 100;
            
            if (sheetRgb) {
                root.style.setProperty('--sheet-bg-color', `rgba(${sheetRgb.r}, ${sheetRgb.g}, ${sheetRgb.b}, ${opacity})`);
            }
            if (sectionRgb) {
                 root.style.setProperty('--section-bg-color', `rgba(${sectionRgb.r}, ${sectionRgb.g}, ${sectionRgb.b}, ${opacity})`);
            }
            
            root.style.setProperty('--border-color', ficha.borderColor);
            root.style.setProperty('--border-style', ficha.borderStyle);
            root.style.setProperty('--border-width', `${ficha.borderWidth}px`);

            if (ficha.shadowIntensity > 0) {
                const blur = ficha.shadowIntensity * 0.5;
                const spread = ficha.shadowIntensity * 0.2;
                root.style.setProperty('--sheet-shadow', `inset 0 0 ${blur}px ${spread}px ${ficha.shadowColor}`);
            } else {
                root.style.setProperty('--sheet-shadow', 'transparent 0 0 0 0 inset');
            }
            
            root.style.setProperty('--component-bg-color', ficha.componentBackgroundColor || '');
            root.style.setProperty('--text-color', ficha.textColor || '');
            root.style.setProperty('--accent-color', ficha.accentColor || '');
        }

    }, [ficha]);
};


// ==========================================================================================
// Conteúdo de: hooks/useCharacterSheet.ts
// ==========================================================================================

const RPG_GM_MODE_KEY = 'rpgGmMode';

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

type EditableAttributes = Pick<Ficha, 'forca' | 'destreza' | 'agilidade' | 'constituicao' | 'inteligencia'>;


const useCharacterSheet = () => {
    const [fichas, setFichas] = useState<Record<string, Ficha>>({});
    const [currentFichaId, setCurrentFichaId] = useState<string>(FICHA_MATRIZ_ID);
    const [diceHistory, setDiceHistory] = useState<DiceRoll[]>([]);
    const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
    const [passwordRequest, setPasswordRequest] = useState<(() => void) | null>(null);
    const [isGmMode, setIsGmMode] = useState(false);
    const [levelUpEffect, setLevelUpEffect] = useState(false);

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
        switchFicha(id);
    }, [fichas, saveFichasToStorage, switchFicha]);
    
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
    };
};

// ==========================================================================================
// Conteúdo de: components
// ==========================================================================================

// --- useCountUp.ts ---
const useCountUp = (endValue: number, duration: number = 2000) => {
    const [count, setCount] = useState(endValue);
    const valueRef = useRef(endValue);

    useEffect(() => {
        const startValue = valueRef.current;
        const range = endValue - startValue;
        if (range === 0) {
            setCount(endValue);
            valueRef.current = endValue;
            return;
        };

        let startTime: number | null = null;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const currentCount = Math.floor(startValue + range * progress);
            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setCount(endValue);
                valueRef.current = endValue;
            }
        };

        requestAnimationFrame(step);

        return () => {
            valueRef.current = endValue;
        };
    }, [endValue, duration]);

    return count;
};


// --- EditableStat.tsx ---
interface EditableStatProps {
    value: number;
    isGmMode: boolean;
    onUpdate: (newValue: number) => void;
    displayClass?: string;
    inputClass?: string;
}

const EditableStat: React.FC<EditableStatProps> = ({ value, isGmMode, onUpdate, displayClass = '', inputClass = '' }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value.toString());

    useEffect(() => {
        if (!isEditing) {
            setTempValue(value.toString());
        }
    }, [value, isEditing]);

    const handleSave = () => {
        const newValue = parseInt(tempValue, 10);
        if (!isNaN(newValue)) {
            onUpdate(newValue);
        }
        setIsEditing(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    };

    if (isGmMode) {
        if (isEditing) {
            return (
                <input
                    type="number"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyPress={handleKeyPress}
                    className={inputClass}
                    autoFocus
                    onFocus={(e) => e.target.select()}
                />
            );
        }
        return (
            <div className="flex items-center gap-1 group cursor-pointer" onClick={() => setIsEditing(true)}>
                <span className={displayClass}>{value}</span>
                <span className="text-xs text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
            </div>
        );
    }

    return <span className={displayClass}>{value}</span>;
};


// --- Modal.tsx ---
interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children, className = '' }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Animation duration
    };
    
    return (
        <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 ${isClosing ? 'modal-exit' : 'modal-enter'}`}>
            <div className={`bg-stone-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-stone-600 ${isClosing ? 'modal-content-exit' : 'modal-content-enter'} ${className}`} style={{ backgroundColor: 'var(--component-bg-color)' }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-medieval">{title}</h2>
                    <button onClick={handleClose} className="text-2xl hover:opacity-75 transition-opacity" style={{ color: 'var(--text-color)' }}>&times;</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

// --- Section.tsx ---
interface SectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div 
            className="rounded-lg transition-colors duration-300"
            style={{
                backgroundColor: 'var(--section-bg-color)',
                borderWidth: `var(--border-width)`,
                borderStyle: `var(--border-style)`,
                borderColor: `var(--border-color)`,
            }}
        >
            <h2
                className="text-lg sm:text-xl font-medieval p-3 cursor-pointer flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                {title}
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </h2>
            <div className={`section-content-wrapper ${isOpen ? 'open' : ''}`}>
                <div>
                     <div className="p-3 pt-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Tooltip.tsx ---
interface TooltipProps {
    text: string;
    children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <>
            <span
                onClick={() => setIsVisible(true)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsVisible(true); }}
                role="button"
                tabIndex={0}
                className="cursor-help"
            >
                {children}
            </span>
            {isVisible && (
                <div 
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsVisible(false)}
                >
                    <div 
                        className="relative w-full max-w-md p-6 bg-stone-800 border border-stone-600 rounded-lg shadow-lg text-center"
                        onClick={(e) => e.stopPropagation()} 
                        style={{backgroundColor: 'var(--component-bg-color)'}}
                    >
                        <button 
                            onClick={() => setIsVisible(false)} 
                            className="absolute top-2 right-3 text-3xl font-bold leading-none hover:opacity-75" 
                            style={{color: 'var(--accent-color)'}}
                            aria-label="Fechar"
                        >
                            &times;
                        </button>
                        <p className="whitespace-pre-wrap text-left" style={{ color: 'var(--text-color)' }}>{text}</p>
                    </div>
                </div>
            )}
        </>
    );
};


// --- Actions.tsx ---
interface ActionsProps {
    onResetPontos: () => void;
    onRecomecar: () => void;
    onRequestDelete: () => void;
}

const Actions: React.FC<ActionsProps> = ({ onResetPontos, onRecomecar, onRequestDelete }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button onClick={onResetPontos} className="btn-interactive py-2 px-4 bg-yellow-800 hover:bg-yellow-700 rounded-md text-white">
                Reiniciar Pontos
            </button>
            <button onClick={onRecomecar} className="btn-interactive py-2 px-4 bg-orange-800 hover:bg-orange-700 rounded-md text-white">
                Recomeçar Ficha
            </button>
            <button onClick={onRequestDelete} className="btn-interactive py-2 px-4 bg-red-800 hover:bg-red-700 rounded-md text-white">
                Excluir Ficha
            </button>
        </div>
    );
};

const QuestionMarkIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`inline-block w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);

// --- Attributes.tsx ---
interface AttributesProps {
    ficha: Ficha;
    onBulkUpdate: (updates: Partial<Ficha>) => void;
    selectedAttribute: string | null;
    setSelectedAttribute: (attr: string | null) => void;
    isGmMode: boolean;
    onGmUpdate: (attr: keyof Ficha, adjustment: number) => void;
}

const attributeLabels: Record<keyof EditableAttributes, string> = {
    forca: 'Força',
    destreza: 'Destreza',
    agilidade: 'Agilidade',
    constituicao: 'Constituição',
    inteligencia: 'Inteligência',
};
const derivedAttributeLabels: Record<string, string> = {
    ataque: "Ataque",
    ataqueMagico: "Ataque Mágico",
    acerto: "Acerto",
    esquiva: "Esquiva",
    rdf: "RDF",
    rdm: "RDM"
};

const primaryAttributeTooltips: Record<keyof EditableAttributes, string> = {
    forca: "Olá, aventureiro! Como vai a Força? Falando nela, cada ponto que você distribui aqui aumenta seu Ataque em +1. Além disso, a cada 5 pontos, sua Redução de Dano Físico (RDF) e sua Capacidade de Carga melhoram. E não para por aí: a cada 10 pontos, seus pulos ficam mais altos e sua Vida Total recebe um bônus! Poder puro!",
    destreza: "Saudações, andarilho de mãos rápidas! Sua precisão é lendária. A cada 3 pontos em Destreza, seu Acerto aumenta em +1, garantindo que seus golpes atinjam o alvo. A cada 5 pontos, você também ganha +1 de Ataque, um toque de fineza em sua ofensiva.",
    agilidade: "Veloz como o vento, não é mesmo? Sua Agilidade é a chave para a sobrevivência. A cada 3 pontos, sua Esquiva aumenta em +1, tornando-o um alvo difícil. Ela também impulsiona sua Velocidade de Corrida e a Distância dos seus Pulos. Um bônus a cada 10 pontos ainda melhora seu Acerto!",
    constituicao: "Firme como uma montanha! Sua Constituição é o pilar da sua resistência. Cada ponto investido aqui aumenta drasticamente sua Vida, Magia e Vigor totais, além de acelerar a Regeneração de todos eles. Um verdadeiro herói precisa de fôlego para grandes batalhas!",
    inteligencia: "Olá, mente brilhante! O conhecimento é sua maior arma. Cada ponto em Inteligência aumenta seu Ataque Mágico em +1. A cada 5 pontos, sua Redução de Dano Mágico (RDM) melhora. Se for sábio o suficiente (10+ de INT), sua Magia Total será ampliada pela sua Constituição. Use seu poder com sabedoria!"
};

const derivedAttributeTooltips: Record<string, string> = {
    ataque: "Este é o seu poder de esmagar inimigos! Seu Ataque é a soma da sua Força, um bônus da sua Destreza (a cada 5 pontos) e o poder da sua arma. Quanto maior, mais dano você causa!",
    ataqueMagico: "O poder arcano flui através de você! Seu Ataque Mágico é a soma da sua Inteligência e o poder de sua arma mágica. Canalize essa energia para conjurar feitiços devastadores.",
    acerto: "De que adianta a força sem precisão? Seu Acerto determina a chance de atingir o alvo. Ele vem da sua Destreza (a cada 3 pontos) com um toque de Agilidade (a cada 10 pontos). Mire bem!",
    esquiva: "Ser intocável é uma grande vantagem. Sua Esquiva é sua capacidade de desviar de golpes, vinda diretamente da sua Agilidade (a cada 3 pontos). Dance pelo campo de batalha!",
    rdf: "Resistência é fundamental. Sua Redução de Dano Físico (RDF) diminui o dano de golpes, socos e flechas. Ela é forjada a partir da sua Força (a cada 5 pontos).",
    rdm: "Sua mente é um escudo. Sua Redução de Dano Mágico (RDM) protege você de feitiços e maldições. Ela é fortalecida pela sua Inteligência (a cada 5 pontos)."
};

const DiceIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 3H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zM7.5 16.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
    </svg>
);

const Attributes: React.FC<AttributesProps> = ({ ficha, onBulkUpdate, selectedAttribute, setSelectedAttribute, isGmMode, onGmUpdate }) => {
    const [tempAttrs, setTempAttrs] = useState<Partial<EditableAttributes> | null>(null);
    const [changedStats, setChangedStats] = useState<Record<string, boolean>>({});
    const prevDisplayFichaRef = useRef<Ficha>(ficha);

    useEffect(() => {
        setTempAttrs(null);
    }, [ficha.id]);

    const displayFicha = useMemo(() => {
        const baseFicha = tempAttrs ? { ...ficha, ...tempAttrs } : ficha;
        return calcularAtributos(baseFicha);
    }, [ficha, tempAttrs]);
    
    useEffect(() => {
        const changes: Record<string, boolean> = {};
        const derivedKeys: (keyof Ficha)[] = ['ataque', 'ataqueMagico', 'acerto', 'esquiva', 'rdf', 'rdm'];
        
        derivedKeys.forEach(key => {
            if (displayFicha[key] !== prevDisplayFichaRef.current[key]) {
                changes[key] = true;
            }
        });
        
        if (Object.keys(changes).length > 0) {
            setChangedStats(changes);
            const timer = setTimeout(() => {
                setChangedStats({});
            }, 800);
            return () => clearTimeout(timer);
        }
        
        prevDisplayFichaRef.current = displayFicha;
    }, [displayFicha]);


    const pontosDisponiveis = displayFicha.pontosHabilidadeDisponiveis;

    const handleAttrChange = (attrKey: keyof EditableAttributes, delta: number) => {
        const currentVal = displayFicha[attrKey];
        const lockedVal = ficha.lockedAtributos[attrKey];
        const newValue = currentVal + delta;

        if (delta < 0 && newValue < lockedVal) {
            console.warn(`Cannot decrease ${attrKey} below locked value of ${lockedVal}`);
            return;
        }
        if (delta > 0 && pontosDisponiveis <= 0) {
            alert("Sem Pontos de Habilidade disponíveis.");
            return;
        }

        setTempAttrs(prev => ({
            ...(prev || {
                forca: ficha.forca,
                destreza: ficha.destreza,
                agilidade: ficha.agilidade,
                constituicao: ficha.constituicao,
                inteligencia: ficha.inteligencia,
            }),
            [attrKey]: newValue
        }));
    };
    
    const handleSave = () => {
        if (!tempAttrs) return;

        const newLockedAtributos = { ...ficha.lockedAtributos };
        const payload: Partial<Ficha> = {};

        (Object.keys(tempAttrs) as Array<keyof EditableAttributes>).forEach(key => {
            const tempValue = tempAttrs[key];
            if (tempValue !== undefined) {
                payload[key] = tempValue;
                newLockedAtributos[key] = Math.max(newLockedAtributos[key], tempValue);
            }
        });

        payload.lockedAtributos = newLockedAtributos;
        onBulkUpdate(payload);
        setTempAttrs(null);
    };

    const handleCancel = () => {
        setTempAttrs(null);
    };

    const handleGmUpdateDerived = (attrKey: keyof Ficha, newValue: number) => {
        const baseFicha = { ...ficha, gmAdjustments: { ...ficha.gmAdjustments, [attrKey]: 0 } };
        const calculatedFicha = calcularAtributos(baseFicha);
        const baseValue = calculatedFicha[attrKey] as number;
        const adjustment = newValue - baseValue;
        onGmUpdate(attrKey, adjustment);
    };
    
    const primaryAttributes: (keyof EditableAttributes)[] = ['forca', 'destreza', 'agilidade', 'constituicao', 'inteligencia'];
    
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 bg-stone-800 p-3 rounded-lg" style={componentStyle}>
                <div className="text-center mb-2">
                    <h3 className="font-medieval text-lg">Atributos Primários</h3>
                    <p className="text-sm">Pontos Disponíveis: <span className={`font-bold text-xl ${pontosDisponiveis < 0 ? 'text-red-500' : 'text-green-400'}`}>{pontosDisponiveis}</span></p>
                </div>
                <div className="divide-y divide-stone-700">
                    {primaryAttributes.map(attr => (
                         <div key={attr} className="flex justify-between items-center py-2">
                            <div className="flex items-center gap-1.5">
                                <label className="font-bold">{attributeLabels[attr]}</label>
                                <Tooltip text={primaryAttributeTooltips[attr]}>
                                    <span className="cursor-help text-xs opacity-70" aria-label={`Explicação para ${attributeLabels[attr]}`}><QuestionMarkIcon /></span>
                                </Tooltip>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isGmMode ? (
                                    <>
                                        <button onClick={() => handleAttrChange(attr, -1)} disabled={displayFicha[attr] <= ficha.lockedAtributos[attr]} className="btn-interactive w-8 h-8 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed text-white">-</button>
                                        <span className="w-10 text-center font-bold text-lg">{displayFicha[attr]}</span>
                                        <button onClick={() => handleAttrChange(attr, 1)} disabled={pontosDisponiveis <= 0} className="btn-interactive w-8 h-8 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed text-white">+</button>
                                    </>
                                ) : (
                                    <EditableStat
                                        value={displayFicha[attr]}
                                        isGmMode={isGmMode}
                                        onUpdate={(val) => onBulkUpdate({ [attr]: val })}
                                        displayClass="font-bold text-lg"
                                        inputClass="w-20 text-center bg-stone-800 border border-stone-600 rounded-md"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {tempAttrs && (
                    <div className="flex gap-2 pt-4">
                        <button onClick={handleCancel} className="btn-interactive flex-1 py-2 bg-stone-600 hover:bg-stone-500 rounded-md text-white">Cancelar</button>
                        <button onClick={handleSave} className="btn-interactive flex-1 py-2 bg-green-700 hover:bg-green-600 rounded-md text-white">Salvar</button>
                    </div>
                )}
            </div>
            <div className="space-y-2">
                 {Object.entries(derivedAttributeLabels).map(([key, label]) => {
                     const attrKey = key as keyof Ficha;
                     const isSelected = selectedAttribute === attrKey;
                     return (
                         <div key={key} className="flex justify-between items-center py-2 px-3 bg-stone-900/50 rounded-md" style={componentStyle}>
                            <div className="flex items-center gap-1.5">
                                <label className="font-bold" style={{ color: 'var(--accent-color)' }}>{label}</label>
                                <Tooltip text={derivedAttributeTooltips[key]}>
                                    <span className="cursor-help text-xs opacity-70" aria-label={`Explicação para ${label}`}><QuestionMarkIcon /></span>
                                </Tooltip>
                            </div>
                            <div className="flex items-center gap-2">
                                <EditableStat 
                                    value={displayFicha[attrKey] as number}
                                    isGmMode={isGmMode}
                                    onUpdate={(val) => handleGmUpdateDerived(attrKey, val)}
                                    displayClass={`font-bold text-lg ${changedStats[key] ? 'attribute-flash-animation' : ''}`}
                                    inputClass="w-20 text-center bg-stone-800 border border-stone-600 rounded-md"
                                />
                                <button
                                    onClick={() => setSelectedAttribute(isSelected ? null : key)}
                                    className={`transition-all ${isSelected ? 'scale-125' : 'opacity-50 hover:opacity-100'}`}
                                    style={{ color: isSelected ? 'var(--accent-color)' : 'var(--text-color)'}}
                                    title={`Rolar com ${label}`}
                                >
                                    <DiceIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                     )
                })}
            </div>
        </div>
    );
};

// --- Combat.tsx ---
interface CombatProps {
    ficha: Ficha;
    onUpdate: <K extends keyof Ficha>(key: K, value: Ficha[K]) => void;
    onRecalculate: (ficha: Ficha) => void;
    isGmMode: boolean;
    onGmUpdate: (attr: keyof Ficha, adjustment: number) => void;
}

const WeaponInput: React.FC<{
    hand: 'Direita' | 'Esquerda';
    ficha: Ficha;
    onUpdate: <K extends keyof Ficha>(key: K, value: Ficha[K]) => void;
    isGmMode: boolean;
}> = ({ hand, ficha, onUpdate, isGmMode }) => {
    const handKey = hand === 'Direita' ? 'Direita' : 'Esquerda';
    const nameKey = `arma${handKey}Nome` as keyof Ficha;
    const ataqueKey = `arma${handKey}Ataque` as keyof Ficha;
    const ataqueMagicoKey = `arma${handKey}AtaqueMagico` as keyof Ficha;

    const handleNumberChange = (key: keyof Ficha, value: number) => {
        onUpdate(key, Math.max(0, value));
    };
    
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div className="space-y-2">
            <label className="block font-bold">{`Mão ${hand}`}</label>
            <input
                type="text"
                placeholder="Nome da Arma"
                value={ficha[nameKey] as string}
                onChange={(e) => onUpdate(nameKey, e.target.value)}
                className="w-full p-2 bg-stone-800 border border-stone-600 rounded-md"
                style={componentStyle}
            />
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-sm block text-center" style={{ color: 'var(--accent-color)' }}>Ataque</label>
                    {isGmMode ? (
                        <EditableStat
                            value={ficha[ataqueKey] as number}
                            isGmMode={isGmMode}
                            onUpdate={(val) => handleNumberChange(ataqueKey, val)}
                            inputClass="w-full p-2 bg-stone-800 border border-stone-600 rounded-md text-center"
                        />
                    ) : (
                        <div className="flex items-center justify-center gap-1 mt-1">
                            <button onClick={() => handleNumberChange(ataqueKey, (ficha[ataqueKey] as number) - 1)} className="btn-interactive w-7 h-7 rounded-md bg-stone-700 hover:bg-stone-600 text-white">-</button>
                            <span className="w-10 text-center font-bold text-lg">{ficha[ataqueKey] as number}</span>
                            <button onClick={() => handleNumberChange(ataqueKey, (ficha[ataqueKey] as number) + 1)} className="btn-interactive w-7 h-7 rounded-md bg-stone-700 hover:bg-stone-600 text-white">+</button>
                        </div>
                    )}
                </div>
                <div>
                    <label className="text-sm block text-center" style={{ color: 'var(--accent-color)' }}>Ataque Mágico</label>
                     {isGmMode ? (
                        <EditableStat
                            value={ficha[ataqueMagicoKey] as number}
                            isGmMode={isGmMode}
                            onUpdate={(val) => handleNumberChange(ataqueMagicoKey, val)}
                            inputClass="w-full p-2 bg-stone-800 border border-stone-600 rounded-md text-center"
                        />
                    ) : (
                         <div className="flex items-center justify-center gap-1 mt-1">
                            <button onClick={() => handleNumberChange(ataqueMagicoKey, (ficha[ataqueMagicoKey] as number) - 1)} className="btn-interactive w-7 h-7 rounded-md bg-stone-700 hover:bg-stone-600 text-white">-</button>
                            <span className="w-10 text-center font-bold text-lg">{ficha[ataqueMagicoKey] as number}</span>
                            <button onClick={() => handleNumberChange(ataqueMagicoKey, (ficha[ataqueMagicoKey] as number) + 1)} className="btn-interactive w-7 h-7 rounded-md bg-stone-700 hover:bg-stone-600 text-white">+</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Combat: React.FC<CombatProps> = ({ ficha, onUpdate, isGmMode }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WeaponInput hand="Direita" ficha={ficha} onUpdate={onUpdate} isGmMode={isGmMode} />
            <WeaponInput hand="Esquerda" ficha={ficha} onUpdate={onUpdate} isGmMode={isGmMode} />
        </div>
    );
};

// --- CompactDerivedStats.tsx ---
const CompactDerivedStats: React.FC<{ ficha: Ficha }> = ({ ficha }) => {
    const stats = {
        Ataque: ficha.ataque,
        'Atq. Mágico': ficha.ataqueMagico,
        Acerto: ficha.acerto,
        Esquiva: ficha.esquiva,
        RDF: ficha.rdf,
        RDM: ficha.rdm,
    };
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div className="p-3 rounded-lg" style={componentStyle}>
            <h3 className="font-medieval text-lg text-center mb-2">Combate Rápido</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
                {Object.entries(stats).map(([label, value]) => (
                    <div key={label}>
                        <div className="text-xs opacity-80" style={{color: 'var(--accent-color)'}}>{label}</div>
                        <div className="text-xl font-bold">{value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- CustomizationModal.tsx ---
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
    'theme' | 'backgroundColor' | 'sheetBackgroundColor' | 'componentBackgroundColor' | 'fontFamily' |
    'sheetOpacity' | 'shadowColor' | 'shadowIntensity' | 'backgroundImage' | 'backgroundSize' |
    'borderColor' | 'borderStyle' | 'borderWidth' | 'diceColor' | 'diceNumberColor' |
    'diceTexture' | 'diceAnimation' | 'textColor' | 'accentColor'
>;

const CustomizationModal: React.FC<CustomizationModalProps> = ({ ficha, onClose, onUpdate, onReset }) => {
    const [initialAesthetics] = useState<Aesthetics>({
        theme: ficha.theme,
        backgroundColor: ficha.backgroundColor,
        sheetBackgroundColor: ficha.sheetBackgroundColor,
        componentBackgroundColor: ficha.componentBackgroundColor,
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
        textColor: ficha.textColor,
        accentColor: ficha.accentColor,
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
                    
                    <fieldset className="border border-stone-600 p-3 rounded-md">
                        <legend className="px-2 font-medieval">Aparência</legend>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm">Cor do Texto/Números</label>
                                <input type="color" value={ficha.textColor || '#000000'} onChange={e => handleUpdate('textColor', e.target.value)} className="w-full h-8 p-0 border-none rounded bg-stone-700" />
                            </div>
                            <div>
                                <label className="text-sm">Cor de Destaque</label>
                                <input type="color" value={ficha.accentColor || '#f59e0b'} onChange={e => handleUpdate('accentColor', e.target.value)} className="w-full h-8 p-0 border-none rounded bg-stone-700" />
                            </div>
                            <div>
                                <label className="text-sm">Fundo da Página</label>
                                <input type="color" value={ficha.backgroundColor || '#f0e6d2'} onChange={e => handleUpdate('backgroundColor', e.target.value)} className="w-full h-8 p-0 border-none rounded bg-stone-700" />
                            </div>
                             <div>
                                <label className="text-sm">Fundo da Ficha</label>
                                <input type="color" value={ficha.sheetBackgroundColor || '#f0e6d2'} onChange={e => handleUpdate('sheetBackgroundColor', e.target.value)} className="w-full h-8 p-0 border-none rounded bg-stone-700" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <label className="text-sm">Fundo dos Componentes</label>
                            <input type="color" value={ficha.componentBackgroundColor || '#f0e6d2'} onChange={e => handleUpdate('componentBackgroundColor', e.target.value)} className="w-full h-8 p-0 border-none rounded bg-stone-700" />
                        </div>
                         <div className="mt-2">
                            <label className="text-sm">Fonte</label>
                            <select value={ficha.fontFamily} onChange={e => handleUpdate('fontFamily', e.target.value)} className="w-full p-2 bg-stone-700 rounded text-white" style={{ color: 'var(--text-color)'}}>
                                <option value="'Inter', sans-serif">Padrão</option>
                                <option value="'MedievalSharp', serif">Medieval</option>
                                <option value="'Orbitron', sans-serif">Futurista</option>
                            </select>
                        </div>
                    </fieldset>
                    
                    <fieldset className="border border-stone-600 p-3 rounded-md">
                        <legend className="px-2 font-medieval">Opacidade e Sombra</legend>
                         <div>
                            <label className="text-sm">Opacidade da Ficha ({ficha.sheetOpacity}%)</label>
                            <input type="range" min="10" max="100" value={ficha.sheetOpacity} onChange={e => handleUpdate('sheetOpacity', parseInt(e.target.value))} className="w-full" />
                        </div>
                         <div className="mt-2">
                            <label className="text-sm">Intensidade da Sombra ({ficha.shadowIntensity}%)</label>
                            <input type="range" min="0" max="100" value={ficha.shadowIntensity} onChange={e => handleUpdate('shadowIntensity', parseInt(e.target.value))} className="w-full" />
                        </div>
                    </fieldset>

                    <fieldset className="border border-stone-600 p-3 rounded-md">
                         <legend className="px-2 font-medieval">Imagem de Fundo (Página)</legend>
                         <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'backgroundImage')} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-800 file:text-amber-50 hover:file:bg-amber-700" />
                         {ficha.backgroundImage && <button onClick={() => handleUpdate('backgroundImage', null)} className="text-xs text-red-400 mt-1">Remover Imagem</button>}
                    </fieldset>
                    
                    <fieldset className="border border-stone-600 p-3 rounded-md">
                        <legend className="px-2 font-medieval">Dado</legend>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm">Cor do Fundo</label>
                                <input type="color" value={ficha.diceColor || '#f0e6d2'} onChange={e => handleUpdate('diceColor', e.target.value)} className="w-full h-8 p-0 border-none rounded bg-stone-700" />
                            </div>
                             <div>
                                <label className="text-sm">Cor do Número</label>
                                <input type="color" value={ficha.diceNumberColor || '#000000'} onChange={e => handleUpdate('diceNumberColor', e.target.value)} className="w-full h-8 p-0 border-none rounded bg-stone-700" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <label className="text-sm">Animação</label>
                            <select value={ficha.diceAnimation} onChange={e => handleUpdate('diceAnimation', e.target.value as Ficha['diceAnimation'])} className="w-full p-2 bg-stone-700 rounded" style={{ color: 'var(--text-color)'}}>
                                <option value="padrao">Padrão</option>
                                <option value="rapido">Rápido</option>
                                <option value="salto">Salto</option>
                            </select>
                        </div>
                    </fieldset>
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-stone-700">
                        <button onClick={() => setShowResetConfirm(true)} className="btn-interactive w-full py-2 bg-red-800 hover:bg-red-700 rounded-md col-span-2 text-white">Reiniciar Estética</button>
                        <button onClick={handleCancel} className="btn-interactive w-full py-2 bg-stone-600 hover:bg-stone-500 rounded-md text-white">Cancelar</button>
                        <button onClick={onClose} className="btn-interactive w-full py-2 bg-amber-700 hover:bg-amber-600 rounded-md text-white">Salvar</button>
                    </div>
                </div>
            </Modal>
            {showResetConfirm && (
                <Modal title="Confirmar Reset" onClose={() => setShowResetConfirm(false)}>
                    <p>Tem certeza que deseja reiniciar toda a estética para o padrão medieval?</p>
                    <p className="text-sm opacity-70 mt-1">Seus dados de personagem não serão afetados.</p>
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => setShowResetConfirm(false)} className="btn-interactive px-4 py-2 bg-stone-600 rounded text-white">Não</button>
                        <button onClick={handleConfirmReset} className="btn-interactive px-4 py-2 bg-red-700 rounded text-white">Sim, Reiniciar</button>
                    </div>
                </Modal>
            )}
        </>
    );
};

// --- DiceRoller.tsx ---
interface DiceRollerProps {
    onRoll: (max: number) => DiceRoll;
    selectedAttribute: string | null;
    setSelectedAttribute: (attr: string | null) => void;
    ficha: Ficha;
}

const diceRollerAttributeGroups = {
    'Primários': ['forca', 'destreza', 'agilidade', 'constituicao', 'inteligencia'],
    'Combate': ['ataque', 'ataqueMagico', 'acerto', 'esquiva', 'rdf', 'rdm'],
    'Locomoção': ['velocidadeCorrida', 'alturaPulo', 'distanciaPulo'],
};

const diceRollerAttributeLabels: Record<string, string> = {
    forca: 'Força', destreza: 'Destreza', agilidade: 'Agilidade', constituicao: 'Constituição', inteligencia: 'Inteligência',
    ataque: "Ataque", ataqueMagico: "Ataque Mágico", acerto: "Acerto", esquiva: "Esquiva", rdf: "RDF", rdm: "RDM",
    velocidadeCorrida: 'Velocidade', alturaPulo: 'Pulo (Altura)', distanciaPulo: 'Pulo (Dist.)'
};

const DiceRoller: React.FC<DiceRollerProps> = ({ onRoll, selectedAttribute, setSelectedAttribute, ficha }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isRolling, setIsRolling] = useState(false);
    const [diceMax, setDiceMax] = useState(20);
    const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);
    const [animationClass, setAnimationClass] = useState('');
    const [rollStatus, setRollStatus] = useState<'none' | 'crit' | 'fail'>('none');

    const handleRoll = () => {
        if (isRolling) return;
        setIsRolling(true);
        setLastRoll(null);
        setRollStatus('none');

        let animClass = 'animate-roll-default';
        let animDuration = 1000;
        if (ficha.diceAnimation === 'rapido') {
            animClass = 'animate-roll-fast';
            animDuration = 500;
        } else if (ficha.diceAnimation === 'salto') {
            animClass = 'animate-roll-jump';
            animDuration = 1200;
        }
        setAnimationClass(animClass);

        setTimeout(() => {
            const result = onRoll(diceMax);
            setLastRoll(result);
            if (result.result === diceMax) {
                setRollStatus('crit');
            } else if (result.result === 1) {
                setRollStatus('fail');
            }
            setIsRolling(false);
            setAnimationClass('');
        }, animDuration);
    };

    const getAttributeValue = () => {
        if (!selectedAttribute || !ficha) return 0;
        const attrValue = ficha[selectedAttribute as keyof Ficha];
        return typeof attrValue === 'number' ? attrValue : 0;
    }
    
    if (!isPanelOpen) {
        return (
            <button 
                onClick={() => setIsPanelOpen(true)}
                className="btn-interactive fixed bottom-8 left-1/2 -translate-x-1/2 sm:bottom-4 z-30 w-16 h-16 bg-stone-800 border-2 rounded-full shadow-lg flex items-center justify-center hover:bg-stone-700"
                style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)', backgroundColor: ficha.darkMode ? '#2d2d2d' : '' }}
                title="Rolar Dados"
            >
                <span className="text-4xl">🎲</span>
            </button>
        );
    }
    
    const diceStyle: React.CSSProperties = {
        backgroundColor: ficha.darkMode ? '#444' : (ficha.diceColor || '#a0522d'),
        color: ficha.darkMode ? '#fff' : (ficha.diceNumberColor || '#ffffff'),
        backgroundImage: ficha.diceTexture ? `url(${ficha.diceTexture})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };
    
    const resultClasses = `dice-result-land ${
        rollStatus === 'crit' ? 'crit-success' : rollStatus === 'fail' ? 'crit-fail' : ''
    }`;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-stone-900/90 backdrop-blur-md p-3 rounded-lg shadow-2xl border border-stone-700 w-64 flex flex-col gap-3" style={{ backgroundColor: ficha.darkMode ? 'rgba(20,20,20,0.9)' : ''}}>
            <div className="flex justify-between items-center">
                <h3 className="font-medieval">Rolagem</h3>
                <button onClick={() => setIsPanelOpen(false)} className="text-2xl opacity-70 hover:opacity-100">&times;</button>
            </div>
            
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 border-y border-stone-700 py-2">
                {Object.entries(diceRollerAttributeGroups).map(([groupName, attrs]) => (
                    <div key={groupName}>
                        <h4 className="text-xs font-bold mb-1" style={{ color: 'var(--accent-color)' }}>{groupName}</h4>
                        {attrs.map(attr => {
                            const isSelected = selectedAttribute === attr;
                            return (
                                <div key={attr} onClick={() => setSelectedAttribute(isSelected ? null : attr)} className={`flex justify-between items-center text-sm p-1 rounded cursor-pointer ${isSelected ? 'bg-amber-800/50' : 'hover:bg-stone-800'}`}>
                                    <span>{diceRollerAttributeLabels[attr]}</span>
                                    <span className="font-bold">{ficha[attr as keyof Ficha] as number}</span>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

            <div className="flex gap-1 justify-center">
                {[4, 6, 12, 20].map(d => (
                    <button 
                        key={d}
                        onClick={() => setDiceMax(d)}
                        className={`btn-interactive w-10 h-10 text-sm rounded text-white ${diceMax === d ? 'bg-amber-600' : 'bg-stone-700 hover:bg-stone-600'}`}
                    >
                        D{d}
                    </button>
                ))}
            </div>

            <button 
                onClick={handleRoll} 
                className={`w-20 h-20 self-center rounded-full flex items-center justify-center text-2xl font-bold font-medieval shadow-inner shadow-black/50 hover:bg-amber-600 transition-colors disabled:opacity-50 ${animationClass}`} 
                style={diceStyle}
                disabled={isRolling}
            >
                {isRolling ? '...' : (lastRoll ? <span className={resultClasses}>{lastRoll.total}</span> : 'Roll')}
            </button>
            
            {selectedAttribute && (
                 <div className="text-xs text-center -mt-2">
                    Com <span className="capitalize" style={{ color: 'var(--accent-color)' }}>{diceRollerAttributeLabels[selectedAttribute] || selectedAttribute}</span> (+{getAttributeValue()})
                </div>
            )}
            
            {lastRoll && !isRolling && (
                <div className="text-xs text-center opacity-80">
                    <p>D{diceMax}: {lastRoll.result}
                    {lastRoll.bonus > 0 && ` + ${lastRoll.bonus}`}
                    </p>
                </div>
            )}
        </div>
    );
};

// --- ExclusionModal.tsx ---
interface ExclusionModalProps {
    ficha: Ficha;
    onClose: () => void;
    onConfirm: (items: { vantagens: string[], desvantagens: string[], removeRaca: boolean, removeClasse: boolean }) => void;
}

const ExclusionModal: React.FC<ExclusionModalProps> = ({ ficha, onClose, onConfirm }) => {
    const [selectedVantagens, setSelectedVantagens] = useState<string[]>([]);
    const [selectedDesvantagens, setSelectedDesvantagens] = useState<string[]>([]);
    const [removeRaca, setRemoveRaca] = useState<boolean>(false);
    const [removeClasse, setRemoveClasse] = useState<boolean>(false);

    const toggleSelection = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handleConfirm = () => {
        if (selectedVantagens.length === 0 && selectedDesvantagens.length === 0 && !removeRaca && !removeClasse) {
            alert("Nenhum item selecionado para exclusão.");
            return;
        }
        onConfirm({
            vantagens: selectedVantagens,
            desvantagens: selectedDesvantagens,
            removeRaca,
            removeClasse,
        });
        onClose();
    };

    const hasItems = ficha.vantagens.length > 0 || ficha.desvantagens.length > 0 || ficha.racaSelecionada || ficha.classeSelecionada;
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <Modal title="Excluir Itens da Ficha" onClose={onClose}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {!hasItems && <p className="opacity-70">O personagem não possui vantagens, desvantagens, raça ou classe para excluir.</p>}
                
                {ficha.vantagens.length > 0 && (
                    <fieldset className="border border-stone-600 p-3 rounded-md">
                        <legend className="px-2 font-medieval">Vantagens</legend>
                        <div className="space-y-2">
                            {ficha.vantagens.map(v => (
                                <label key={v} htmlFor={`v-${v}`} className="flex items-center gap-3 p-2 bg-stone-900/50 rounded cursor-pointer hover:bg-stone-700" style={componentStyle}>
                                    <input
                                        type="checkbox"
                                        id={`v-${v}`}
                                        checked={selectedVantagens.includes(v)}
                                        onChange={() => toggleSelection(selectedVantagens, setSelectedVantagens, v)}
                                        className="w-4 h-4 text-amber-600 bg-stone-700 border-stone-500 rounded focus:ring-amber-500"
                                    />
                                    <span>{v}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                )}

                {ficha.desvantagens.length > 0 && (
                     <fieldset className="border border-stone-600 p-3 rounded-md">
                        <legend className="px-2 font-medieval text-red-400">Desvantagens</legend>
                        <div className="space-y-2">
                            {ficha.desvantagens.map(d => (
                                <label key={d} htmlFor={`d-${d}`} className="flex items-center gap-3 p-2 bg-stone-900/50 rounded cursor-pointer hover:bg-stone-700" style={componentStyle}>
                                    <input
                                        type="checkbox"
                                        id={`d-${d}`}
                                        checked={selectedDesvantagens.includes(d)}
                                        onChange={() => toggleSelection(selectedDesvantagens, setSelectedDesvantagens, d)}
                                         className="w-4 h-4 text-amber-600 bg-stone-700 border-stone-500 rounded focus:ring-amber-500"
                                    />
                                    <span>{d}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                )}
                
                {ficha.racaSelecionada && (
                    <fieldset className="border border-stone-600 p-3 rounded-md">
                        <legend className="px-2 font-medieval text-sky-400">Raça</legend>
                        <label htmlFor="raca" className="flex items-center gap-3 p-2 bg-stone-900/50 rounded cursor-pointer hover:bg-stone-700" style={componentStyle}>
                            <input
                                type="checkbox"
                                id="raca"
                                checked={removeRaca}
                                onChange={() => setRemoveRaca(!removeRaca)}
                                className="w-4 h-4 text-amber-600 bg-stone-700 border-stone-500 rounded focus:ring-amber-500"
                            />
                            <span>{ficha.racaSelecionada}</span>
                        </label>
                    </fieldset>
                )}
                
                {ficha.classeSelecionada && (
                    <fieldset className="border border-stone-600 p-3 rounded-md">
                        <legend className="px-2 font-medieval text-lime-400">Classe</legend>
                        <label htmlFor="classe" className="flex items-center gap-3 p-2 bg-stone-900/50 rounded cursor-pointer hover:bg-stone-700" style={componentStyle}>
                            <input
                                type="checkbox"
                                id="classe"
                                checked={removeClasse}
                                onChange={() => setRemoveClasse(!removeClasse)}
                                className="w-4 h-4 text-amber-600 bg-stone-700 border-stone-500 rounded focus:ring-amber-500"
                            />
                            <span>{ficha.classeSelecionada}</span>
                        </label>
                    </fieldset>
                )}


            </div>
            <div className="mt-6 flex justify-end gap-2">
                <button onClick={onClose} className="btn-interactive px-4 py-2 bg-stone-600 rounded text-white">Cancelar</button>
                <button onClick={handleConfirm} disabled={!hasItems} className="btn-interactive px-4 py-2 bg-red-700 rounded disabled:bg-stone-500 disabled:cursor-not-allowed text-white">Confirmar Exclusão</button>
            </div>
        </Modal>
    );
};

// --- Header.tsx ---
interface HeaderProps {
    fichas: Record<string, Ficha>;
    currentFichaId: string;
    switchFicha: (id: string) => void;
    nomePersonagem: string;
    handleUpdate: (key: 'nomePersonagem', value: string) => void;
    onNewFicha: () => void;
    isGmMode: boolean;
    onToggleGmMode: () => void;
    onImport: () => void;
    onExport: () => void;
    onOpenNpcGenerator: () => void;
}

const Header: React.FC<HeaderProps> = ({ fichas, currentFichaId, switchFicha, nomePersonagem, handleUpdate, onNewFicha, isGmMode, onToggleGmMode, onImport, onExport, onOpenNpcGenerator }) => {
    const componentStyle = { backgroundColor: 'var(--component-bg-color)', color: 'var(--text-color)' };
    const [isIoMenuOpen, setIsIoMenuOpen] = useState(false);
    const ioMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ioMenuRef.current && !ioMenuRef.current.contains(event.target as Node)) {
                setIsIoMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-stone-900 p-4 border-b border-stone-700 flex flex-col gap-4" style={{backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'var(--border-color)'}}>
            <div className="flex justify-between items-center gap-2">
                 <select
                    value={currentFichaId}
                    onChange={(e) => switchFicha(e.target.value)}
                    className="flex-grow sm:flex-grow-0 bg-stone-800 border border-stone-600 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    style={componentStyle}
                >
                    {Object.values(fichas).sort((a: Ficha, b: Ficha) => {
                        if (a.id === FICHA_MATRIZ_ID) return -1;
                        if (b.id === FICHA_MATRIZ_ID) return 1;
                        return a.nomeFicha.localeCompare(b.nomeFicha);
                    })
                    .map((f: Ficha) => (
                        <option key={f.id} value={f.id}>{f.nomeFicha}</option>
                    ))}
                </select>
                <div className="flex items-center gap-2">
                     <button
                        onClick={onNewFicha}
                        className="btn-interactive bg-amber-700 hover:bg-amber-600 text-white font-bold p-2 rounded-md"
                        title="Criar Nova Ficha"
                    >
                        +
                    </button>
                    <div className="relative" ref={ioMenuRef}>
                        <button
                            onClick={() => setIsIoMenuOpen(v => !v)}
                            className="btn-interactive p-2 rounded-md bg-stone-700 hover:bg-stone-600 text-white"
                            title="Importar/Exportar Ficha"
                        >
                            <span className="text-xl">🔃</span>
                        </button>
                        {isIoMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-stone-800 border border-stone-600 rounded-md shadow-lg z-10" style={{ backgroundColor: 'var(--component-bg-color)'}}>
                                <ul className="py-1">
                                    <li>
                                        <button onClick={() => { onImport(); setIsIoMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-stone-700" style={{ color: 'var(--text-color)' }}>
                                            Importar Ficha
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={() => { onExport(); setIsIoMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-stone-700" style={{ color: 'var(--text-color)' }}>
                                            Exportar Ficha
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onOpenNpcGenerator}
                        className="btn-interactive p-2 rounded-md bg-stone-700 hover:bg-stone-600 text-white flex items-center justify-center"
                        title="Gerador de NPC"
                    >
                        <span className="text-xl">🧙</span>
                    </button>
                    <button
                        onClick={onToggleGmMode}
                        className={`btn-interactive font-bold p-2 rounded-md text-2xl ${isGmMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-stone-700 hover:bg-stone-600'}`}
                        title={isGmMode ? "Desativar Modo Mestre" : "Ativar Modo Mestre"}
                    >
                        ⚙️
                    </button>
                </div>
            </div>
             <input
                type="text"
                id="nome-personagem"
                placeholder="Nome do Personagem"
                value={nomePersonagem}
                onChange={(e) => handleUpdate('nomePersonagem', e.target.value)}
                className="w-full text-2xl sm:text-3xl font-medieval bg-transparent text-center focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-md px-2 py-1"
                style={{ color: 'var(--accent-color)' }}
            />
        </header>
    );
};

// --- HistoryModal.tsx ---
interface HistoryModalProps {
    history: DiceRoll[];
    onRequestClear: () => void;
    onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, onRequestClear, onClose }) => {
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };
    return (
        <Modal title="Histórico de Rolagens" onClose={onClose}>
            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2 mb-4">
                {history.length > 0 ? (
                    history.map(roll => (
                        <div key={roll.id} className="bg-stone-800 p-2 rounded-md text-sm" style={componentStyle}>
                            <p className="font-bold">Total: {roll.total}</p>
                            <p className="opacity-80">
                                Rolagem ({roll.type}): {roll.result}
                                {roll.attribute && ` + ${roll.bonus} (${roll.attribute})`}
                            </p>
                            <p className="text-xs opacity-60 text-right">{roll.timestamp}</p>
                        </div>
                    ))
                ) : (
                    <p className="opacity-70">Nenhuma rolagem registrada.</p>
                )}
            </div>
            <div className="flex gap-2 mt-4">
                    <button
                    onClick={onRequestClear}
                    className="btn-interactive flex-1 py-2 px-4 bg-red-800 hover:bg-red-700 rounded-md text-white"
                >
                    Limpar
                </button>
                <button
                    onClick={onClose}
                    className="btn-interactive flex-1 py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md text-white"
                >
                    Fechar
                </button>
            </div>
        </Modal>
    );
};

// --- Inventory.tsx ---
interface InventoryProps {
    ficha: Ficha;
    onUpdate: (key: 'inventario', value: InventarioItem[]) => void;
    onRecalculate: (ficha: Ficha) => void;
}

const Inventory: React.FC<InventoryProps> = ({ ficha, onUpdate }) => {
    
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

    const pesoColor = ficha.pesoTotal > ficha.capacidadeCarga ? 'text-red-500' : 'var(--text-color)';
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-medieval text-lg">Inventário</h3>
                <span className={`text-sm font-mono`} style={{ color: pesoColor }}>
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
                            style={componentStyle}
                        />
                        <input
                            type="number"
                            value={item.peso}
                            onChange={(e) => handleItemChange(index, 'peso', e.target.value)}
                            className="w-20 p-2 bg-stone-800 border border-stone-600 rounded-md text-center"
                            title="Peso em kg"
                            style={componentStyle}
                        />
                        <button onClick={() => removeItemSlot(index)} className="btn-interactive w-8 h-8 rounded-md bg-red-800 hover:bg-red-700 text-white flex-shrink-0">-</button>
                    </div>
                ))}
            </div>
            <button onClick={addItemSlot} className="btn-interactive mt-2 w-full py-1 bg-stone-700 hover:bg-stone-600 rounded-md text-sm text-white">Adicionar Item</button>
        </div>
    );
};

// --- Locomotion.tsx ---
interface LocomotionProps {
    ficha: Ficha;
    selectedAttribute: string | null;
    setSelectedAttribute: (attr: string | null) => void;
}

const locomotionTooltips: Record<string, string> = {
    velocidadeCorrida: "Corra como o vento! Sua velocidade base é 25 km/h, e cada 3 pontos em Agilidade te deixam 3 km/h mais rápido. A vantagem 'Combo Físico' te transforma num verdadeiro velocista com +25 km/h!",
    alturaPulo: "Alcance os céus! Você já pula 1 metro, e cada 10 pontos em Força te impulsionam 1 metro mais alto. Com o 'Combo Físico', você ganha +2 metros de altura, superando qualquer obstáculo.",
    distanciaPulo: "Cruze abismos com um salto! Seu pulo básico tem 3 metros. Sua Força e Agilidade (a cada 5 pontos em ambos) te impulsionam mais longe. O 'Combo Físico' adiciona impressionantes 6 metros à sua distância!"
};

const LocomotionStat: React.FC<{
    label: string;
    value: number;
    unit: string;
    icon: string;
    attrKey: string;
    selectedAttribute: string | null;
    setSelectedAttribute: (attr: string | null) => void;
}> = ({ label, value, unit, icon, attrKey, selectedAttribute, setSelectedAttribute }) => {
    const isSelected = selectedAttribute === attrKey;

    const toggleSelection = () => {
        setSelectedAttribute(isSelected ? null : attrKey);
    };

    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div className="flex justify-between items-center py-2 px-3 bg-stone-900/50 rounded-md" style={componentStyle}>
             <div className="font-bold flex items-center gap-2">
                <span>{icon}</span>
                <span>{label}</span>
                <Tooltip text={locomotionTooltips[attrKey]}>
                    <span className="cursor-help text-xs opacity-70" aria-label={`Explicação para ${label}`}><QuestionMarkIcon /></span>
                </Tooltip>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-bold text-lg">
                    {value}
                    <span className="text-sm opacity-70 ml-1">{unit}</span>
                </span>
                <button
                    onClick={toggleSelection}
                    className={`transition-all ${isSelected ? 'scale-125' : 'opacity-50 hover:opacity-100'}`}
                    style={{ color: isSelected ? 'var(--accent-color)' : 'var(--text-color)'}}
                    title={`Rolar com ${label}`}
                >
                    <DiceIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const Locomotion: React.FC<LocomotionProps> = ({ ficha, selectedAttribute, setSelectedAttribute }) => {
    return (
        <div className="space-y-2">
            <LocomotionStat 
                label="Velocidade de Corrida"
                value={ficha.velocidadeCorrida}
                unit="km/h"
                icon="🏃‍♂️"
                attrKey="velocidadeCorrida"
                selectedAttribute={selectedAttribute}
                setSelectedAttribute={setSelectedAttribute}
            />
            <LocomotionStat 
                label="Altura do Pulo"
                value={ficha.alturaPulo}
                unit="m"
                icon="⬆️"
                attrKey="alturaPulo"
                selectedAttribute={selectedAttribute}
                setSelectedAttribute={setSelectedAttribute}
            />
            <LocomotionStat 
                label="Distância do Pulo"
                value={ficha.distanciaPulo}
                unit="m"
                icon="➡️"
                attrKey="distanciaPulo"
                selectedAttribute={selectedAttribute}
                setSelectedAttribute={setSelectedAttribute}
            />
        </div>
    );
};

// --- MobileDock.tsx ---
interface MobileDockProps {
    isInventoryActive: boolean;
}

const MobileDock: React.FC<MobileDockProps> = ({ isInventoryActive }) => {
    const activeColor = 'var(--accent-color)';
    const inactiveColor = 'var(--text-color)';
    const activeOpacity = 1;
    const inactiveOpacity = 0.7;

    return (
        <div 
            className="fixed bottom-0 left-1/2 w-24 h-12 sm:hidden flex justify-center items-end pb-1 transition-colors duration-200"
            style={{
                backgroundColor: 'var(--sheet-bg-color)',
                borderTopLeftRadius: '999px',
                borderTopRightRadius: '999px',
                border: 'var(--border-width) solid var(--border-color)',
                borderBottom: 'none',
                transform: 'translateX(-50%) translateY(calc(var(--border-width) * -1))',
                pointerEvents: 'none',
                borderStyle: 'var(--border-style)',
                zIndex: 21,
                color: isInventoryActive ? activeColor : inactiveColor,
                opacity: isInventoryActive ? activeOpacity : inactiveOpacity,
            }}
        >
             <span className="text-2xl" style={{ transform: 'translateY(4px)' }}>🎒</span>
        </div>
    );
};

// --- NotesModal.tsx ---
interface NotesModalProps {
    notes: string;
    onUpdate: (notes: string) => void;
    onClose: () => void;
}

const NotesModal: React.FC<NotesModalProps> = ({ notes, onUpdate, onClose }) => {
    return (
        <Modal title="Anotações" onClose={onClose}>
             <textarea
                value={notes}
                onChange={(e) => onUpdate(e.target.value)}
                className="w-full h-64 p-2 bg-stone-700 border border-stone-600 rounded-md resize-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="Suas anotações aqui..."
                style={{ color: 'var(--text-color)'}}
            />
            <div className="flex justify-end mt-4">
                 <button
                    onClick={onClose}
                    className="btn-interactive py-2 px-6 bg-amber-800 hover:bg-amber-700 rounded-md text-white"
                >
                    Fechar
                </button>
            </div>
        </Modal>
    );
};

// --- NpcGeneratorModal.tsx ---
interface NpcGeneratorModalProps {
    onClose: () => void;
    onGenerate: (level: number, archetype: string) => void;
}

const NpcGeneratorModal: React.FC<NpcGeneratorModalProps> = ({ onClose, onGenerate }) => {
    const [level, setLevel] = useState(0);
    const [archetype, setArchetype] = useState('Equilibrado');

    const archetypes = ['Guerreiro', 'Mago', 'Ladino', 'Tanque', 'Equilibrado', 'Aleatório'];
    
    const componentStyle = { color: 'var(--text-color)'};

    return (
        <Modal title="Gerador de NPC" onClose={onClose}>
            <div className="space-y-4" style={componentStyle}>
                <div>
                    <label className="block font-bold mb-2">Nível: <span style={{color: 'var(--accent-color)'}}>{level}</span></label>
                    <input
                        type="range"
                        min="0"
                        max="30"
                        value={level}
                        onChange={(e) => setLevel(parseInt(e.target.value))}
                        className="w-full"
                    />
                </div>
                 <div>
                    <label className="block font-bold mb-2">Arquétipo</label>
                    <select value={archetype} onChange={e => setArchetype(e.target.value)} className="w-full p-2 bg-stone-700 rounded" style={componentStyle}>
                        {archetypes.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                <div className="pt-4 border-t border-stone-600">
                     <button
                        onClick={() => onGenerate(level, archetype)}
                        className="btn-interactive w-full py-3 bg-amber-700 hover:bg-amber-600 rounded-md font-bold text-white"
                    >
                        Gerar NPC
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// --- PasswordModal.tsx ---
interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    title?: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSuccess, title = "Confirmação Necessária" }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setError('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        if (password === '1040') {
            onSuccess();
        } else {
            setError('Senha incorreta. Tente novamente.');
            setPassword('');
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleConfirm();
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <Modal title={title} onClose={onClose}>
            <p className="mb-2">Por favor, insira a senha para continuar.</p>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-2 border rounded bg-stone-700 border-stone-600 focus:ring-amber-500 focus:border-amber-500"
                style={{ color: 'var(--text-color)' }}
                autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
                <button onClick={onClose} className="btn-interactive px-4 py-2 bg-stone-600 rounded text-white">Cancelar</button>
                <button onClick={handleConfirm} className="btn-interactive px-4 py-2 bg-amber-700 rounded text-white">Confirmar</button>
            </div>
        </Modal>
    );
};

// --- RacasPanel.tsx ---
interface RacasPanelProps {
    ficha: Ficha;
    pontosVantagemDisponiveis: number;
    onUpdate: <K extends keyof Ficha>(key: K, value: Ficha[K]) => void;
    onClose: () => void;
}

const RacasPanel: React.FC<RacasPanelProps> = ({ ficha, pontosVantagemDisponiveis, onUpdate, onClose }) => {
    const [tempRaca, setTempRaca] = useState<string | null>(ficha.racaSelecionada);
    const [showSavedMessage, setShowSavedMessage] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    useEffect(() => {
        setTempRaca(ficha.racaSelecionada);
    }, [ficha.racaSelecionada]);

    const calcularPHRestante = (selectedRaca: string | null) => {
        let ph = ficha.pontosVantagemTotais;

        ficha.vantagens.forEach(v => ph -= (vantagensData.find(vd => vd.nome === v)?.custo || 0));
        ficha.desvantagens.forEach(d => ph += (desvantagensData.find(dd => dd.nome === d)?.ganho || 0));
        
        if(ficha.racaSelecionada){
             ph += racasData.find(r => r.nome === ficha.racaSelecionada)?.custo || 0;
        }
        
        if(selectedRaca) {
            ph -= racasData.find(r => r.nome === selectedRaca)?.custo || 0;
        }

        return ph;
    };
    
    const phRestante = calcularPHRestante(tempRaca);

    const handleSelectRaca = (nome: string, custo: number) => {
        if (ficha.racaSelecionada) {
            alert("Uma raça já foi selecionada. Para alterar, use a opção 'Excluir...' na ficha.");
            return;
        }

        if (tempRaca === nome) {
            setTempRaca(null);
        } else if (calcularPHRestante(nome) >= 0) {
            setTempRaca(nome);
        } else {
            alert("Pontos de Vantagem insuficientes para selecionar esta raça!");
        }
    };
    
    const handleSave = () => {
        onUpdate('racaSelecionada', tempRaca);
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000);
    };
    
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };
    const isRaceLocked = !!ficha.racaSelecionada;

    return (
        <div className={`fixed inset-0 bg-black/80 z-40 flex flex-col p-4 ${isClosing ? 'modal-exit' : 'modal-enter'}`}>
            <div className="bg-stone-900 rounded-lg p-4 flex-grow flex flex-col border border-stone-700 relative min-h-0">
                <button onClick={handleClose} className="absolute top-4 right-4 text-3xl font-bold text-yellow-500 hover:text-yellow-400 z-10">&times;</button>
                <div className="text-center mb-4">
                    <h2 className="text-3xl font-medieval">Raças</h2>
                    <p>Pontos Restantes Após Seleção: <span className={`font-bold text-lg ${phRestante < 0 ? 'text-red-500' : 'text-green-400'}`}>{phRestante}</span></p>
                    <div className="mt-2 flex justify-center items-center gap-4">
                         <button 
                            onClick={handleSave} 
                            className="btn-interactive py-2 px-6 bg-amber-700 hover:bg-amber-600 rounded-md text-white disabled:bg-stone-600 disabled:cursor-not-allowed" 
                            disabled={isRaceLocked || tempRaca === ficha.racaSelecionada}
                         >
                            Salvar
                        </button>
                        {showSavedMessage && <span className="text-green-400 text-sm">Salvo!</span>}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto space-y-3 pr-2 min-h-0">
                    {racasData.map(raca => {
                        const isSelected = tempRaca === raca.nome;
                        const isSavedAndLocked = isRaceLocked && ficha.racaSelecionada === raca.nome;
                        const isDisabled = isRaceLocked && !isSavedAndLocked;

                        let containerClasses = 'p-3 rounded transition-all border-2 ';
                        if (isSavedAndLocked) {
                            containerClasses += 'border-amber-700 bg-amber-900/70 cursor-default';
                        } else if (isDisabled) {
                            containerClasses += 'border-transparent bg-stone-800 opacity-50 cursor-not-allowed';
                        } else if (isSelected) {
                            containerClasses += 'border-amber-500 bg-amber-900/50 cursor-pointer';
                        } else {
                            containerClasses += 'border-transparent bg-stone-800 hover:bg-stone-700 cursor-pointer';
                        }
                        
                        return (
                         <div 
                            key={raca.nome} 
                            onClick={() => handleSelectRaca(raca.nome, raca.custo)} 
                            className={containerClasses}
                            style={isSavedAndLocked || isSelected ? {} : componentStyle}
                         >
                            <h3 className="font-medieval text-lg" style={{ color: 'var(--accent-color)' }}>{raca.nome} ({raca.custo} PH)</h3>
                            <p className="text-sm mb-2">{raca.descricao}</p>
                            <ul className="list-disc list-inside text-xs opacity-70 space-y-1">
                                {raca.vantagens.map(v => <li key={v}>{v}</li>)}
                            </ul>
                        </div>
                    )})}
                </div>
            </div>
        </div>
    );
};

// --- ClassesPanel.tsx ---
interface ClassesPanelProps {
    ficha: Ficha;
    pontosVantagemDisponiveis: number;
    onUpdate: <K extends keyof Ficha>(key: K, value: Ficha[K]) => void;
    onClose: () => void;
}

const ClassesPanel: React.FC<ClassesPanelProps> = ({ ficha, pontosVantagemDisponiveis, onUpdate, onClose }) => {
    const [tempClasse, setTempClasse] = useState<string | null>(ficha.classeSelecionada);
    const [showSavedMessage, setShowSavedMessage] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    useEffect(() => {
        setTempClasse(ficha.classeSelecionada);
    }, [ficha.classeSelecionada]);

    const calcularPHRestante = (selectedClasse: string | null) => {
        let ph = ficha.pontosVantagemTotais;

        ficha.vantagens.forEach(v => ph -= (vantagensData.find(vd => vd.nome === v)?.custo || 0));
        ficha.desvantagens.forEach(d => ph += (desvantagensData.find(dd => dd.nome === d)?.ganho || 0));
        if (ficha.racaSelecionada) {
            ph -= racasData.find(r => r.nome === ficha.racaSelecionada)?.custo || 0;
        }
        
        if (ficha.classeSelecionada) {
             ph += classesData.find(c => c.nome === ficha.classeSelecionada)?.custo || 0;
        }
        
        if (selectedClasse) {
            ph -= classesData.find(c => c.nome === selectedClasse)?.custo || 0;
        }

        return ph;
    };
    
    const phRestante = calcularPHRestante(tempClasse);

    const handleSelectClasse = (nome: string) => {
        if (ficha.classeSelecionada) {
            alert("Uma classe já foi selecionada. Para alterar, use a opção 'Excluir...' na ficha.");
            return;
        }

        if (tempClasse === nome) {
            setTempClasse(null);
        } else if (calcularPHRestante(nome) >= 0) {
            setTempClasse(nome);
        } else {
            alert("Pontos de Vantagem insuficientes para selecionar esta classe!");
        }
    };
    
    const handleSave = () => {
        onUpdate('classeSelecionada', tempClasse);
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000);
    };
    
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };
    const isClasseLocked = !!ficha.classeSelecionada;

    return (
        <div className={`fixed inset-0 bg-black/80 z-40 flex flex-col p-4 ${isClosing ? 'modal-exit' : 'modal-enter'}`}>
            <div className="bg-stone-900 rounded-lg p-4 flex-grow flex flex-col border border-stone-700 relative min-h-0">
                <button onClick={handleClose} className="absolute top-4 right-4 text-3xl font-bold text-yellow-500 hover:text-yellow-400 z-10">&times;</button>
                <div className="text-center mb-4">
                    <h2 className="text-3xl font-medieval">Classes</h2>
                    <p>Pontos Restantes Após Seleção: <span className={`font-bold text-lg ${phRestante < 0 ? 'text-red-500' : 'text-green-400'}`}>{phRestante}</span></p>
                    <div className="mt-2 flex justify-center items-center gap-4">
                         <button 
                            onClick={handleSave} 
                            className="btn-interactive py-2 px-6 bg-amber-700 hover:bg-amber-600 rounded-md text-white disabled:bg-stone-600 disabled:cursor-not-allowed" 
                            disabled={isClasseLocked || tempClasse === ficha.classeSelecionada}
                         >
                            Salvar
                        </button>
                        {showSavedMessage && <span className="text-green-400 text-sm">Salvo!</span>}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto space-y-3 pr-2 min-h-0">
                    {classesData.map(classe => {
                        const isSelected = tempClasse === classe.nome;
                        const isSavedAndLocked = isClasseLocked && ficha.classeSelecionada === classe.nome;
                        const isDisabled = isClasseLocked && !isSavedAndLocked;

                        let containerClasses = 'p-3 rounded transition-all border-2 ';
                        if (isSavedAndLocked) {
                            containerClasses += 'border-amber-700 bg-amber-900/70 cursor-default';
                        } else if (isDisabled) {
                            containerClasses += 'border-transparent bg-stone-800 opacity-50 cursor-not-allowed';
                        } else if (isSelected) {
                            containerClasses += 'border-amber-500 bg-amber-900/50 cursor-pointer';
                        } else {
                            containerClasses += 'border-transparent bg-stone-800 hover:bg-stone-700 cursor-pointer';
                        }
                        
                        return (
                         <div 
                            key={classe.nome} 
                            onClick={() => handleSelectClasse(classe.nome)} 
                            className={containerClasses}
                            style={isSavedAndLocked || isSelected ? {} : componentStyle}
                         >
                            <h3 className="font-medieval text-lg" style={{ color: 'var(--accent-color)' }}>{classe.nome} ({classe.custo} PV)</h3>
                            <p className="text-sm mb-2">{classe.descricao}</p>
                        </div>
                    )})}
                </div>
            </div>
        </div>
    );
};


// --- ResourceBars.tsx ---
interface ResourceBarsProps {
    ficha: Ficha;
    onUpdate: (updates: Partial<Ficha>) => void;
    isGmMode: boolean;
    onGmUpdate: (attr: keyof Ficha, adjustment: number) => void;
}

const resourceTooltips: Record<string, string> = {
    vida: "Sua energia vital, o que te mantém de pé! Sua Vida Total é calculada com base na sua Constituição, com um bônus da sua Força e Nível. Lembre-se, um herói ferido ainda é um herói, mas um herói morto... nem tanto. Sua regeneração por turno é 0.2 * Constituição.",
    magia: "A fonte do seu poder arcano. Sua Magia Total depende da sua Constituição e, para os mais sábios, da sua Inteligência. Gerencie bem este recurso para virar o jogo com feitiços poderosos! Sua regeneração por turno é 0.8 * Constituição.",
    vigor: "Seu fôlego de combate, a estamina para feitos incríveis! Seu Vigor é determinado pela sua Constituição e é essencial para usar habilidades especiais e continuar lutando. Mantenha-o alto para não se cansar no meio da batalha! Sua regeneração por turno é 0.4 * Constituição."
};

const ResourceBar: React.FC<{
    label: string;
    current: number;
    total: number;
    color: string;
    icon: string;
    regeneration: number;
    onCurrentChange: (value: number) => void;
    totalKey: keyof Ficha;
    isGmMode: boolean;
    onGmUpdate: (attr: keyof Ficha, adjustment: number) => void;
    baseTotal: number;
}> = ({ label, current, total, color, icon, regeneration, onCurrentChange, totalKey, isGmMode, onGmUpdate, baseTotal }) => {
    const prevCurrentRef = useRef(current);
    const [ghostPercentage, setGhostPercentage] = useState((current / total) * 100);
    const [shimmer, setShimmer] = useState(false);

    useEffect(() => {
        const percentage = total > 0 ? (current / total) * 100 : 0;
        if (current < prevCurrentRef.current) {
            // Damage taken
            setGhostPercentage((prevCurrentRef.current / total) * 100);
            setTimeout(() => {
                setGhostPercentage(percentage);
            }, 100);
        } else if (current > prevCurrentRef.current) {
            // Healed
            setGhostPercentage(percentage);
            setShimmer(true);
            setTimeout(() => setShimmer(false), 1200);
        } else {
             setGhostPercentage(percentage);
        }

        prevCurrentRef.current = current;
    }, [current, total]);

    const percentage = total > 0 ? (current / total) * 100 : 0;

    const handleGmUpdate = (newValue: number) => {
        const adjustment = newValue - baseTotal;
        onGmUpdate(totalKey, adjustment);
    };

    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div className="bg-stone-900/50 p-3 rounded-lg" style={componentStyle}>
            <div className="flex justify-between items-center mb-1 text-sm">
                <div className="flex items-center gap-1.5 font-bold">
                    <span>{icon} {label}</span>
                    <Tooltip text={resourceTooltips[label.toLowerCase()]}>
                        <span className="cursor-help text-xs opacity-70" aria-label={`Explicação para ${label}`}><QuestionMarkIcon /></span>
                    </Tooltip>
                </div>
                <div className="font-mono flex items-center gap-1">
                    <span>{current} /</span>
                    <EditableStat
                        value={total}
                        isGmMode={isGmMode}
                        onUpdate={handleGmUpdate}
                        displayClass="font-mono"
                        inputClass="w-16 text-center bg-stone-800 border border-stone-600 rounded-md"
                    />
                </div>
            </div>
            <div className="w-full bg-stone-700 rounded-full h-4 overflow-hidden border border-stone-600 relative">
                <div
                    className="absolute top-0 left-0 h-full bg-black/30 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${ghostPercentage}%` }}
                ></div>
                <div
                    className={`${color} h-4 rounded-full transition-all duration-300 ease-out relative overflow-hidden ${shimmer ? 'shimmer-bar' : ''}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <div className="flex items-center justify-center mt-2 gap-2">
                <button onClick={() => onCurrentChange(Math.max(0, current - 1))} className="btn-interactive w-8 h-8 rounded-full bg-stone-700 hover:bg-stone-600 text-white">-</button>
                <input
                    type="number"
                    value={current}
                    onChange={(e) => onCurrentChange(Math.max(0, Math.min(total, parseInt(e.target.value) || 0)))}
                    className="w-16 text-center bg-stone-800 border border-stone-600 rounded-md"
                />
                <button onClick={() => onCurrentChange(Math.min(total, current + 1))} className="btn-interactive w-8 h-8 rounded-full bg-stone-700 hover:bg-stone-600 text-white">+</button>
            </div>
            <div className="text-center text-xs opacity-70 mt-2">
                Regeneração: {regeneration}/turno
            </div>
        </div>
    );
};

const ResourceBars: React.FC<ResourceBarsProps> = ({ ficha, onUpdate, isGmMode, onGmUpdate }) => {
    const baseVidaTotal = Math.ceil(50 + (ficha.constituicao * (3 + Math.floor(ficha.forca / 10))) + 10 * ficha.nivel);
    const baseMagiaTotal = Math.ceil(20 + 3 * ficha.constituicao + (ficha.inteligencia >= 10 ? ficha.constituicao * Math.floor(ficha.inteligencia / 10) : 0));
    const baseVigorTotal = parseFloat((10 + 0.4 * ficha.constituicao).toFixed(1));

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResourceBar
                label="Vida"
                icon="❤️"
                current={ficha.vidaAtual}
                total={ficha.vidaTotal}
                baseTotal={baseVidaTotal}
                regeneration={ficha.regeneracaoVida}
                color="bg-red-500"
                onCurrentChange={(val) => onUpdate({vidaAtual: val})}
                totalKey="vidaTotal"
                isGmMode={isGmMode}
                onGmUpdate={onGmUpdate}
            />
            <ResourceBar
                label="Magia"
                icon="✨"
                current={ficha.magiaAtual}
                total={ficha.magiaTotal}
                baseTotal={baseMagiaTotal}
                regeneration={ficha.regeneracaoMagia}
                color="bg-blue-500"
                onCurrentChange={(val) => onUpdate({magiaAtual: val})}
                totalKey="magiaTotal"
                isGmMode={isGmMode}
                onGmUpdate={onGmUpdate}
            />
            <ResourceBar
                label="Vigor"
                icon="⚡"
                current={ficha.vigorAtual}
                total={ficha.vigorTotal}
                baseTotal={baseVigorTotal}
                regeneration={ficha.regeneracaoVigor}
                color="bg-yellow-500"
                onCurrentChange={(val) => onUpdate({vigorAtual: val})}
                totalKey="vigorTotal"
                isGmMode={isGmMode}
                onGmUpdate={onGmUpdate}
            />
        </div>
    );
};

// --- Skills.tsx ---
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
                            className="p-2 bg-stone-700 border border-stone-600 rounded-md disabled:bg-stone-800 disabled:opacity-70"
                        />
                         <input
                            type="number"
                            placeholder="⚡ Custo"
                            title="Custo de Vigor"
                            value={skill.custoVigor}
                            step="0.1"
                            onChange={(e) => handleSkillChange(index, 'custoVigor', e.target.value, isClassSkill)}
                            disabled={isClassSkill && !isGmMode}
                            className="p-2 bg-stone-700 border border-stone-600 rounded-md disabled:bg-stone-800 disabled:opacity-70"
                        />
                        <input
                            type="text"
                            placeholder="Dano/Efeito"
                            value={skill.dano}
                            onChange={(e) => handleSkillChange(index, 'dano', e.target.value, isClassSkill)}
                            disabled={isClassSkill && !isGmMode}
                            className="p-2 bg-stone-700 border border-stone-600 rounded-md col-span-2 sm:col-span-1 disabled:bg-stone-800 disabled:opacity-70"
                        />
                        <select
                            value={skill.tipo}
                            onChange={(e) => handleSkillChange(index, 'tipo', e.target.value, isClassSkill)}
                            disabled={isClassSkill && !isGmMode}
                            className="p-2 bg-stone-700 border border-stone-600 rounded-md disabled:bg-stone-800 disabled:opacity-70"
                            style={{ color: 'var(--text-color)' }}
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

// --- TabBar.tsx ---
interface TabBarProps {
    activeTab: string;
    onTabClick: (tab: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabClick }) => {
    const tabs = [
        { id: 'principal', icon: '🛡️', label: 'Principal' },
        { id: 'atributos', icon: '💪', label: 'Atributos' },
        { id: 'inventario', icon: '🎒', label: 'Inventário' },
        { id: 'habilidades', icon: '✨', label: 'Habilidades' },
        { id: 'perfil', icon: '👤', label: 'Perfil' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-700 flex justify-around sm:hidden z-20" style={{ backgroundColor: 'var(--sheet-bg-color)', borderColor: 'var(--border-color)'}}>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabClick(tab.id)}
                    className={`flex flex-col items-center justify-center pt-2 pb-1 w-full text-xs transition-colors duration-200`}
                    style={{ 
                        color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-color)', 
                        opacity: (activeTab !== tab.id && tab.id !== 'inventario') ? 0.7 : 1,
                    }}
                    aria-label={tab.label}
                >
                    {tab.id !== 'inventario' ? (
                        <>
                            <span className="text-2xl">{tab.icon}</span>
                            <span className="mt-1">{tab.label}</span>
                            {activeTab === tab.id && <div className="w-10 h-1 rounded-full mt-1" style={{ backgroundColor: 'var(--accent-color)' }}></div>}
                        </>
                    ) : (
                        <div className="w-full h-[52px]">&nbsp;</div>
                    )}
                </button>
            ))}
        </div>
    );
};


// --- VantagensDesvantagensPanel.tsx ---
interface VantagensDesvantagensPanelProps {
    ficha: Ficha;
    pontosVantagemDisponiveis: number;
    onBulkUpdate: (updates: Partial<Ficha>) => void;
    onClose: () => void;
}

const VantagensDesvantagensPanel: React.FC<VantagensDesvantagensPanelProps> = ({ ficha, pontosVantagemDisponiveis, onBulkUpdate, onClose }) => {
    const [tempVantagens, setTempVantagens] = useState([...ficha.vantagens]);
    const [tempDesvantagens, setTempDesvantagens] = useState([...ficha.desvantagens]);
    const [showSavedMessage, setShowSavedMessage] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    useEffect(() => {
        setTempVantagens([...ficha.vantagens]);
        setTempDesvantagens([...ficha.desvantagens]);
    }, [ficha.vantagens, ficha.desvantagens]);

    const calcularPHRestante = () => {
        let ph = pontosVantagemDisponiveis;
        
        ficha.vantagens.forEach(v => ph += (vantagensData.find(vd => vd.nome === v)?.custo || 0));
        ficha.desvantagens.forEach(d => ph -= (desvantagensData.find(dd => dd.nome === d)?.ganho || 0));

        tempVantagens.forEach(v => ph -= (vantagensData.find(vd => vd.nome === v)?.custo || 0));
        tempDesvantagens.forEach(d => ph += (desvantagensData.find(dd => dd.nome === d)?.ganho || 0));

        return ph;
    };
    
    const phRestante = calcularPHRestante();

    const toggleVantagem = (nome: string, custo: number) => {
        const isAlreadySaved = ficha.vantagens.includes(nome);
        if (isAlreadySaved) {
            return;
        }

        const vantagem = vantagensData.find(v => v.nome === nome);
        
        if (vantagem?.restricao === 'inicio' && ficha.nivel > 0 && !tempVantagens.includes(nome)) {
            alert("Esta vantagem só pode ser comprada no nível 0.");
            return;
        }

        if (tempVantagens.includes(nome)) {
            setTempVantagens(tempVantagens.filter(v => v !== nome));
        } else if (phRestante >= custo) {
            setTempVantagens([...tempVantagens, nome]);
        } else {
            alert("Pontos de Vantagem insuficientes!");
        }
    };
    
    const toggleDesvantagem = (nome: string) => {
         const isAlreadySaved = ficha.desvantagens.includes(nome);
        if (isAlreadySaved) {
            return;
        }

        if (tempDesvantagens.includes(nome)) {
            setTempDesvantagens(tempDesvantagens.filter(d => d !== nome));
        } else {
             if (ficha.nivel > 0) {
                alert("Desvantagens só podem ser adquiridas no nível 0.");
                return;
            }
            if(tempDesvantagens.length >= 3) {
                alert("Você pode ter no máximo 3 desvantagens!");
                return;
            }
            setTempDesvantagens([...tempDesvantagens, nome]);
        }
    };
    
    const handleSave = () => {
        onBulkUpdate({
            vantagens: tempVantagens,
            desvantagens: tempDesvantagens,
        });
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000);
    };
    
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    const arraysAreEqual = (a: string[], b: string[]) => {
        if (a.length !== b.length) return false;
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.every((value, index) => value === sortedB[index]);
    };

    const hasChanges = !arraysAreEqual(tempVantagens, ficha.vantagens) || !arraysAreEqual(tempDesvantagens, ficha.desvantagens);

    return (
        <div className={`fixed inset-0 bg-black/80 z-40 flex flex-col p-4 ${isClosing ? 'modal-exit' : 'modal-enter'}`}>
            <div className="bg-stone-900 rounded-lg p-4 flex-grow flex flex-col border border-stone-700 relative min-h-0">
                <button onClick={handleClose} className="absolute top-4 right-4 text-3xl font-bold text-yellow-500 hover:text-yellow-400 z-10">&times;</button>
                <div className="text-center mb-4 flex-shrink-0">
                    <h2 className="text-3xl font-medieval">Vantagens e Desvantagens</h2>
                    <p>Pontos Restantes: <span className={`font-bold text-lg ${phRestante < 0 ? 'text-red-500' : 'text-green-400'}`}>{phRestante}</span></p>
                    <div className="mt-2 flex justify-center items-center gap-4">
                        <button onClick={handleSave} className="btn-interactive py-2 px-6 bg-amber-700 hover:bg-amber-600 rounded-md text-white disabled:bg-stone-600 disabled:cursor-not-allowed" disabled={!hasChanges}>
                            Salvar
                        </button>
                        {showSavedMessage && <span className="text-green-400 text-sm">Salvo!</span>}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 flex-grow min-h-0">
                    {/* Vantagens Column */}
                    <div className="flex flex-col space-y-2 flex-1 min-h-0">
                        <h3 className="text-xl font-medieval text-center flex-shrink-0">Vantagens</h3>
                        <div className="overflow-y-auto pr-2 space-y-1 p-2 rounded-md border border-stone-700" style={componentStyle}>
                            {vantagensData.map(v => {
                                const isSelected = tempVantagens.includes(v.nome);
                                const isSaved = ficha.vantagens.includes(v.nome);
                                return (
                                <div 
                                    key={v.nome} 
                                    onClick={() => toggleVantagem(v.nome, v.custo)} 
                                    className={`p-2 rounded transition-colors text-sm ${
                                        isSaved 
                                        ? 'bg-amber-900/70 cursor-not-allowed' 
                                        : isSelected 
                                            ? 'bg-green-800/50 cursor-pointer' 
                                            : 'hover:bg-stone-700/50 cursor-pointer'
                                    }`}
                                >
                                    <strong>{v.nome}</strong> ({v.custo} PH) <p className="text-xs opacity-70">{v.descricao}</p>
                                </div>
                            )})}
                        </div>
                    </div>
                    
                    {/* Desvantagens Column */}
                    <div className="flex flex-col space-y-2 flex-1 min-h-0">
                        <h3 className="text-xl font-medieval text-red-500 text-center flex-shrink-0">Desvantagens</h3>
                        <div className="overflow-y-auto pr-2 space-y-1 p-2 rounded-md border border-stone-700" style={componentStyle}>
                            {desvantagensData.map(d => {
                                const isSelected = tempDesvantagens.includes(d.nome);
                                const isSaved = ficha.desvantagens.includes(d.nome);
                                return (
                                <div 
                                    key={d.nome} 
                                    onClick={() => toggleDesvantagem(d.nome)} 
                                    className={`p-2 rounded transition-colors text-sm ${
                                        isSaved 
                                        ? 'bg-amber-900/70 cursor-not-allowed' 
                                        : isSelected 
                                            ? 'bg-red-800/50 cursor-pointer' 
                                            : 'hover:bg-stone-700/50 cursor-pointer'
                                    }`}
                                >
                                    <strong>{d.nome}</strong> (+{d.ganho} PH) <p className="text-xs opacity-70">{d.descricao}</p>
                                </div>
                            )})}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Vitals.tsx ---
interface VitalsProps {
    ficha: Ficha;
    onBulkUpdate: (updates: Partial<Ficha>) => void;
    pontosVantagemDisponiveis: number;
    isGmMode: boolean;
    onGmUpdate: (attr: keyof Ficha, adjustment: number) => void;
    levelUpEffect: boolean;
}

const Vitals: React.FC<VitalsProps> = ({ ficha, onBulkUpdate, pontosVantagemDisponiveis, isGmMode, onGmUpdate, levelUpEffect }) => {
    const [isAddingExp, setIsAddingExp] = useState(false);
    const [expToAdd, setExpToAdd] = useState('');

    const pdAnimated = useCountUp(ficha.pontosHabilidadeDisponiveis);
    const pvAnimated = useCountUp(pontosVantagemDisponiveis);

    const handleAddExp = () => {
        const toAdd = parseInt(expToAdd, 10);
        if (toAdd > 0) {
            const newExp = ficha.experiencia + toAdd;
            const newLockedExp = Math.max(ficha.lockedExperiencia, newExp);
            onBulkUpdate({ experiencia: newExp, lockedExperiencia: newLockedExp });
        }
        setIsAddingExp(false);
        setExpToAdd('');
    };

    const handleGmUpdateExp = (newExp: number) => {
        onBulkUpdate({ experiencia: newExp, lockedExperiencia: newExp });
    };

    const handleGmUpdatePd = (newAvailablePd: number) => {
        const spentPd = ficha.pontosHabilidadeTotais - ficha.pontosHabilidadeDisponiveis;
        const newTotalPd = spentPd + newAvailablePd;
        const levelBasedPd = nivelData.find(n => n.nivel === ficha.nivel)?.pd ?? nivelData[0].pd;
        const adjustment = newTotalPd - levelBasedPd;
        onGmUpdate('pontosHabilidadeTotais', adjustment);
    };

    const handleGmUpdatePv = (newAvailablePv: number) => {
        const spentPv = ficha.pontosVantagemTotais - pontosVantagemDisponiveis;
        const newTotalPv = spentPv + newAvailablePv;
        const levelBasedPv = nivelData.find(n => n.nivel === ficha.nivel)?.ph ?? nivelData[0].ph;
        const adjustment = newTotalPv - levelBasedPv;
        onGmUpdate('pontosVantagemTotais', adjustment);
    };

    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-stone-800 p-3 rounded-lg" style={componentStyle}>
                <label className="text-sm opacity-70 block">Nível</label>
                <span className={`text-2xl sm:text-3xl font-bold ${levelUpEffect ? 'level-up-number-pop-animation' : ''}`} style={{ color: 'var(--accent-color)' }}>{ficha.nivel}</span>
            </div>
            <div className="bg-stone-800 p-3 rounded-lg flex flex-col justify-center" style={componentStyle}>
                <label className="text-sm opacity-70 block">Experiência</label>
                {isAddingExp ? (
                    <>
                        <input
                            type="number"
                            value={expToAdd}
                            onChange={e => setExpToAdd(e.target.value)}
                            placeholder="Adicionar EXP"
                            className="w-full bg-stone-700 text-xl font-bold text-center rounded-md p-1 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            autoFocus
                        />
                        <div className="flex gap-2 justify-center mt-2">
                            <button onClick={() => { setIsAddingExp(false); setExpToAdd(''); }} className="btn-interactive px-3 py-1 bg-stone-600 hover:bg-stone-500 text-xs rounded text-white">Cancelar</button>
                            <button onClick={handleAddExp} className="btn-interactive px-3 py-1 bg-green-700 hover:bg-green-600 text-xs rounded text-white">Salvar</button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center gap-2">
                         <EditableStat
                            value={ficha.experiencia}
                            isGmMode={isGmMode}
                            onUpdate={handleGmUpdateExp}
                            displayClass="text-2xl sm:text-3xl font-bold"
                            inputClass="w-full bg-transparent text-2xl sm:text-3xl font-bold text-center appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        {!isGmMode && (
                             <button onClick={() => setIsAddingExp(true)} title="Adicionar Experiência" className="btn-interactive text-xl bg-green-800 hover:bg-green-700 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-white">+</button>
                        )}
                    </div>
                )}
            </div>
            <div className="bg-stone-800 p-3 rounded-lg" style={componentStyle}>
                <label className="text-sm opacity-70 block">PD Disponíveis</label>
                <EditableStat
                    value={pdAnimated}
                    isGmMode={isGmMode}
                    onUpdate={handleGmUpdatePd}
                    displayClass={`text-2xl sm:text-3xl font-bold ${ficha.pontosHabilidadeDisponiveis < 0 ? 'text-red-500' : ''}`}
                    inputClass="w-full bg-transparent text-2xl sm:text-3xl font-bold text-center appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
            </div>
            <div className="bg-stone-800 p-3 rounded-lg" style={componentStyle}>
                <label className="text-sm opacity-70 block">PV Disponíveis</label>
                <EditableStat
                    value={pvAnimated}
                    isGmMode={isGmMode}
                    onUpdate={handleGmUpdatePv}
                    displayClass={`text-2xl sm:text-3xl font-bold ${pontosVantagemDisponiveis < 0 ? 'text-red-500' : ''}`}
                    inputClass="w-full bg-transparent text-2xl sm:text-3xl font-bold text-center appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
            </div>
        </div>
    );
};

// --- CharacterImage.tsx ---
interface CharacterImageProps {
    image: string | null;
    onUpdate: (image: string | null) => void;
}

const CharacterImage: React.FC<CharacterImageProps> = ({ image, onUpdate }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the file dialog
        onUpdate(null);
    };
    
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div
            onClick={handleImageClick}
            className="w-32 h-40 flex-shrink-0 rounded-lg bg-stone-800 border-2 border-dashed border-stone-600 flex flex-col items-center justify-center text-center p-2 cursor-pointer hover:bg-stone-700 transition-colors relative group"
            title="Alterar imagem do personagem"
            style={componentStyle}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            {image ? (
                <>
                    <img src={image} alt="Personagem" className="w-full h-full object-cover rounded-md" />
                    <button
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 bg-red-700/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover Imagem"
                    >
                        X
                    </button>
                </>
            ) : (
                <div className="opacity-70 text-sm">
                    <span className="text-3xl">🖼️</span>
                    <p>Adicionar Imagem</p>
                </div>
            )}
        </div>
    );
};

// --- ClasseHabilidadesModal.tsx ---
interface ClasseHabilidadesModalProps {
    ficha: Ficha;
    pontosVantagemDisponiveis: number;
    onUpdate: (updates: Partial<Ficha>) => void;
    onClose: () => void;
    isOpeningAfterLevelUp: boolean;
}

const SoulOrb = () => <div className="soul-orb"></div>;

const ClasseHabilidadesModal: React.FC<ClasseHabilidadesModalProps> = ({
    ficha,
    pontosVantagemDisponiveis,
    onUpdate,
    onClose,
    isOpeningAfterLevelUp
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
                         <div className="flex justify-center items-center gap-2 h-10 mt-1">
                            {almasRestantes > 0 ? (
                                Array.from({ length: almasRestantes }).map((_, i) => <SoulOrb key={i} />)
                            ) : (
                                <span className="text-2xl font-bold">0</span>
                            )}
                        </div>
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


// ==========================================================================================
// Conteúdo de: App.tsx
// ==========================================================================================

const App: React.FC = () => {
    const {
        fichas,
        currentFicha,
        currentFichaId,
        switchFicha,
        updateFicha,
        createFicha,
        deleteFicha,
        importFicha,
        generateNpc,
        resetPontos,
        recomecarFicha,
        resetAesthetics,
        calcularAtributos,
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
    } = useCharacterSheet();

    useDynamicStyles(currentFicha);
    
    const tabsOrder = useMemo(() => ['principal', 'atributos', 'inventario', 'habilidades', 'perfil'], []);
    const [activeTab, setActiveTab] = useState('principal');
    const [tabAnimationClass, setTabAnimationClass] = useState('animate-tab-enter');
    const prevTabIndexRef = useRef(tabsOrder.indexOf('principal'));

    const [isVantagensPanelOpen, setVantagensPanelOpen] = useState(false);
    const [isRacasPanelOpen, setRacasPanelOpen] = useState(false);
    const [isClassesPanelOpen, setClassesPanelOpen] = useState(false);
    const [isClasseHabilidadesModalOpen, setClasseHabilidadesModalOpen] = useState(false);
    const [isNewFichaModalOpen, setNewFichaModalOpen] = useState(false);
    const [isCustomizationOpen, setCustomizationOpen] = useState(false);
    const [isExclusionModalOpen, setExclusionModalOpen] = useState(false);
    const [isNotesModalOpen, setNotesModalOpen] = useState(false);
    const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [isNpcGeneratorOpen, setNpcGeneratorOpen] = useState(false);
    const [newFichaName, setNewFichaName] = useState('');

    const handleUpdate = useCallback(<K extends keyof Ficha>(key: K, value: Ficha[K]) => {
        if (currentFicha) {
            updateFicha(currentFichaId, { [key]: value });
        }
    }, [currentFicha, currentFichaId, updateFicha]);

    const handleBulkUpdate = useCallback((updates: Partial<Ficha>) => {
        if (currentFicha) {
            updateFicha(currentFichaId, updates);
        }
    }, [currentFicha, currentFichaId, updateFicha]);

    useEffect(() => {
      if (currentFicha?.showClasseSkillsNotification) {
          setClasseHabilidadesModalOpen(true);
      }
    }, [currentFicha?.showClasseSkillsNotification]);
    
    const handleTabClick = useCallback((newTab: string) => {
        const oldIndex = prevTabIndexRef.current;
        const newIndex = tabsOrder.indexOf(newTab);

        if (newIndex === oldIndex) return;

        if (newIndex > oldIndex) {
            setTabAnimationClass('animate-slide-in-right');
        } else {
            setTabAnimationClass('animate-slide-in-left');
        }
        
        prevTabIndexRef.current = newIndex;
        setActiveTab(newTab);
    }, [tabsOrder]);


    const handleCreateFicha = () => {
        if (newFichaName.trim()) {
            createFicha(newFichaName.trim());
            setNewFichaName('');
            setNewFichaModalOpen(false);
        }
    };
    
    const handleExportFicha = useCallback(() => {
        if (!currentFicha) return;
        try {
            const fichaJson = JSON.stringify(currentFicha, null, 2);
            const blob = new Blob([fichaJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = (currentFicha.nomePersonagem || currentFicha.nomeFicha || 'ficha_rpg').trim().replace(/\s+/g, '_');
            a.download = `${fileName}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export ficha", error);
            alert("Ocorreu um erro ao exportar a ficha.");
        }
    }, [currentFicha]);

    const handleImportFicha = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const text = event.target?.result;
                    if (typeof text !== 'string') throw new Error("File content is not a string.");
                    
                    const importedFichaData = JSON.parse(text);

                    if (typeof importedFichaData !== 'object' || importedFichaData === null || !('nomeFicha' in importedFichaData)) {
                        throw new Error("Invalid ficha file format.");
                    }
                    importFicha(importedFichaData);
                } catch (error) {
                    console.error("Failed to import ficha", error);
                    alert("Falha ao importar ficha. O arquivo pode estar corrompido ou em formato inválido.");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }, [importFicha]);

    const handleGenerateNpc = (level: number, archetype: string) => {
        generateNpc(level, archetype);
        setNpcGeneratorOpen(false);
    };

    const handleConfirmDelete = () => {
        deleteFicha();
        setConfirmDeleteOpen(false);
    };

    const openExclusionModal = () => {
        setPasswordRequest(() => () => setExclusionModalOpen(true));
    };

    const handleRequestClearHistory = () => {
        setPasswordRequest(() => clearDiceHistory);
    };
    
    if (!currentFicha) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-stone-800 text-white p-4">
                <div className="text-center">
                    <h1 className="text-3xl font-medieval mb-4">Carregando Ficha...</h1>
                    <p>Se a ficha não carregar, por favor, crie uma nova.</p>
                     <button
                        onClick={() => setNewFichaModalOpen(true)}
                        className="mt-4 px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-600 transition-colors"
                    >
                        Criar Nova Ficha
                    </button>
                    {isNewFichaModalOpen && (
                         <Modal title="Criar Nova Ficha" onClose={() => setNewFichaModalOpen(false)}>
                            <input
                                type="text"
                                value={newFichaName}
                                onChange={(e) => setNewFichaName(e.target.value)}
                                placeholder="Nome da Ficha"
                                className="w-full p-2 border rounded bg-stone-700 border-stone-600"
                                style={{ color: 'var(--text-color)' }}
                            />
                            <div className="mt-4 flex justify-end gap-2">
                                <button onClick={() => setNewFichaModalOpen(false)} className="px-4 py-2 bg-stone-600 rounded text-white">Cancelar</button>
                                <button onClick={handleCreateFicha} className="px-4 py-2 bg-amber-700 rounded text-white">Criar</button>
                            </div>
                        </Modal>
                    )}
                </div>
            </div>
        );
    }

    const selectedRacaData = currentFicha.racaSelecionada ? racasData.find(r => r.nome === currentFicha.racaSelecionada) : null;
    const selectedClasseData = currentFicha.classeSelecionada ? classesData.find(c => c.nome === currentFicha.classeSelecionada) : null;
    const almasDisponiveis = currentFicha.almasTotais - currentFicha.almasGastas;
    
    const appClasses = `${currentFicha.darkMode ? 'dark-mode' : 'light-mode'} ${currentFicha.theme}`;
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div className={appClasses}>
            <div id="character-sheet-container" className={`max-w-2xl mx-auto sm:rounded-xl shadow-2xl shadow-black/50 overflow-hidden sm:my-4 ${levelUpEffect ? 'level-up-glow' : ''}`} style={{
                backgroundColor: 'var(--sheet-bg-color)',
                opacity: currentFicha.sheetOpacity / 100,
                borderWidth: `var(--border-width)`,
                borderStyle: `var(--border-style)`,
                borderColor: `var(--border-color)`,
                boxShadow: `var(--sheet-shadow)`,
            }}>
                <Header 
                    fichas={fichas}
                    currentFichaId={currentFichaId}
                    switchFicha={switchFicha}
                    nomePersonagem={currentFicha.nomePersonagem}
                    handleUpdate={handleUpdate}
                    onNewFicha={() => setNewFichaModalOpen(true)}
                    isGmMode={isGmMode}
                    onToggleGmMode={toggleGmMode}
                    onImport={handleImportFicha}
                    onExport={handleExportFicha}
                    onOpenNpcGenerator={() => setNpcGeneratorOpen(true)}
                />
                
                <main className="p-2 sm:p-4">
                    {/* ======== DESKTOP VIEW ======== */}
                    <div className="hidden sm:space-y-4 sm:block">
                        <Section title="Informações Básicas" defaultOpen>
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <textarea
                                    id="descricao-personagem"
                                    placeholder="Descrição do seu personagem"
                                    value={currentFicha.descricaoPersonagem}
                                    onChange={(e) => handleUpdate('descricaoPersonagem', e.target.value)}
                                    className="w-full flex-grow p-2 bg-stone-800 border border-stone-600 rounded-md h-40 resize-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    style={componentStyle}
                                />
                                <CharacterImage
                                    image={currentFicha.characterImage}
                                    onUpdate={(img) => handleUpdate('characterImage', img)}
                                />
                            </div>
                        </Section>

                        <Section title="Recursos">
                            <ResourceBars 
                                ficha={currentFicha} 
                                onUpdate={handleBulkUpdate} 
                                isGmMode={isGmMode}
                                onGmUpdate={updateGmAdjustment}
                            />
                        </Section>

                        <Section title="Atributos">
                            <Attributes 
                                ficha={currentFicha}
                                onBulkUpdate={handleBulkUpdate}
                                selectedAttribute={selectedAttribute}
                                setSelectedAttribute={setSelectedAttribute}
                                isGmMode={isGmMode}
                                onGmUpdate={updateGmAdjustment}
                            />
                        </Section>
                        
                        <Section title="Combate">
                            <Combat 
                                ficha={currentFicha} 
                                onUpdate={handleUpdate} 
                                onRecalculate={calcularAtributos} 
                                isGmMode={isGmMode}
                                onGmUpdate={updateGmAdjustment}
                            />
                        </Section>

                        <Section title="Inventário">
                            <Inventory ficha={currentFicha} onUpdate={handleUpdate as any} onRecalculate={calcularAtributos}/>
                        </Section>

                        <Section title="Habilidades">
                            <Skills ficha={currentFicha} onUpdate={handleBulkUpdate} isGmMode={isGmMode} />
                        </Section>

                        <Section title="Vantagens e Desvantagens">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold" style={{ color: 'var(--accent-color)' }}>Vantagens</h3>
                                    <div className="p-2 bg-stone-800 rounded-md min-h-[4rem] space-y-1" style={componentStyle}>
                                        {currentFicha.vantagens.length > 0 ? (
                                            currentFicha.vantagens.map(v => 
                                                <div key={v} className="text-sm bg-stone-900/50 p-1 rounded" style={componentStyle}>
                                                    <span>{v}</span>
                                                </div>
                                            )
                                        ) : <p className="text-sm opacity-70 italic">Nenhuma vantagem selecionada.</p>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-500">Desvantagens</h3>
                                    <div className="p-2 bg-stone-800 rounded-md min-h-[4rem] space-y-1" style={componentStyle}>
                                        {currentFicha.desvantagens.length > 0 ? (
                                            currentFicha.desvantagens.map(d => 
                                                <div key={d} className="text-sm bg-stone-900/50 p-1 rounded" style={componentStyle}>
                                                    <span>{d}</span>
                                                </div>
                                            )
                                        ) : <p className="text-sm opacity-70 italic">Nenhuma desvantagem selecionada.</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setVantagensPanelOpen(true)} className="btn-interactive py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md text-white">Gerenciar</button>
                                    <button onClick={openExclusionModal} className="btn-interactive py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md text-white">Excluir...</button>
                                </div>
                            </div>
                        </Section>

                        <Section title="Raça e Classe">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="font-bold" style={{ color: 'var(--accent-color)' }}>Raça</label>
                                    <div className="p-3 bg-stone-800 rounded-md min-h-[8rem]" style={componentStyle}>
                                        {selectedRacaData ? (
                                            <>
                                                <h4 className="font-bold text-lg">{selectedRacaData.nome.split(' (')[0]}</h4>
                                                <p className="text-sm opacity-80 mt-1">{selectedRacaData.descricao}</p>
                                            </>
                                        ) : <p className="text-sm opacity-70 italic">Nenhuma raça selecionada.</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                         <button onClick={() => setRacasPanelOpen(true)} className="btn-interactive py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md text-white">Gerenciar</button>
                                         <button onClick={openExclusionModal} className="btn-interactive py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md text-white" disabled={!currentFicha.racaSelecionada}>Excluir...</button>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <label className="font-bold" style={{ color: 'var(--accent-color)' }}>Classe</label>
                                        {selectedClasseData && (
                                            <button 
                                                onClick={() => setClasseHabilidadesModalOpen(true)} 
                                                className={almasDisponiveis > 0 ? "soul-indicator-animation" : ""} 
                                                title="Habilidades de Classe (Almas disponíveis!)"
                                            >
                                                <span className="text-2xl">🛍️</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="p-3 bg-stone-800 rounded-md min-h-[8rem]" style={componentStyle}>
                                         {selectedClasseData ? (
                                            <>
                                                <h4 className="font-bold text-lg">{selectedClasseData.nome}</h4>
                                                <p className="text-sm opacity-80 mt-1">{selectedClasseData.descricao}</p>
                                            </>
                                        ) : <p className="text-sm opacity-70 italic">Nenhuma classe selecionada.</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <button onClick={() => setClassesPanelOpen(true)} className="btn-interactive py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md text-white">
                                            Gerenciar
                                        </button>
                                        <button onClick={openExclusionModal} className="btn-interactive py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md text-white" disabled={!currentFicha.classeSelecionada}>Excluir...</button>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        <Section title="Locomoção">
                            <Locomotion 
                                ficha={currentFicha}
                                selectedAttribute={selectedAttribute}
                                setSelectedAttribute={setSelectedAttribute}
                            />
                        </Section>
                        
                        <Section title="Status">
                             <Vitals 
                                ficha={currentFicha} 
                                onBulkUpdate={handleBulkUpdate} 
                                pontosVantagemDisponiveis={getPontosVantagem()}
                                isGmMode={isGmMode}
                                onGmUpdate={updateGmAdjustment}
                                levelUpEffect={levelUpEffect}
                            />
                        </Section>

                        <Section title="Utilitários">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                               <button onClick={() => setNotesModalOpen(true)} className="btn-interactive py-2 px-4 bg-stone-700 hover:bg-stone-600 rounded-md text-white">
                                    Anotações
                               </button>
                               <button onClick={() => setHistoryModalOpen(true)} className="btn-interactive py-2 px-4 bg-stone-700 hover:bg-stone-600 rounded-md text-white">
                                    Histórico
                               </button>
                            </div>
                        </Section>
                        <div className="space-y-4 pt-4">
                            <Actions 
                                onResetPontos={resetPontos}
                                onRecomecar={recomecarFicha}
                                onRequestDelete={() => setConfirmDeleteOpen(true)}
                            />

                            <div className="flex justify-center items-center gap-4 pt-4">
                                <button onClick={() => handleUpdate('darkMode', false)} title="Modo Claro" className="btn-interactive p-2 w-12 h-12 text-2xl bg-yellow-400 text-black rounded-full">☀️</button>
                                <button onClick={() => setCustomizationOpen(true)} className="btn-interactive py-2 px-6 bg-purple-800 hover:bg-purple-700 rounded-md text-lg text-white">🎨 Customizar</button>
                                <button onClick={() => handleUpdate('darkMode', true)} title="Modo Escuro" className="btn-interactive p-2 w-12 h-12 text-2xl bg-indigo-900 text-white rounded-full">🌙</button>
                            </div>
                        </div>
                    </div>
                     {/* ======== MOBILE TAB VIEW ======== */}
                    <div className="sm:hidden space-y-4 pb-20">
                        <div key={activeTab} className={tabAnimationClass}>
                            {activeTab === 'principal' && (
                                <div className="space-y-4">
                                    <Vitals ficha={currentFicha} onBulkUpdate={handleBulkUpdate} pontosVantagemDisponiveis={getPontosVantagem()} isGmMode={isGmMode} onGmUpdate={updateGmAdjustment} levelUpEffect={levelUpEffect} />
                                    <ResourceBars ficha={currentFicha} onUpdate={handleBulkUpdate} isGmMode={isGmMode} onGmUpdate={updateGmAdjustment} />
                                    <CompactDerivedStats ficha={currentFicha} />
                                    <Locomotion ficha={currentFicha} selectedAttribute={selectedAttribute} setSelectedAttribute={setSelectedAttribute} />
                                </div>
                            )}
                            {activeTab === 'atributos' && (
                                <Attributes ficha={currentFicha} onBulkUpdate={handleBulkUpdate} selectedAttribute={selectedAttribute} setSelectedAttribute={setSelectedAttribute} isGmMode={isGmMode} onGmUpdate={updateGmAdjustment} />
                            )}
                            {activeTab === 'inventario' && (
                                <div className="space-y-4">
                                    <Combat ficha={currentFicha} onUpdate={handleUpdate} onRecalculate={calcularAtributos} isGmMode={isGmMode} onGmUpdate={updateGmAdjustment} />
                                    <Inventory ficha={currentFicha} onUpdate={handleUpdate as any} onRecalculate={calcularAtributos} />
                                </div>
                            )}
                            {activeTab === 'habilidades' && (
                                <Skills ficha={currentFicha} onUpdate={handleBulkUpdate} isGmMode={isGmMode} />
                            )}
                            {activeTab === 'perfil' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-4 items-center">
                                        <textarea id="descricao-personagem-mobile" placeholder="Descrição do seu personagem" value={currentFicha.descricaoPersonagem} onChange={(e) => handleUpdate('descricaoPersonagem', e.target.value)} className="w-full p-2 bg-stone-800 border border-stone-600 rounded-md h-24 resize-none" style={componentStyle} />
                                        <CharacterImage image={currentFicha.characterImage} onUpdate={(img) => handleUpdate('characterImage', img)} />
                                    </div>
                                    <div className="p-3 rounded-lg" style={componentStyle}>
                                        <h3 className="font-bold mb-2" style={{ color: 'var(--accent-color)' }}>Vantagens</h3>
                                        {currentFicha.vantagens.length > 0 ? currentFicha.vantagens.map(v => <div key={v} className="text-sm"><span>{v}</span></div>) : <p className="text-sm opacity-70 italic">Nenhuma.</p>}
                                        <h3 className="font-bold text-red-500 mt-2 mb-1">Desvantagens</h3>
                                        {currentFicha.desvantagens.length > 0 ? currentFicha.desvantagens.map(d => <div key={d} className="text-sm"><span>{d}</span></div>) : <p className="text-sm opacity-70 italic">Nenhuma.</p>}
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <button onClick={() => setVantagensPanelOpen(true)} className="btn-interactive py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md text-white text-sm">Gerenciar</button>
                                            <button onClick={openExclusionModal} className="btn-interactive py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md text-white text-sm">Excluir...</button>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg" style={componentStyle}>
                                         <h3 className="font-bold" style={{ color: 'var(--accent-color)' }}>Raça</h3>
                                         {selectedRacaData ? <p className="text-sm opacity-80 mt-1">{selectedRacaData.nome.split(' (')[0]}: {selectedRacaData.descricao}</p> : <p className="text-sm opacity-70 italic">Nenhuma.</p>}
                                         <div className="grid grid-cols-2 gap-2 mt-2">
                                            <button onClick={() => setRacasPanelOpen(true)} className="btn-interactive py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md text-white text-sm">Gerenciar</button>
                                            <button onClick={openExclusionModal} className="btn-interactive py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md text-white text-sm" disabled={!currentFicha.racaSelecionada}>Excluir...</button>
                                         </div>
                                    </div>
                                    <div className="p-3 rounded-lg" style={componentStyle}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold" style={{ color: 'var(--accent-color)' }}>Classe</h3>
                                            {selectedClasseData && (
                                                <button 
                                                    onClick={() => setClasseHabilidadesModalOpen(true)} 
                                                    className={almasDisponiveis > 0 ? "soul-indicator-animation" : ""} 
                                                    title="Habilidades de Classe (Almas disponíveis!)"
                                                >
                                                    <span className="text-2xl">🛍️</span>
                                                </button>
                                            )}
                                        </div>
                                         {selectedClasseData ? <p className="text-sm opacity-80 mt-1">{selectedClasseData.nome}: {selectedClasseData.descricao}</p> : <p className="text-sm opacity-70 italic">Nenhuma.</p>}
                                         <div className="grid grid-cols-2 gap-2 mt-2">
                                            <button onClick={() => setClassesPanelOpen(true)} className="btn-interactive py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md text-white text-sm">
                                                Gerenciar
                                            </button>
                                            <button onClick={openExclusionModal} className="btn-interactive py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md text-white text-sm" disabled={!currentFicha.classeSelecionada}>Excluir...</button>
                                         </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => setNotesModalOpen(true)} className="btn-interactive py-2 px-4 bg-stone-700 hover:bg-stone-600 rounded-md text-white">Anotações</button>
                                        <button onClick={() => setHistoryModalOpen(true)} className="btn-interactive py-2 px-4 bg-stone-700 hover:bg-stone-600 rounded-md text-white">Histórico</button>
                                    </div>
                                    <Actions onResetPontos={resetPontos} onRecomecar={recomecarFicha} onRequestDelete={() => setConfirmDeleteOpen(true)} />
                                    <div className="flex justify-center items-center gap-4 pt-4">
                                        <button onClick={() => handleUpdate('darkMode', false)} title="Modo Claro" className="btn-interactive p-2 w-12 h-12 text-2xl bg-yellow-400 text-black rounded-full">☀️</button>
                                        <button onClick={() => setCustomizationOpen(true)} className="btn-interactive py-2 px-4 bg-purple-800 hover:bg-purple-700 rounded-md text-white">🎨</button>
                                        <button onClick={() => handleUpdate('darkMode', true)} title="Modo Escuro" className="btn-interactive p-2 w-12 h-12 text-2xl bg-indigo-900 text-white rounded-full">🌙</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </main>
            </div>
            
            <MobileDock isInventoryActive={activeTab === 'inventario'} />
            <TabBar activeTab={activeTab} onTabClick={handleTabClick} />
            <DiceRoller 
                ficha={currentFicha}
                onRoll={rollDice}
                selectedAttribute={selectedAttribute} 
                setSelectedAttribute={setSelectedAttribute}
            />

            {isNotesModalOpen && (
                <NotesModal 
                    notes={currentFicha.anotacoes} 
                    onUpdate={(val) => handleUpdate('anotacoes', val)}
                    onClose={() => setNotesModalOpen(false)}
                />
            )}
            {isHistoryModalOpen && (
                <HistoryModal
                    history={diceHistory}
                    onRequestClear={handleRequestClearHistory}
                    onClose={() => setHistoryModalOpen(false)}
                />
            )}

            {isVantagensPanelOpen && (
                <VantagensDesvantagensPanel
                    ficha={currentFicha}
                    pontosVantagemDisponiveis={getPontosVantagem()}
                    onBulkUpdate={handleBulkUpdate}
                    onClose={() => setVantagensPanelOpen(false)}
                />
            )}
             {isRacasPanelOpen && (
                <RacasPanel
                    ficha={currentFicha}
                    pontosVantagemDisponiveis={getPontosVantagem()}
                    onUpdate={handleUpdate}
                    onClose={() => setRacasPanelOpen(false)}
                />
            )}
            {isClassesPanelOpen && (
                <ClassesPanel
                    ficha={currentFicha}
                    pontosVantagemDisponiveis={getPontosVantagem()}
                    onUpdate={handleUpdate}
                    onClose={() => setClassesPanelOpen(false)}
                />
            )}
             {isClasseHabilidadesModalOpen && (
                <ClasseHabilidadesModal
                    ficha={currentFicha}
                    pontosVantagemDisponiveis={getPontosVantagem()}
                    onUpdate={handleBulkUpdate}
                    onClose={() => {
                        setClasseHabilidadesModalOpen(false);
                        resetClasseNotification();
                    }}
                    isOpeningAfterLevelUp={currentFicha.showClasseSkillsNotification}
                />
            )}

            {isNewFichaModalOpen && (
                 <Modal title="Criar Nova Ficha" onClose={() => setNewFichaModalOpen(false)}>
                    <input
                        type="text"
                        value={newFichaName}
                        onChange={(e) => setNewFichaName(e.target.value)}
                        placeholder="Nome da Ficha"
                        className="w-full p-2 border rounded bg-stone-700 border-stone-600"
                        style={{ color: 'var(--text-color)' }}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => setNewFichaModalOpen(false)} className="btn-interactive px-4 py-2 bg-stone-600 rounded text-white">Cancelar</button>
                        <button onClick={handleCreateFicha} className="btn-interactive px-4 py-2 bg-amber-700 rounded text-white">Criar</button>
                    </div>
                </Modal>
            )}
            {isNpcGeneratorOpen && (
                 <NpcGeneratorModal
                    onClose={() => setNpcGeneratorOpen(false)}
                    onGenerate={handleGenerateNpc}
                 />
            )}
            {isCustomizationOpen && (
                <CustomizationModal 
                    ficha={currentFicha}
                    onClose={() => setCustomizationOpen(false)}
                    onUpdate={handleBulkUpdate}
                    onReset={resetAesthetics}
                />
            )}
             {isExclusionModalOpen && (
                <ExclusionModal
                    ficha={currentFicha}
                    onClose={() => setExclusionModalOpen(false)}
                    onConfirm={excludeItems}
                />
            )}
            {passwordRequest && (
                <PasswordModal
                    isOpen={!!passwordRequest}
                    onClose={closePasswordRequest}
                    onSuccess={() => {
                        if (passwordRequest) {
                            passwordRequest();
                        }
                        closePasswordRequest();
                    }}
                />
            )}
            {isConfirmDeleteOpen && (
                <Modal title="Confirmar Exclusão" onClose={() => setConfirmDeleteOpen(false)}>
                    <p>Tem certeza que deseja excluir a ficha "{currentFicha.nomeFicha}"?</p>
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => setConfirmDeleteOpen(false)} className="btn-interactive px-4 py-2 bg-stone-600 rounded text-white">Não</button>
                        <button onClick={handleConfirmDelete} className="btn-interactive px-4 py-2 bg-red-700 rounded text-white">Sim, Excluir</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// ==========================================================================================
// Ponto de Entrada da Aplicação (originalmente em index.tsx)
// ==========================================================================================

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
