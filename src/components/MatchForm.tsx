import { useState, useEffect } from 'react';
import { useLeagueStore } from '@/store/leagueStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import type { MatchEvent } from '@/types/league';

interface MatchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MatchForm({ open, onOpenChange }: MatchFormProps) {
  const { teams, players, matches, settings, addMatch, selectedHomeTeam, selectedAwayTeam, setSelectedHomeTeam, setSelectedAwayTeam } = useLeagueStore();

  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [scorers, setScorers] = useState<MatchEvent[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && teams?.length >= 2) {
      setSelectedHomeTeam(teams[0]);
      setSelectedAwayTeam(teams[1]);
      setInitialized(true);
    }
  }, [teams, initialized, setSelectedHomeTeam, setSelectedAwayTeam]);

  const matchNumber = (matches?.length || 0) + 1;
  const maxMatches = settings?.maxMatches || 50;

  const handleAddScorer = () => {
    if (!players || players.length === 0) {
      toast.error('Add players first before recording scorers');
      return;
    }
    setScorers(s => [...s, { playerId: players[0].id, goals: 1, isOwnGoal: false }]);
  };

  const handleRemoveScorer = (index: number) => {
    setScorers(s => s.filter((_, i) => i !== index));
  };

  const handleScorerChange = (index: number, field: keyof MatchEvent, value: any) => {
    setScorers(s => s.map((sc, i) => i === index ? { ...sc, [field]: value } : sc));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHomeTeam || !selectedAwayTeam) {
      toast.error('Select both teams first');
      return;
    }

    const totalScorerGoals = scorers.reduce((sum, s) => sum + (s.goals || 0), 0);
    const totalMatchGoals = homeGoals + awayGoals;

    if (scorers.length > 0 && totalScorerGoals !== totalMatchGoals) {
      toast.error(`Scorer goals (${totalScorerGoals}) must equal match goals (${totalMatchGoals})`);
      return;
    }

    if (matchNumber > maxMatches) {
      toast.error(`League is complete! All ${maxMatches} matches have been played.`);
      return;
    }

    addMatch(homeGoals, awayGoals, scorers);
    toast.success(`Match ${matchNumber} recorded!`);
    setHomeGoals(0);
    setAwayGoals(0);
    setScorers([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Record Match {matchNumber}/{maxMatches}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <div className="text-center flex-1">
              <p className="text-xs md:text-sm text-muted-foreground mb-2">{selectedHomeTeam?.name || 'Home Team'}</p>
              <Input type="number" min={0} value={homeGoals} onChange={e => setHomeGoals(parseInt(e.target.value || '0') || 0)} className="text-center text-2xl md:text-3xl font-bold h-12 md:h-16 bg-input border-border" />
            </div>
            <span className="text-xl md:text-2xl text-muted-foreground font-display">VS</span>
            <div className="text-center flex-1">
              <p className="text-xs md:text-sm text-muted-foreground mb-2">{selectedAwayTeam?.name || 'Away Team'}</p>
              <Input type="number" min={0} value={awayGoals} onChange={e => setAwayGoals(parseInt(e.target.value || '0') || 0)} className="text-center text-2xl md:text-3xl font-bold h-12 md:h-16 bg-input border-border" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Goal Scorers (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddScorer} className="h-8">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {scorers.map((scorer, index) => (
              <div key={index} className="flex items-center gap-2">
                <Select value={scorer.playerId} onValueChange={v => handleScorerChange(index, 'playerId', v)}>
                  <SelectTrigger className="flex-1 bg-input border-border text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {players?.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({teams?.find(t => t.id === p.teamId)?.name})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input type="number" min={1} value={scorer.goals} onChange={e => handleScorerChange(index, 'goals', parseInt(e.target.value || '1') || 1)} className="w-14 md:w-16 bg-input border-border" />
                <div className="flex items-center gap-1">
                  <Checkbox checked={scorer.isOwnGoal || false} onCheckedChange={v => handleScorerChange(index, 'isOwnGoal', v)} />
                  <span className="text-xs text-muted-foreground">OG</span>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveScorer(index)} className="h-10 w-10 text-destructive">
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full">Record Match</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
