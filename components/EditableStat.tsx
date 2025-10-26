
import React, { useState, useEffect } from 'react';

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
        // Update tempValue if the parent's value changes and we are not editing
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

export default EditableStat;
