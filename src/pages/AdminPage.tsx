import { useState, useEffect, useCallback } from 'react';
import { AdminProvider } from '@/contexts/AdminContext';
import { LeagueHeader } from '@/components/LeagueHeader';
import { StandingsTable } from '@/components/StandingsTable';
import { TopScorers } from '@/components/TopScorers';
import { MatchHistory } from '@/components/MatchHistory';
import { PlayerForm } from '@/components/PlayerForm';
import { MatchForm } from '@/components/MatchForm';
import { TeamLogoUploader } from '@/components/TeamLogoUploader';
import { NavBar } from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLeagueStore } from '@/store/leagueStore';
import { useGitHubData } from '@/hooks/useGitHubData';
import { UserPlus, Play, Archive, Save, Loader2, Settings } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const AdminPage = () => {
  const [playerFormOpen, setPlayerFormOpen] = useState(false);
  const [matchFormOpen, setMatchFormOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [seasonName, setSeasonName] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { matches, teams, players, settings, archiveLeague, loadFullData, getExportData, setSettings } = useLeagueStore();
  const { fetchData, updateData } = useGitHubData();

  const [maxMatches, setMaxMatches] = useState(settings.maxMatches);
  const [maxTeams, setMaxTeams] = useState(settings.maxTeams);

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

  useEffect(() => {
    setMaxMatches(settings.maxMatches);
    setMaxTeams(settings.maxTeams);
  }, [settings]);

  const handleSaveToGitHub = useCallback(async () => {
    setSaving(true);
    await updateData(getExportData());
    setSaving(false);
  }, [updateData, getExportData]);

  const handleArchive = () => {
    if (!seasonName.trim()) {
      toast.error('Please enter a season name');
      return;
    }
    archiveLeague(seasonName.trim());
    toast.success(`"${seasonName}" archived! League has been reset.`);
    setSeasonName('');
    setArchiveDialogOpen(false);
  };

  const handleSaveSettings = () => {
    setSettings({ maxMatches, maxTeams });
    toast.success('League settings updated!');
    setSettingsOpen(false);
  };

  const handleEditPlayer = (playerId: string) => {
    setEditingPlayerId(playerId);
    setPlayerFormOpen(true);
  };

  const handlePlayerFormClose = (open: boolean) => {
    setPlayerFormOpen(open);
    if (!open) setEditingPlayerId(null);
  };

  const isLeagueComplete = matches.length >= settings.maxMatches;

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <AdminProvider isAdmin={true}>
      <NavBar />
      <div className="relative w-full min-h-screen overflow-x-hidden">
        {/* Hero section */}
        <div className="relative w-full h-screen">
          <div className="absolute inset-0" style={{ background: 'var(--gradient-ocean)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />

          <div className="relative z-10 flex flex-col justify-center items-center h-full pt-16">
            <LeagueHeader />

            {/* Admin buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-8 mb-12 px-4">
              <Button onClick={() => setPlayerFormOpen(true)} className="gap-2" variant="outline">
                <UserPlus className="w-4 h-4" /> Add Player
              </Button>

              <Button
                onClick={() => setMatchFormOpen(true)}
                className="gap-2"
                disabled={isLeagueComplete}
              >
                <Play className="w-4 h-4" /> Record Match ({matches.length}/{settings.maxMatches})
              </Button>

              <Button onClick={handleSaveToGitHub} className="gap-2" variant="secondary" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
              </Button>

              <Button onClick={() => setSettingsOpen(true)} variant="outline" className="gap-2">
                <Settings className="w-4 h-4" /> Settings
              </Button>

              {/* Archive League button */}
              <Button
                onClick={() => setArchiveDialogOpen(true)}
                variant="outline"
                className="gap-2 border-secondary/50 text-secondary hover:bg-secondary/10"
              >
                <Archive className="w-4 h-4" /> Archive League
              </Button>
            </div>

            {isLeagueComplete && (
              <div className="bg-secondary/20 border border-secondary/50 rounded-lg px-4 py-2 text-secondary text-sm font-medium animate-fade-in">
                🏆 League Complete! Archive this season to start a new one.
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 pb-12 max-w-full">
          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-6 min-w-0">
              <StandingsTable />
              <TeamLogoUploader />
              <MatchHistory />
            </div>
            <TopScorers onEditPlayer={handleEditPlayer} />
          </div>
        </div>

        <PlayerForm open={playerFormOpen} onOpenChange={handlePlayerFormClose} editingPlayerId={editingPlayerId} />
        <MatchForm open={matchFormOpen} onOpenChange={setMatchFormOpen} />

        {/* Archive Dialog */}
        <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">Archive League</AlertDialogTitle>
              <AlertDialogDescription>
                This will save the current league as a read-only snapshot and reset all stats for a new season.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="seasonName">Season Name</Label>
              <Input
                id="seasonName"
                value={seasonName}
                onChange={e => setSeasonName(e.target.value)}
                placeholder="e.g. Season 1"
                className="mt-2 bg-input border-border"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchive}>Archive & Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">League Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Max Matches per League</Label>
                <Input type="number" min={1} value={maxMatches} onChange={e => setMaxMatches(parseInt(e.target.value || '50'))} className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label>Number of Teams</Label>
                <Input type="number" min={2} value={maxTeams} onChange={e => setMaxTeams(parseInt(e.target.value || '2'))} className="bg-input border-border" />
                <p className="text-xs text-muted-foreground">Default: 2 (expandable)</p>
              </div>
              <Button onClick={handleSaveSettings} className="w-full">Save Settings</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminProvider>
  );
};

export default AdminPage;
