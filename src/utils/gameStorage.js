import { DEFAULT_GAMES } from '../data/defaultGames.js';

const STORAGE_KEY = 'unblocked_games_catalog_v1';
const FAVORITES_KEY = 'unblocked_games_favorites_v1';

export function getStoredGames() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_GAMES;
    }
    const parsed = JSON.parse(raw);
    // Ensure all default games exist in case they were updated
    const existingIds = new Set(parsed.map(g => g.id));
    const merged = [...parsed];
    for (const def of DEFAULT_GAMES) {
      if (!existingIds.has(def.id)) {
        merged.push(def);
      }
    }
    return merged;
  } catch (err) {
    console.error('Failed to parse stored games:', err);
    return DEFAULT_GAMES;
  }
}

export function saveGames(games) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch (err) {
    console.error('Failed to save games to localStorage:', err);
  }
}

export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favs) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  } catch (err) {
    console.error('Failed to save favorites:', err);
  }
}

export function downloadGameAsJSON(game) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(game, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${game.id}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function downloadAllGamesAsJSON(games) {
  const exportPayload = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    gamesCount: games.length,
    games
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', 'unblocked-games-export.json');
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
