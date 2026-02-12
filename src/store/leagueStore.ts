import { create } from 'zustand';
import defaultLeagueData from '@/data/defaultLeagueData.json';
import type { Team, Player, Match, MatchEvent, ArchivedLeague, Cup, LeagueSettings, LeagueData } from '@/types/league';

const STORAGE_KEY = 'football-league-data';

interface LeagueState {
  teams: Team[];
  players: Player[];
  matches: Match[];
  archives: ArchivedLeague[];
  cups: Cup[];
  settings: LeagueSettings;
  selectedHomeTeam: Team | null;
  selectedAwayTeam: Team | null;

  setTeams: (teams: Team[]) => void;
  setPlayers: (players: Player[]) => void;
  setMatches: (matches: Match[]) => void;
  setSelectedHomeTeam: (team: Team | null) => void;
  setSelectedAwayTeam: (team: Team | null) => void;
  setSettings: (settings: LeagueSettings) => void;

  addMatch: (homeGoals: number, awayGoals: number, scorers?: MatchEvent[]) => void;
  editMatch: (matchId: string, homeGoals: number, awayGoals: number, scorers?: MatchEvent[]) => void;
  deleteMatch: (matchId: string) => void;
  addPlayer: (player: Omit<Player, 'id'>) => void;
  editPlayer: (id: string, data: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  updateTeamLogo: (teamId: string, logo: string) => void;

  archiveLeague: (seasonName: string) => void;
  deleteArchive: (archiveId: string) => void;

  addCup: (cup: Omit<Cup, 'id'>) => void;
  editCup: (cupId: string, data: Partial<Cup>) => void;
  deleteCup: (cupId: string) => void;

  resetLeague: () => void;
  loadFullData: (data: LeagueData) => void;
  getExportData: () => LeagueData;
}

const loadState = (): LeagueData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        teams: parsed.teams || defaultLeagueData.teams,
        players: parsed.players || defaultLeagueData.players,
        matches: parsed.matches || defaultLeagueData.matches,
        archives: parsed.archives || [],
        cups: parsed.cups || [],
        settings: parsed.settings || defaultLeagueData.settings,
      };
    }
  } catch (e) {
    console.error('Error loading state:', e);
  }
  return defaultLeagueData as LeagueData;
};

