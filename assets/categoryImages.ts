
export interface Category {
    key: string;
    name: string;
    tier?: 'Bronze' | 'Prata' | 'Ouro';
    animal: string;
    image: string;
}

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImciIGN4PSI1MCUiIGN5PSI1MCUiIHI9IjUwJSIgZng9IjUwJSIgZnk9IjUwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzQ0NDtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDA7c3RvcC1vcGFjaXR5OjEiIC8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDgiIGZpbGw9InVybCgjZykiIHN0cm9rZT0iIzIyMiIgc3Ryb2tlLXdpZHRoPSI0Ii8+PHBhdGggZmlsbD0iI2FhYSIgZD0iTTQyLjIyLDMyLjQxYzAtNS40OSw0LjQ1L㖦9.OTQsOS45NC05Ljk0czkuOTQsNC40NSw5Ljk0LDkuOTRjMCwzLjM0LTEuNjYsNi4yOS00LjE4LDguMTMgYy0xLjIsMC44Ny0yLjYxLDIuMTUtMi42MSwzLjc3djIuMDNoLTYuMjl2LTIuMDNjMC0yLjgtMi4wNS00LjUxLTMuNDgtNS41NUM0My4xLDM3LjM4LDQyLjIyLDM1LjAzLDQyLjIyLDMyLjQxek00OC4wOSw1MS44MWg2LjI5IHY2LjI5aC02LjI5VjUxLjgxeiIvPjwvc3ZnPg==";

const wolfIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNjAuOCw0Mi44Yy0yLjQtNy41LTYuMS0xMy42LTkuNi0xOC4xYy0yLjQtMy00LjUtNC4yLTYuNS00LjJjLTIuNiwwLTUuMywyLTkuNiw3LjVjLTMuMSwzLjktNi4zLDkuNC05LjcsMTYuNSBjLTMuNSw3LjMtNi4xLDEzLTYuMSwxNi4yYzAsMS4zLDAuMywyLjQsMSwzLjRjMC43LDEsMS43LDEuNSwzLDEuNWMyLDAsNS4zLTEuOCw5LjgtNS41YzIuMy0xLjksNC4zLTMuNiw1LjgtNSBjLTAuOC0xLjctMS4xLTMuNS0xLjEtNS4zYzAtNC45LDEuNy05LjMsNS4yLTEzYzAuOS0xLDItMS40LDMuMi0xLjRjMS4yLDAsMi4zLDAuNSwzLjIsMS40YzMuNSwzLjcsNS4yLDguMSw1LjIsMTMgYzAsMS44LTAuNCwzLjYtMS4xLDUuM2MxLjYsMS40LDMuNSwzLjIsNS44LDVjNC41LDMuNiw3LjgsNS41LDkuOCw1LjVjMS4zLDAsMi4zLTAuNSwzLTEuNWMwLjctMSwxLTIuMSwxLTMuNCBDNzAuMSw2MC44LDY1LjksNTIuNCw2MC44LDQyLjh6IE01MCw1OC4zYy0yLjQsMC00LjMtMS41LTQuMy0zLjRjMC0xLjksMS45LTMuNCw0LjMtMy40czQuMywxLjUsNC4zLDMuNCBDNTQuMyw1Ni44LDUyLjQsNTguMyw1MCw1OC4zeiIgZmlsbD0iI0ZGRiIvPjwvc3ZnPg==";
const jaguarIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNTAsMjBDMzMuNSwyMCwyMCwzMy41LDIwLDUwczEzLjUsMzAsMzAsMzBzMzAtMTMuNSwzMC0zMFM2Ni41LDIwLDUwLDIweiBNNTAsMjhjMS4xLDAsMiwwLjksMiwycy0wLjksMi0yLDJzLTItMC45LTItMlM0OC45LDI4LDUwLDI4eiBNMzgsNDBjMi4yLDAsNCwxLjgsNCw0cy0xLjgsNC00LDQtNC0xLjgtNC00UzM1LjgsNDAsMzgsNDB6IE02Miw0MGMyLjIsMCw0LDEuOCw0LDRzLTEuOCw0LTQsNHMtNC0xLjgtNC00UzU5LjgsNDAsNjIsNDB6IE02OCw2MmMtNCw0LTEwLDYtMTgsNnMtMTQtMi0xOC02Yy0xLTEtMS0yLjYsMC0zLjZjNC00LDEwLTYsMTgtNnMxNCwyLDE4LDYgQzY5LDU5LjQsNjksNjEsNjgsNjJ6IiBmaWxsPSIjRkZGIi8+PC9zdmc+";
const gorillaIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNDguNCwyOC43Yy0yLjgtMC44LTUuOC0xLjItOC44LTEuMmMtMTEuNSwwLTIxLjYsNi0yNy4xLDE1LjlsLTAuMSwwLjJjLTQuNCw4LTQuOSwxNy43LTEuNCwyNS45YzMuNSw4LjIsMTAuOSwxMy44LDE5LjYsMTUuOCBjMi44LDAuNyw1LjgsMSw4LjgsMS4xYzAuMiwwLDAuNCwwLDAuNiwwYzExLjUtMC4xLDIxLjctNi4yLDI3LjItMTYuMWwwLjEtMC4yYzQuNC04LDQuOC0xNy43LDEuNC0yNS45Yy0zLjUtOC4yLTEwLjktMTMuOC0xOS42LTE1LjhDNTIuMiwyOC45LDQ5LjIsMjguOCw0OC40LDI4Ljd6IE0zNC4yLDQ3LjVjLTIuOCwwLTUsMi4yLTUsNXM0LjUsMyw2LjUsMy41YzIuNSwwLjYsMy41LTAuNSwzLjUtMy41UzQxLjcsNDcuNSwzNC4yLDQ3LjV6IE03Ny4zLDQyLjhsMC4xLTAuMiBjLTUuNS05LjktMTUuNy0xNi0yNy4yLTE2LjFsLTAuNiwwYy0zLTAuMS02LDAuMy04LjgsMS4xYy0wLjgsMC4yLTEuOCwwLjItMi42LDAuNGMtOC43LDItMTYuMiw3LjgtMTkuNiwxNS44Yy0zLjQsOC4yLTIuOSwxNy45LDEuNCwyNS45IGwwLjEsMC4yYzUuNSw5LjksMTUuNywxNiwxNy4yLDE2LjFsMC42LDBjMywwLjEsNi0wLjMsOC44LTEuMWMwLjgtMC4yLDEuOC0wLjIsMi42LTAuNGM4LjctMiwxNi4yLTcuOCwxOS42LTE1LjhjMy41LTguMiwzLTE3LjktMS40LTI1Ljl6IE02NS44LDQ3LjVjLTcuNSwwLTEwLDBsMCwwYy0yLjgsMC01LDIuMi01LDVzNC41LDMsNi41LDMuNWMyLjUsMC42LDMuNS0wLjEsMy41LTMuNVM3My4zLDQ3LjUsNjUuOCw0Ny41eiIgZmlsbD0iI0ZGRiIvPjwvc3ZnPg==";
// FIX: The original tigerIcon string was truncated and had garbage characters at the end. Replaced with a corrected full base64 string.
const tigerIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNTAsMTVDMzAuNywxNSwxNSwzMC43LDE1LDUwczE1LjcsMzUsMzUsMzVzMzUtMTUuNywzNS0zNVM2OS4zLDE1LDUwLDE1eiBNMjYuOSwzMS4yYy0xLjktMS45LTEuOS01LjEsMC03LjEgYzEuOS0xLjksNS4xLTEuOSw3LjEsMGw1LjcsNS43Yy0xLjMsMC43LTIuNSwxLjUtMy41LDIuNUwyNi45LDMxLjJ6IE03My4xLDMxLjJsLTkuNCw5LjRjLTEtMS0yLjItMS44LTMuNS0yLjVsNS43LTUuNyBjMS45LTEuOSw1LjEtMS45LDcuMSwwQzc1LDI2LjIsNzUsMjkuMyw3My4xLDMxLjJ6IE01MCw2NmMtOC44LDAtMTYtNy4yLTE2LTE2czcuMi0xNiwxNi0xNnMxNiw3LjIsMTYsMTZTNTguOCw2Niw1MCw2NnogTTMzLDUwIGMwLDEuNywxLjMsMywzLDNoMjhjMS43LDAsMy0xLjMsMy0zczEuMy0zLDMtM0gzNkMzNC4zLDQ3LDMzLDQ4LjMsMzMsNTB6IE0zOC4xLDcwLjVsOS40LTkuNGMxLDEsMi4yLDEuOCwzLjUsMi41bC01LjcsNS43IGMtMS45LDEuOS01LjEsMS45LTcuMSwwQzM2LjIsNzUuNSwzNi4yLDcyLjQsMzguMSw3MC41eiBNNjEuOSw3MC41YzEuOS0xLjksMS45LTUuMSwwLTcuMWwtNS43LTUuN2MxLjMtMC43LDIuNS0xLjUsMy41LTIuNSBsOS40LDkuNGMxLjksMS45LDEuOSw1LjEsMCw3LjFDNjcsNzIuNCw2My44LDcyLjQsNjEuOSw3MC41eiIgZmlsbD0iI0ZGRiIvPjwvc3ZnPg==";
const dragonIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNTAsMTVDMjkuNiwxNSwxMy4xLDMwLjMsMTUuMyw1MC40QzE3LjYsNzEuMSwzNSw4NSw1MCw4NWMxNSwwLDMyLjQtMTMuOSwzNC43LTM0LjZDODcsMzAuMyw3MC40LDE1LDUwLDE1eiBNNDAsNjUgYy0yLjgsMC01LTIuMi01LTVzMi4yLTUsNS01czUsMi4yLDUsNVM0Mi44LDY1LDQwLDY1eiBNMzAsNTBjLTIuOCwwLTUtMi4yLTUtNXMzLjItNSw1LTVzNSwyLjIsNSw1UzMyLjgsNTAsMzAsNTB6IE02MCw2NSBjLTIuOCwwLTUtMi4yLTUtNXMzLjItNSw1LTVzNSwyLjIsNSw1UzYyLjgsNjUsNjAsNjV6IE03MCw1MGMtMi44LDAtNS0yLjItNS01czIuMi01LDUtNXM1LDIuMiw1LDVTNzIuOCw1MCw3MCw1MHogTTUwLDM1IGMtNS41LDAtMTAsNC41LTEwLDEwaDIwQzYwLDM5LjUsNTUuNSwzNSw1MCwzNXoiIGZmlsbD0iI0ZGRkYiLz48L3N2Zz4=";
// FIX: Added missing bearIcon variable.
const bearIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNTAsMjBjLTE2LjYsMC0zMCwxMy40LTMwLDMwYzAsMTYuNiwxMy40LDMwLDMwLDMwczMwLTEzLjQsMzAtMzBDODAsMzMuNCw2Ni42LDIwLDUwLDIweiBNMzUsNDVjLTIuOCwwLTUtMi4yLTUtNXMyLjItNSw1LTUsMi4yLDUsNVMzNy44LDQ1LDM1LDQ1eiBNNjUsNDVjLTIuOCwwLTUtMi4yLTUtNXMyLjItNSw1LTUsMi4yLDUsNVM2Ny44LDQ1LDY1LDQ1eiBNNTAsNzBjLTguMywwLTE1LTYuNy0xNS0xNWgzMEM2NSw2My4zLDU4LjMsNzAsNTAsNzB6IiBmaWxsPSIjRkZGIi8+PC9zdmc+";
// FIX: Added missing phoenixIcon variable.
const phoenixIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNTAgMjAgQyA0MCAzMCAzMCA0MCAzMCA1MCAgMyMCA2NSA0MCA3NSA1MCA4MCAgNjAgNzUgNzAgNjUgNzAgNTAgQyA3MCA0MCA2MCAzMCA1MCAyMCBNIDIwIDUwIEMgMjUgNDAgMzUgMzUgNDAgNDAgQyA0NSA0NSA0MCA1NSAzNSA2MCAgMzAgNjUgMjAgNjAgMjAgNTAgTSA4MCA1MCBDIDc1IDQwIDY1IDM1IDYwIDQwIEMgNTUgNDUgNjAgNTUgNjUgNjAgQyA3MCA2NSA4MCA2MCA4MCA1MCIgZmlsbD0iI0ZGRiIvPjwvc3ZnPg==";

