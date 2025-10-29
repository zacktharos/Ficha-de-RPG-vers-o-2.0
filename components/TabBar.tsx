import React from 'react';

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

export default TabBar;
