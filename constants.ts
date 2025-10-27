import type { Vantagem, Desvantagem, Raca, NivelInfo } from './types';

export const FICHA_MATRIZ_ID = "ficha-matriz";
export const RGP_FICHAS_KEY = 'rpgFichasMobile';
export const RPG_CURRENT_FICHA_ID_KEY = 'rpgCurrentFichaIdMobile';

export const vantagensData: Vantagem[] = [
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

export const desvantagensData: Desvantagem[] = [
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

export const racasData: Raca[] = [
    { nome: "Humano (3)", custo: 3, descricao: "Versáteis, ambiciosos, mestres em adaptação.", vantagens: ["Explorador Nato: Cavalo superior, equipamentos, mapa.", "Mestre das Profissões: Escolha uma profissão com bônus.", "Rede de Influência: Aliado influente.", "Determinação Inabalável: Ignore uma desvantagem por um curto período."] },
    { nome: "Elfo (4)", custo: 4, descricao: "Sábios, mágicos, conectados à natureza.", vantagens: ["Sabedoria Ancestral: Domina uma área, aprende 1 língua extra.", "Visão Élfica Suprema: Enxerga no escuro, detecta magias fracas.", "Escudo Mágico: Resistência a um tipo de efeito mágico."] },
    { nome: "Anão (4)", custo: 4, descricao: "Resilientes, habilidosos, ligados à terra.", vantagens: ["Fortitude Indomável: Trabalha 3 dias sem descanso, recupera-se 2x mais rápido.", "Artesão: Escolha uma especialidade de criação com bônus.", "Senhor das Profundezas: Nunca se perde no subterrâneo."] },
    { nome: "Orc (3)", custo: 3, descricao: "Guerreiros ferozes, líderes pela força.", vantagens: ["Lenda entre Guerreiros: Inspira temor/respeito.", "Resiliência Brutal: Luta sem penalidades com ferimentos graves.", "Domínio da Intimidação: Força inimigos a render/recuar.", "Fúria Ancestral: Fúria 2x/dia (dobra força/resistência)."] },
    { nome: "Meio Animal (Selvagem) (4)", custo: 4, descricao: "Instinto primal com astúcia.", vantagens: ["Sentidos Predatórios: Escolha um sentido aguçado.", "Senhor dos Terrenos: Adapta-se a 1 ambiente.", "Frenesi Instintivo: 1x/dia, velocidade e ataques extras."] }
];

export const nivelData: NivelInfo[] = [
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