const saveState = (state: Partial<LeagueState>) => {
  try {
    const toSave = {
      teams: state.teams,
      players: state.players,
      matches: state.matches,
      archives: state.archives,
      cups: state.cups,
      settings: state.settings,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Error saving state:', e);
  }
};

const recalculateTeamStats = (teams: Team[], matches: Match[]): Team[] => {
  const resetTeams = teams.map(t => ({
    ...t,
    played: 0, won: 0, drawn: 0, lost: 0,
    goalsFor: 0, goalsAgainst: 0, points: 0,
  }));

  matches.forEach(match => {
    const homeIdx = resetTeams.findIndex(t => t.id === match.homeTeamId);
    const awayIdx = resetTeams.findIndex(t => t.id === match.awayTeamId);
    if (homeIdx === -1 || awayIdx === -1) return;

    const homeWin = match.homeGoals > match.awayGoals;
    const draw = match.homeGoals === match.awayGoals;

    resetTeams[homeIdx] = {
      ...resetTeams[homeIdx],
      played: resetTeams[homeIdx].played + 1,
      won: resetTeams[homeIdx].won + (homeWin ? 1 : 0),
      drawn: resetTeams[homeIdx].drawn + (draw ? 1 : 0),
      lost: resetTeams[homeIdx].lost + (!homeWin && !draw ? 1 : 0),
      goalsFor: resetTeams[homeIdx].goalsFor + match.homeGoals,
      goalsAgainst: resetTeams[homeIdx].goalsAgainst + match.awayGoals,
      points: resetTeams[homeIdx].points + (homeWin ? 3 : draw ? 1 : 0),
    };

    resetTeams[awayIdx] = {
      ...resetTeams[awayIdx],
      played: resetTeams[awayIdx].played + 1,
      won: resetTeams[awayIdx].won + (!homeWin && !draw ? 1 : 0),
      drawn: resetTeams[awayIdx].drawn + (draw ? 1 : 0),
      lost: resetTeams[awayIdx].lost + (homeWin ? 1 : 0),
      goalsFor: resetTeams[awayIdx].goalsFor + match.awayGoals,
      goalsAgainst: resetTeams[awayIdx].goalsAgainst + match.homeGoals,
      points: resetTeams[awayIdx].points + (!homeWin && !draw ? 3 : draw ? 1 : 0),
    };
  });

  return resetTeams;
};

const initialState = loadState();

export const useLeagueStore = create<LeagueState>((set, get) => ({
  teams: initialState.teams,
  players: initialState.players,
  matches: initialState.matches,
  archives: initialState.archives,
  cups: initialState.cups,
  settings: initialState.settings,
  selectedHomeTeam: null,
  selectedAwayTeam: null,

  setTeams: (teams) => set({ teams }),
  setPlayers: (players) => set({ players }),
  setMatches: (matches) => set({ matches }),
  setSelectedHomeTeam: (team) => set({ selectedHomeTeam: team }),
  setSelectedAwayTeam: (team) => set({ selectedAwayTeam: team }),
  setSettings: (settings) => {
    const state = get();
    const newState = { ...state, settings };
    saveState(newState);
    set({ settings });
  },

  addMatch: (homeGoals, awayGoals, scorers = []) => {
    const state = get();
    const homeTeam = state.selectedHomeTeam || state.teams[0];
    const awayTeam = state.selectedAwayTeam || state.teams[1];

    if (!homeTeam || !awayTeam || homeTeam.id === awayTeam.id) return;

    const homeWin = homeGoals > awayGoals;
    const draw = homeGoals === awayGoals;

    const updatedTeams = state.teams.map((t) => {
      if (t.id === homeTeam.id) {
        return {
          ...t,
          played: t.played + 1,
          won: t.won + (homeWin ? 1 : 0),
          drawn: t.drawn + (draw ? 1 : 0),
          lost: t.lost + (!homeWin && !draw ? 1 : 0),
          goalsFor: t.goalsFor + homeGoals,
          goalsAgainst: t.goalsAgainst + awayGoals,
          points: t.points + (homeWin ? 3 : draw ? 1 : 0),
        };
      }
      if (t.id === awayTeam.id) {
        return {
          ...t,
          played: t.played + 1,
          won: t.won + (!homeWin && !draw ? 1 : 0),
          drawn: t.drawn + (draw ? 1 : 0),
          lost: t.lost + (homeWin ? 1 : 0),
          goalsFor: t.goalsFor + awayGoals,
          goalsAgainst: t.goalsAgainst + homeGoals,
          points: t.points + (!homeWin && !draw ? 3 : draw ? 1 : 0),
        };
      }
      return t;
    });

    const updatedPlayers = state.players.map((p) => {
      const event = scorers.find((s) => s.playerId === p.id && !s.isOwnGoal);
      return event ? { ...p, goals: p.goals + event.goals } : p;
    });

    const newMatch: Match = {
      id: `match-${Date.now()}`,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeTeamName: homeTeam.name,
      awayTeamName: awayTeam.name,
      homeGoals,
      awayGoals,
      scorers,
      date: new Date().toISOString(),
    };

    const newState = {
      ...state,
      teams: updatedTeams,
      players: updatedPlayers,
      matches: [...state.matches, newMatch],
    };

    saveState(newState);
    set({ teams: updatedTeams, players: updatedPlayers, matches: newState.matches });
  },

  editMatch: (matchId, homeGoals, awayGoals, scorers = []) => {
    const state = get();
    const updatedMatches = state.matches.map(m =>
      m.id === matchId ? { ...m, homeGoals, awayGoals, scorers } : m
    );

    // Recalculate all team stats and player goals from scratch
    const recalcTeams = recalculateTeamStats(state.teams, updatedMatches);

    // Recalculate player goals
    const recalcPlayers = state.players.map(p => ({
      ...p,
      goals: updatedMatches.reduce((total, match) => {
        const event = match.scorers.find(s => s.playerId === p.id && !s.isOwnGoal);
        return total + (event?.goals || 0);
      }, 0),
    }));

    const newState = { ...state, teams: recalcTeams, players: recalcPlayers, matches: updatedMatches };
    saveState(newState);
    set({ teams: recalcTeams, players: recalcPlayers, matches: updatedMatches });
  },

  deleteMatch: (matchId) => {
    const state = get();
    const updatedMatches = state.matches.filter(m => m.id !== matchId);
    const recalcTeams = recalculateTeamStats(state.teams, updatedMatches);
    const recalcPlayers = state.players.map(p => ({
      ...p,
      goals: updatedMatches.reduce((total, match) => {
        const event = match.scorers.find(s => s.playerId === p.id && !s.isOwnGoal);
        return total + (event?.goals || 0);
      }, 0),
    }));

    const newState = { ...state, teams: recalcTeams, players: recalcPlayers, matches: updatedMatches };
    saveState(newState);
    set({ teams: recalcTeams, players: recalcPlayers, matches: updatedMatches });
  },

  addPlayer: (playerData) => {
    const state = get();
    const newPlayer: Player = { ...playerData, id: `player-${Date.now()}` };
    const newState = { ...state, players: [...state.players, newPlayer] };
    saveState(newState);
    set({ players: newState.players });
  },

  editPlayer: (id, data) => {
    const state = get();
    const updatedPlayers = state.players.map((p) => p.id === id ? { ...p, ...data } : p);
    const newState = { ...state, players: updatedPlayers };
    saveState(newState);
    set({ players: updatedPlayers });
  },

  deletePlayer: (id) => {
    const state = get();
    const updatedPlayers = state.players.filter((p) => p.id !== id);
    const newState = { ...state, players: updatedPlayers };
    saveState(newState);
    set({ players: updatedPlayers });
  },

  updateTeamLogo: (teamId, logo) => {
    const state = get();
    const updatedTeams = state.teams.map((t) => t.id === teamId ? { ...t, logo } : t);
    const newState = { ...state, teams: updatedTeams };
    saveState(newState);
    set({ teams: updatedTeams });
  },

  archiveLeague: (seasonName) => {
    const state = get();
    const archive: ArchivedLeague = {
      id: `archive-${Date.now()}`,
      name: seasonName,
      archivedAt: new Date().toISOString(),
      teams: JSON.parse(JSON.stringify(state.teams)),
      players: JSON.parse(JSON.stringify(state.players)),
      matches: JSON.parse(JSON.stringify(state.matches)),
      settings: { ...state.settings },
    };

    const resetTeams = state.teams.map(t => ({
      ...t,
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, points: 0,
    }));

    const newState = {
      ...state,
      archives: [...state.archives, archive],
      teams: resetTeams,
      players: state.players.map(p => ({ ...p, goals: 0 })),
      matches: [],
    };

    saveState(newState);
    set({
      archives: newState.archives,
      teams: newState.teams,
      players: newState.players,
      matches: [],
    });
  },

  deleteArchive: (archiveId) => {
    const state = get();
    const newState = { ...state, archives: state.archives.filter(a => a.id !== archiveId) };
    saveState(newState);
    set({ archives: newState.archives });
  },

  addCup: (cupData) => {
    const state = get();
    const newCup: Cup = { ...cupData, id: `cup-${Date.now()}` };
    const newState = { ...state, cups: [...state.cups, newCup] };
    saveState(newState);
    set({ cups: newState.cups });
  },

  editCup: (cupId, data) => {
    const state = get();
    const updatedCups = state.cups.map(c => c.id === cupId ? { ...c, ...data } : c);
    const newState = { ...state, cups: updatedCups };
    saveState(newState);
    set({ cups: updatedCups });
  },

  deleteCup: (cupId) => {
    const state = get();
    const updatedCups = state.cups.filter(c => c.id !== cupId);
    const newState = { ...state, cups: updatedCups };
    saveState(newState);
    set({ cups: updatedCups });
  },

  resetLeague: () => {
    const state = get();
    const resetTeams = state.teams.map(t => ({
      ...t,
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, points: 0,
    }));
    const newState = {
      ...state,
      teams: resetTeams,
      players: state.players.map(p => ({ ...p, goals: 0 })),
      matches: [],
    };
    saveState(newState);
    set({ teams: newState.teams, players: newState.players, matches: [] });
  },

  loadFullData: (data) => {
    const fullData = {
      teams: data.teams || [],
      players: data.players || [],
      matches: data.matches || [],
      archives: data.archives || [],
      cups: data.cups || [],
      settings: data.settings || { maxMatches: 50, maxTeams: 2 },
    };
    saveState(fullData);
    set(fullData);
  },

  getExportData: () => {
    const state = get();
    return {
      teams: state.teams,
      players: state.players,
      matches: state.matches,
      archives: state.archives,
      cups: state.cups,
      settings: state.settings,
    };
  },
}));