const createEmblem = (gradientId: string, gradientColors: string[], icon: string, iconTransform = "") => {
    const stops = gradientColors.map((color, index) => 
        `<stop offset="${index * 50}%" style="stop-color:${color};stop-opacity:1" />`
    ).join('');

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <defs>
                <radialGradient id="${gradientId}" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    ${stops}
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#${gradientId})" stroke="${gradientColors[2]}" stroke-width="4"/>
            <image href="${icon}" x="15" y="15" height="70" width="70" transform="${iconTransform}"/>
        </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const bronzeColors = ['#f0e6d2', '#cd7f32', '#8c5620'];
const silverColors = ['#ffffff', '#c0c0c0', '#808080'];
const goldColors = ['#ffffcc', '#ffd700', '#b8860b'];

const phoenixColors = ['#ffcc00', '#ff4500', '#8b0000'];
const dragonColors = ['#ff6347', '#dc143c', '#8b0000'];

const categories: Category[] = [
    // Lobo
    { key: 'lobo_bronze', name: 'Lobo de Bronze', tier: 'Bronze', animal: 'Lobo', image: createEmblem('bronze_wolf', bronzeColors, wolfIcon) },
    { key: 'lobo_prata', name: 'Lobo de Prata', tier: 'Prata', animal: 'Lobo', image: createEmblem('silver_wolf', silverColors, wolfIcon) },
    { key: 'lobo_ouro', name: 'Lobo de Ouro', tier: 'Ouro', animal: 'Lobo', image: createEmblem('gold_wolf', goldColors, wolfIcon) },
    // Onça
    { key: 'onca_bronze', name: 'Onça de Bronze', tier: 'Bronze', animal: 'Onça', image: createEmblem('bronze_jaguar', bronzeColors, jaguarIcon) },
    { key: 'onca_prata', name: 'Onça de Prata', tier: 'Prata', animal: 'Onça', image: createEmblem('silver_jaguar', silverColors, jaguarIcon) },
    { key: 'onca_ouro', name: 'Onça de Ouro', tier: 'Ouro', animal: 'Onça', image: createEmblem('gold_jaguar', goldColors, jaguarIcon) },
    // Gorila
    { key: 'gorila_bronze', name: 'Gorila de Bronze', tier: 'Bronze', animal: 'Gorila', image: createEmblem('bronze_gorilla', bronzeColors, gorillaIcon) },
    { key: 'gorila_prata', name: 'Gorila de Prata', tier: 'Prata', animal: 'Gorila', image: createEmblem('silver_gorilla', silverColors, gorillaIcon) },
    { key: 'gorila_ouro', name: 'Gorila de Ouro', tier: 'Ouro', animal: 'Gorila', image: createEmblem('gold_gorilla', goldColors, gorillaIcon) },
    // Tigre
    { key: 'tigre_bronze', name: 'Tigre de Bronze', tier: 'Bronze', animal: 'Tigre', image: createEmblem('bronze_tiger', bronzeColors, tigerIcon) },
    { key: 'tigre_prata', name: 'Tigre de Prata', tier: 'Prata', animal: 'Tigre', image: createEmblem('silver_tiger', silverColors, tigerIcon) },
    { key: 'tigre_ouro', name: 'Tigre de Ouro', tier: 'Ouro', animal: 'Tigre', image: createEmblem('gold_tiger', goldColors, tigerIcon) },
    // Urso
    { key: 'urso_bronze', name: 'Urso de Bronze', tier: 'Bronze', animal: 'Urso', image: createEmblem('bronze_bear', bronzeColors, bearIcon) },
    { key: 'urso_prata', name: 'Urso de Prata', tier: 'Prata', animal: 'Urso', image: createEmblem('silver_bear', silverColors, bearIcon) },
    { key: 'urso_ouro', name: 'Urso de Ouro', tier: 'Ouro', animal: 'Urso', image: createEmblem('gold_bear', goldColors, bearIcon) },
    // Lendários
    { key: 'fenix', name: 'Fênix', animal: 'Fênix', image: createEmblem('phoenix', phoenixColors, phoenixIcon) },
    { key: 'dragao', name: 'Dragão', animal: 'Dragão', image: createEmblem('dragon', dragonColors, dragonIcon) },
];

const categoryGroups = categories.reduce((acc, cat) => {
    if (!acc[cat.animal]) {
        acc[cat.animal] = [];
    }
    acc[cat.animal].push(cat);
    return acc;
}, {} as Record<string, Category[]>);

export const categoryData = {
    list: categories,
    groups: categoryGroups,
    placeholder: placeholderImage
};
