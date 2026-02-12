import { useState } from 'react';
import { AdminProvider } from '@/contexts/AdminContext';
import { NavBar } from '@/components/NavBar';
import { StandingsTable } from '@/components/StandingsTable';
import { TopScorers } from '@/components/TopScorers';
import { MatchHistory } from '@/components/MatchHistory';
import { useLeagueStore } from '@/store/leagueStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Archive, Calendar, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const ArchivePage = () => {
  const { archives } = useLeagueStore();
  const [selectedArchiveId, setSelectedArchiveId] = useState<string>(archives[0]?.id || '');

  const selectedArchive = archives.find(a => a.id === selectedArchiveId);

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
              <Archive className="w-8 h-8 text-secondary" />
              <h1 className="text-3xl md:text-5xl font-display font-bold text-gradient-gold">
                Archived Leagues
              </h1>
            </div>
            <p className="text-muted-foreground">Relive the glory of past seasons</p>
          </motion.div>

          {archives.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="atlantis-card p-12 text-center"
            >
              <Archive className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-display font-semibold text-muted-foreground mb-2">No Archived Leagues Yet</h2>
              <p className="text-sm text-muted-foreground">
                Once a league is completed and archived by an admin, it will appear here.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Season Selector */}
              <div className="max-w-md mx-auto mb-8">
                <Select value={selectedArchiveId} onValueChange={setSelectedArchiveId}>
                  <SelectTrigger className="bg-card border-border h-12 text-base">
                    <SelectValue placeholder="Select a season" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {archives.map(archive => (
                      <SelectItem key={archive.id} value={archive.id}>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-secondary" />
                          {archive.name}
                          <span className="text-xs text-muted-foreground">
                            ({new Date(archive.archivedAt).toLocaleDateString()})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedArchive && (
                <motion.div
                  key={selectedArchive.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Archive info */}
                  <div className="flex items-center justify-center gap-4 mb-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Archived {new Date(selectedArchive.archivedAt).toLocaleDateString()}</span>
                    </div>
                    <span>•</span>
                    <span>{selectedArchive.matches.length} matches played</span>
                  </div>

                  {/* Champion banner */}
                  {selectedArchive.teams.length > 0 && (
                    <div className="atlantis-card p-6 mb-8 text-center">
                      <Trophy className="w-10 h-10 mx-auto text-secondary mb-2" />
                      <h2 className="text-2xl font-display font-bold text-secondary">
                        {[...selectedArchive.teams].sort((a, b) => (b.won * 3 + b.drawn) - (a.won * 3 + a.drawn))[0]?.name}
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1">Season Champion</p>
                    </div>
                  )}

                  {/* Data display */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-6 min-w-0">
                      <StandingsTable teams={selectedArchive.teams} readOnly />
                      <MatchHistory matches={selectedArchive.matches} teams={selectedArchive.teams} readOnly />
                    </div>
                    <div className="min-w-0">
                      <TopScorers
                        players={selectedArchive.players}
                        teams={selectedArchive.teams}
                        hideButtons
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminProvider>
  );
};

export default ArchivePage;
