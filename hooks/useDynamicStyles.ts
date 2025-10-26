import { useEffect } from 'react';
import { Ficha } from '../types';

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

const clearDynamicStyles = (root: HTMLElement) => {
    document.body.style.fontFamily = '';
    document.body.style.backgroundColor = '';
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundAttachment = '';

    root.style.setProperty('--sheet-bg-color', '');
    root.style.setProperty('--section-bg-color', '');
    root.style.setProperty('--border-color', '');
    root.style.setProperty('--border-style', '');
    root.style.setProperty('--border-width', '');
    root.style.setProperty('--sheet-shadow', '');
};


export const useDynamicStyles = (ficha: Ficha | null) => {
    useEffect(() => {
        if (!ficha) return;

        const root = document.documentElement;

        // If a special theme is active OR dark mode is on, we let the CSS file handle everything.
        // We clear any inline/variable styles to prevent conflicts.
        if (ficha.theme !== 'theme-medieval' || ficha.darkMode) {
            clearDynamicStyles(root);
        } else {
            // This block now ONLY runs for the default medieval theme in LIGHT MODE.
            // This is where user customizations are applied.
            
            // --- Body styles ---
            document.body.style.fontFamily = ficha.fontFamily || "'Inter', sans-serif";
            document.body.style.backgroundColor = ficha.backgroundColor || '#f0e6d2';
            if (ficha.backgroundImage) {
                document.body.style.backgroundImage = `url(${ficha.backgroundImage})`;
                document.body.style.backgroundSize = ficha.backgroundSize || 'cover';
                document.body.style.backgroundAttachment = ficha.backgroundSize === 'cover' ? 'fixed' : 'scroll';
            } else {
                document.body.style.backgroundImage = 'none';
            }

            // --- CSS Variables for sheet and sections ---
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

            // Shadow
            if (ficha.shadowIntensity > 0) {
                const blur = ficha.shadowIntensity * 0.5;
                const spread = ficha.shadowIntensity * 0.2;
                root.style.setProperty('--sheet-shadow', `inset 0 0 ${blur}px ${spread}px ${ficha.shadowColor}`);
            } else {
                root.style.setProperty('--sheet-shadow', 'transparent 0 0 0 0 inset');
            }
        }

    }, [ficha]);
};
