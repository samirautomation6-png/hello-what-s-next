import { AdminProvider } from '@/contexts/AdminContext';
import { NavBar } from '@/components/NavBar';
import { useLeagueStore } from '@/store/leagueStore';
import { Crown, Trophy, Target, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const HallOfFamePage = () => {
  const { archives, teams: currentTeams } = useLeagueStore();

  // Build coach history from archives
  const coachStats: Record<string, {
    name: string;
    totalWins: number;
    totalDraws: number;
    totalLosses: number;
    totalGoals: number;
    championships: string[];
    seasonsPlayed: number;
    teamNames: string[];
  }> = {};

  archives.forEach(archive => {
    const sortedTeams = [...archive.teams].sort((a, b) => (b.won * 3 + b.drawn) - (a.won * 3 + a.drawn));
    const champion = sortedTeams[0];

    archive.teams.forEach(team => {
      const coach = team.coach;
      if (!coachStats[coach]) {
        coachStats[coach] = {
          name: coach,
          totalWins: 0,
          totalDraws: 0,
          totalLosses: 0,
          totalGoals: 0,
          championships: [],
          seasonsPlayed: 0,
          teamNames: [],
        };
      }

      coachStats[coach].totalWins += team.won;
      coachStats[coach].totalDraws += team.drawn;
      coachStats[coach].totalLosses += team.lost;
      coachStats[coach].totalGoals += team.goalsFor;
      coachStats[coach].seasonsPlayed += 1;

      if (!coachStats[coach].teamNames.includes(team.name)) {
        coachStats[coach].teamNames.push(team.name);
      }

      if (champion && champion.coach === coach) {
        coachStats[coach].championships.push(archive.name);
      }
    });
  });

  const sortedCoaches = Object.values(coachStats).sort((a, b) => b.championships.length - a.championships.length || b.totalWins - a.totalWins);

  return (
    <AdminProvider isAdmin={false}>
      <NavBar />
      <div className="min-h-screen pt-20 pb-12" style={{ background: 'var(--gradient-ocean)' }}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-secondary" />
              <h1 className="text-3xl md:text-5xl font-display font-bold text-gradient-gold">
                Hall of Fame
              </h1>
            </div>
            <p className="text-muted-foreground">Legends of the Cosmus League</p>
          </motion.div>

          {sortedCoaches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="atlantis-card p-12 text-center"
            >
              <Crown className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-display font-semibold text-muted-foreground mb-2">No Legends Yet</h2>
              <p className="text-sm text-muted-foreground">
                Archive completed leagues to build the hall of fame.
              </p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {sortedCoaches.map((coach, index) => (
                <motion.div
                  key={coach.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="atlantis-card p-6 relative overflow-hidden"
                >
                  {/* Rank badge */}
                  <div className={cn(
                    'absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                    index === 0 && 'bg-secondary text-secondary-foreground',
                    index === 1 && 'bg-gray-400 text-background',
                    index === 2 && 'bg-amber-700 text-foreground',
                    index > 2 && 'bg-muted text-muted-foreground'
                  )}>
                    #{index + 1}
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-muted/30 flex items-center justify-center border border-border/50">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-display font-bold text-foreground">Coach {coach.name}</h3>
                      <p className="text-sm text-muted-foreground">{coach.teamNames.join(', ')}</p>
                    </div>
                  </div>

                  {/* Championships */}
                  {coach.championships.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      {coach.championships.map((title, i) => (
                        <div key={i} className="flex items-center gap-1 bg-secondary/20 text-secondary px-2 py-1 rounded-full text-xs font-medium">
                          <Trophy className="w-3 h-3" />
                          {title}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stats grid */}
                  <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/30">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-400">{coach.totalWins}</p>
                      <p className="text-xs text-muted-foreground">Wins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-muted-foreground">{coach.totalDraws}</p>
                      <p className="text-xs text-muted-foreground">Draws</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-destructive">{coach.totalLosses}</p>
                      <p className="text-xs text-muted-foreground">Losses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-secondary">{coach.totalGoals}</p>
                      <p className="text-xs text-muted-foreground">Goals</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Target className="w-3 h-3" />
                    <span>{coach.seasonsPlayed} seasons • {coach.championships.length} titles</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminProvider>
  );
};

export default HallOfFamePage;
