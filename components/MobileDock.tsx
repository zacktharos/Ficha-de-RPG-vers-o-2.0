import React from 'react';

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

export default MobileDock;
