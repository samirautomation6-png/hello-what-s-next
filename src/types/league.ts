export interface Team {
  id: string;
  name: string;
  coach: string;
  logo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  goals: number;
  image: string | null;
}

export interface MatchEvent {
  playerId: string;
  goals: number;
  isOwnGoal?: boolean;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeGoals: number;
  awayGoals: number;
  scorers: MatchEvent[];
  date: string;
}

export interface ArchivedLeague {
  id: string;
  name: string;
  archivedAt: string;
  teams: Team[];
  players: Player[];
  matches: Match[];
  settings: LeagueSettings;
}

export interface Cup {
  id: string;
  name: string;
  description: string;
  image: string | null;
  winner: string;
  winnerTeamId: string;
  date: string;
}

export interface LeagueSettings {
  maxMatches: number;
  maxTeams: number;
}

export interface LeagueData {
  teams: Team[];
  players: Player[];
  matches: Match[];
  archives: ArchivedLeague[];
  cups: Cup[];
  settings: LeagueSettings;
}
