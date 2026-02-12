import { useEffect, useState } from 'react';
import { AdminProvider } from '@/contexts/AdminContext';
import { LeagueHeader } from '@/components/LeagueHeader';
import { StandingsTable } from '@/components/StandingsTable';
import { TopScorers } from '@/components/TopScorers';
import { MatchHistory } from '@/components/MatchHistory';
import { NavBar } from '@/components/NavBar';
import { useLeagueStore } from '@/store/leagueStore';
import { useGitHubData } from '@/hooks/useGitHubData';
import { Loader2 } from 'lucide-react';

const VisitorPage = () => {
  const [loading, setLoading] = useState(true);
  const { loadFullData } = useLeagueStore();
  const { fetchData } = useGitHubData();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchData();
      if (data) {
        loadFullData(data);
      }
      setLoading(false);
    };
    loadData();
  }, [fetchData, loadFullData]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <AdminProvider isAdmin={false}>
      <NavBar />
      <div className="min-h-screen relative overflow-x-hidden">
        {/* Hero video section */}
        <div className="relative w-full h-screen">
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background" />
          <div className="absolute inset-0" style={{ background: 'var(--gradient-ocean)' }} />

          <div className="relative z-10 flex flex-col justify-center items-center h-full pt-16">
            <LeagueHeader />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-3 md:px-4 py-12 max-w-full overflow-x-hidden">
          <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4 md:space-y-6 min-w-0">
              <StandingsTable />
              <MatchHistory />
            </div>
            <div className="min-w-0">
              <TopScorers hideButtons={true} />
            </div>
          </div>
        </div>
      </div>
    </AdminProvider>
  );
};

export default VisitorPage;
