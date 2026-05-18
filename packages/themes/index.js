import themeRegistry from './registry.json' assert { type: 'json' };

export const getThemes = () => themeRegistry.themes;
export const getThemeById = (id) => themeRegistry.themes.find(t => t.id === id) || themeRegistry.themes[0];
