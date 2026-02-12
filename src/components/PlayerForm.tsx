import { useState, useEffect } from 'react';
import { useLeagueStore } from '@/store/leagueStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Upload, X } from 'lucide-react';

interface PlayerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPlayerId: string | null;
}

export function PlayerForm({ open, onOpenChange, editingPlayerId }: PlayerFormProps) {
  const { players, teams, addPlayer, editPlayer } = useLeagueStore();
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState<string>(teams?.[0]?.id || 'team1');
  const [image, setImage] = useState<string | null>(null);
  const [goals, setGoals] = useState(0);

  const editingPlayer = editingPlayerId ? players?.find(p => p.id === editingPlayerId) : null;

  useEffect(() => {
    if (editingPlayer) {
      setName(editingPlayer.name);
      setTeamId(editingPlayer.teamId);
      setImage(editingPlayer.image || null);
      setGoals(editingPlayer.goals || 0);
    } else {
      setName('');
      setTeamId(teams?.[0]?.id || 'team1');
      setImage(null);
      setGoals(0);
    }
  }, [editingPlayer, open, teams]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPlayerId && editingPlayer) {
      editPlayer(editingPlayerId, { name, teamId, image, goals });
    } else {
      addPlayer({ name, teamId, image, goals });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md mx-4">
        <DialogHeader>
          <DialogTitle>{editingPlayerId ? 'Edit Player' : 'Add New Player'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-border bg-muted group">
              {image ? (
                <>
                  <img src={image} alt="Player" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImage(null)} className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-6 h-6 text-destructive" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <label className="cursor-pointer">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <span className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"><Upload className="w-4 h-4" /> Upload Photo</span>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Player Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter player name" className="bg-input border-border" />
          </div>

          <div className="space-y-2">
            <Label>Team</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {teams?.map(team => <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {editingPlayerId && (
            <div className="space-y-2">
              <Label htmlFor="goals">Goals</Label>
              <Input id="goals" type="number" min={0} value={goals} onChange={e => setGoals(parseInt(e.target.value || '0') || 0)} className="bg-input border-border" />
            </div>
          )}

          <Button type="submit" className="w-full">{editingPlayerId ? 'Update Player' : 'Add Player'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
