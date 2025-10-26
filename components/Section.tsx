import React, { useState } from 'react';

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
                className="text-xl font-medieval text-amber-400 p-3 cursor-pointer flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                {title}
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </h2>
            {isOpen && (
                <div className="p-3 pt-0">
                    {children}
                </div>
            )}
        </div>
    );
};

export default Section;