
import React, { useState, useCallback, useEffect } from 'react';
import { useCharacterSheet } from './hooks/useCharacterSheet';
import { useDynamicStyles } from './hooks/useDynamicStyles';
import { Ficha } from './types';
import { racasData } from './constants';
import Header from './components/Header';
import ResourceBars from './components/ResourceBars';
import Attributes from './components/Attributes';
import Combat from './components/Combat';
import Inventory from './components/Inventory';
import Skills from './components/Skills';
import Vitals from './components/Vitals';
import Actions from './components/Actions';
import DiceRoller from './components/DiceRoller';
import Section from './components/Section';
import VantagensDesvantagensPanel from './components/VantagensDesvantagensPanel';
import RacasPanel from './components/RacasPanel';
import Modal from './components/Modal';
import Locomotion from './components/Locomotion';
import CustomizationModal from './components/CustomizationModal';
import PasswordModal from './components/PasswordModal';
import ExclusionModal from './components/ExclusionModal';
import NotesModal from './components/NotesModal';
import HistoryModal from './components/HistoryModal';

const App: React.FC = () => {
    const {
        fichas,
        currentFicha,
        currentFichaId,
        switchFicha,
        updateFicha,
        createFicha,
        deleteFicha,
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
    } = useCharacterSheet();

    useDynamicStyles(currentFicha);

    const [isVantagensPanelOpen, setVantagensPanelOpen] = useState(false);
    const [isRacasPanelOpen, setRacasPanelOpen] = useState(false);
    const [isNewFichaModalOpen, setNewFichaModalOpen] = useState(false);
    const [isCustomizationOpen, setCustomizationOpen] = useState(false);
    const [isExclusionModalOpen, setExclusionModalOpen] = useState(false);
    const [isNotesModalOpen, setNotesModalOpen] = useState(false);
    const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
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


    const handleCreateFicha = () => {
        if (newFichaName.trim()) {
            createFicha(newFichaName.trim());
            setNewFichaName('');
            setNewFichaModalOpen(false);
        }
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
                                className="w-full p-2 border rounded bg-stone-700 border-stone-600 text-white"
                            />
                            <div className="mt-4 flex justify-end gap-2">
                                <button onClick={() => setNewFichaModalOpen(false)} className="px-4 py-2 bg-stone-600 rounded">Cancelar</button>
                                <button onClick={handleCreateFicha} className="px-4 py-2 bg-amber-700 rounded">Criar</button>
                            </div>
                        </Modal>
                    )}
                </div>
            </div>
        );
    }

    const selectedRacaData = currentFicha.racaSelecionada ? racasData.find(r => r.nome === currentFicha.racaSelecionada) : null;
    
    const appClasses = `${currentFicha.darkMode ? 'dark-mode' : 'light-mode'} ${currentFicha.theme}`;

    return (
        <div className={appClasses}>
            <div id="character-sheet-container" className="max-w-2xl mx-auto rounded-xl shadow-2xl shadow-black/50 overflow-hidden my-4" style={{
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
                />
                
                <main className="p-4 space-y-4">
                    <Section title="Informações Básicas" defaultOpen>
                        <textarea
                            id="descricao-personagem"
                            placeholder="Descrição do seu personagem"
                            value={currentFicha.descricaoPersonagem}
                            onChange={(e) => handleUpdate('descricaoPersonagem', e.target.value)}
                            className="w-full p-2 bg-stone-800 border border-stone-600 rounded-md h-24 resize-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
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
                        <Skills ficha={currentFicha} onUpdate={handleBulkUpdate} />
                    </Section>

                    <Section title="Vantagens e Desvantagens">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-amber-500">Vantagens</h3>
                                <div className="p-2 bg-stone-800 rounded-md min-h-[4rem] space-y-1">
                                    {currentFicha.vantagens.length > 0 ? (
                                        currentFicha.vantagens.map(v => 
                                            <div key={v} className="text-sm text-stone-300 bg-stone-900/50 p-1 rounded">
                                                <span>{v}</span>
                                            </div>
                                        )
                                    ) : <p className="text-sm text-stone-500 italic">Nenhuma vantagem selecionada.</p>}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-red-500">Desvantagens</h3>
                                <div className="p-2 bg-stone-800 rounded-md min-h-[4rem] space-y-1">
                                    {currentFicha.desvantagens.length > 0 ? (
                                        currentFicha.desvantagens.map(d => 
                                            <div key={d} className="text-sm text-stone-300 bg-stone-900/50 p-1 rounded">
                                                <span>{d}</span>
                                            </div>
                                        )
                                    ) : <p className="text-sm text-stone-500 italic">Nenhuma desvantagem selecionada.</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setVantagensPanelOpen(true)} className="py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md transition">Gerenciar</button>
                                <button onClick={openExclusionModal} className="py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md transition">Excluir...</button>
                            </div>
                        </div>
                    </Section>

                    <Section title="Raça e Classe">
                        <div className="space-y-4">
                            <div>
                                <label className="font-bold text-amber-500">Raça</label>
                                <div className="p-3 bg-stone-800 rounded-md min-h-[4rem]">
                                    {selectedRacaData ? (
                                        <>
                                            <h4 className="font-bold text-white text-lg">{selectedRacaData.nome.split(' (')[0]}</h4>
                                            <p className="text-sm text-stone-400 mt-1">{selectedRacaData.descricao}</p>
                                        </>
                                    ) : <p className="text-sm text-stone-500 italic">Nenhuma raça selecionada.</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                     <button onClick={() => setRacasPanelOpen(true)} className="py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md transition">Gerenciar</button>
                                     <button onClick={openExclusionModal} className="py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md transition" disabled={!currentFicha.racaSelecionada}>Excluir...</button>
                                </div>
                            </div>
                            <div>
                                <label className="font-bold text-amber-500 block mb-2">Classe</label>
                                <input 
                                    type="text"
                                    placeholder="Nome da Classe"
                                    value={currentFicha.classeNome || ''}
                                    onChange={e => handleUpdate('classeNome', e.target.value)}
                                    className="w-full p-2 bg-stone-800 border border-stone-600 rounded-md mb-2"
                                />
                                <textarea
                                    placeholder="Descrição da Classe"
                                    value={currentFicha.classeDescricao || ''}
                                    onChange={e => handleUpdate('classeDescricao', e.target.value)}
                                    className="w-full p-2 bg-stone-800 border border-stone-600 rounded-md h-24 resize-none"
                                />
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
                        />
                    </Section>

                    <Section title="Utilitários">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                           <button onClick={() => setNotesModalOpen(true)} className="py-2 px-4 bg-stone-700 hover:bg-stone-600 rounded-md transition-colors">
                                Anotações
                           </button>
                           <button onClick={() => setHistoryModalOpen(true)} className="py-2 px-4 bg-stone-700 hover:bg-stone-600 rounded-md transition-colors">
                                Histórico
                           </button>
                        </div>
                    </Section>

                    <Actions 
                        onResetPontos={resetPontos}
                        onRecomecar={recomecarFicha}
                        onRequestDelete={() => setConfirmDeleteOpen(true)}
                    />

                    <div className="flex justify-center items-center gap-4 pt-4">
                        <button onClick={() => handleUpdate('darkMode', false)} title="Modo Claro" className="p-2 w-12 h-12 text-2xl bg-yellow-400 text-black rounded-full">☀️</button>
                        <button onClick={() => setCustomizationOpen(true)} className="py-2 px-6 bg-purple-800 hover:bg-purple-700 rounded-md transition-colors text-lg">🎨 Customizar</button>
                        <button onClick={() => handleUpdate('darkMode', true)} title="Modo Escuro" className="p-2 w-12 h-12 text-2xl bg-indigo-900 text-white rounded-full">🌙</button>
                    </div>

                </main>
            </div>
            
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
            {isNewFichaModalOpen && (
                 <Modal title="Criar Nova Ficha" onClose={() => setNewFichaModalOpen(false)}>
                    <input
                        type="text"
                        value={newFichaName}
                        onChange={(e) => setNewFichaName(e.target.value)}
                        placeholder="Nome da Ficha"
                        className="w-full p-2 border rounded bg-stone-700 border-stone-600 text-white"
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => setNewFichaModalOpen(false)} className="px-4 py-2 bg-stone-600 rounded">Cancelar</button>
                        <button onClick={handleCreateFicha} className="px-4 py-2 bg-amber-700 rounded">Criar</button>
                    </div>
                </Modal>
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
                        <button onClick={() => setConfirmDeleteOpen(false)} className="px-4 py-2 bg-stone-600 rounded">Não</button>
                        <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-700 rounded">Sim, Excluir</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default App;
