import { useCallback } from 'react';
import { toast } from 'sonner';
import type { LeagueData } from '@/types/league';

const GITHUB_CONFIG = {
  owner: 'kacemyassine',
  repo: 'atlantis-showdown',
  path: 'src/data/defaultLeagueData.json',
  branch: 'main',
};

function base64ToUtf8(str: string) {
  return decodeURIComponent(escape(atob(str)));
}

export function useGitHubData() {
  const fetchData = useCallback(async (): Promise<LeagueData | null> => {
    try {
      const token = import.meta.env.VITE_GITHUB_TOKEN;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const apiRes = await fetch(
        `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}?ref=${GITHUB_CONFIG.branch}`,
        { headers }
      );
      if (!apiRes.ok) throw new Error('Failed to fetch');
      const { content } = await apiRes.json();
      const parsed = JSON.parse(base64ToUtf8(content));

      return {
        teams: parsed.teams || [],
        players: parsed.players || [],
        matches: parsed.matches || [],
        archives: parsed.archives || [],
        cups: parsed.cups || [],
        settings: parsed.settings || { maxMatches: 50, maxTeams: 2 },
      } as LeagueData;
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch league data');
      return null;
    }
  }, []);

  const updateData = useCallback(async (data: LeagueData): Promise<boolean> => {
    try {
      // This requires a backend (Supabase edge function) to work
      // For now, save locally only
      toast.info('Data saved locally. Set up GitHub sync for cloud save.');
      return true;
    } catch (e) {
      console.error(e);
      toast.error('Failed to update data');
      return false;
    }
  }, []);

  return { fetchData, updateData, config: GITHUB_CONFIG };
}
