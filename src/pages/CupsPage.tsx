import { useState } from 'react';
import { AdminProvider } from '@/contexts/AdminContext';
import { NavBar } from '@/components/NavBar';
import { useLeagueStore } from '@/store/leagueStore';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, Plus, Edit2, Trash2, Calendar, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { Cup } from '@/types/league';

function CupsContent() {
  const { cups, addCup, editCup, deleteCup, teams } = useLeagueStore();
  const { isAdmin } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCup, setEditingCup] = useState<Cup | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [winner, setWinner] = useState('');
  const [winnerTeamId, setWinnerTeamId] = useState('');
  const [date, setDate] = useState('');

  const openForm = (cup?: Cup) => {
    if (cup) {
      setEditingCup(cup);
      setName(cup.name);
      setDescription(cup.description);
      setImage(cup.image);
      setWinner(cup.winner);
      setWinnerTeamId(cup.winnerTeamId);
      setDate(cup.date);
    } else {
      setEditingCup(null);
      setName('');
      setDescription('');
      setImage(null);
      setWinner('');
      setWinnerTeamId('');
      setDate('');
    }
    setFormOpen(true);
  };

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

    const cupData = { name, description, image, winner, winnerTeamId, date };

    if (editingCup) {
      editCup(editingCup.id, cupData);
      toast.success('Cup updated!');
    } else {
      addCup(cupData);
      toast.success('Cup added!');
    }
    setFormOpen(false);
  };

  const handleDelete = (cupId: string) => {
    deleteCup(cupId);
    toast.success('Cup deleted');
  };

  return (
    <div className="min-h-screen pt-20 pb-12" style={{ background: 'var(--gradient-ocean)' }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-secondary" />
            <h1 className="text-3xl md:text-5xl font-display font-bold text-gradient-gold">
              Cups & Trophies
            </h1>
          </div>
          <p className="text-muted-foreground">Special competitions and achievements</p>

          {isAdmin && (
            <Button onClick={() => openForm()} className="mt-6 gap-2">
              <Plus className="w-4 h-4" /> Add Cup
            </Button>
          )}
        </motion.div>

        {cups.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="atlantis-card p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-display font-semibold text-muted-foreground mb-2">No Cups Yet</h2>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? 'Add your first cup or trophy!' : 'Cups will appear here once added by an admin.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {cups.map((cup, index) => (
              <motion.div
                key={cup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="atlantis-card overflow-hidden group"
              >
                {cup.image && (
                  <div className="h-48 overflow-hidden">
                    <img src={cup.image} alt={cup.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-display font-bold text-foreground">{cup.name}</h3>
                      {cup.winner && (
                        <div className="flex items-center gap-1 mt-1">
                          <Trophy className="w-4 h-4 text-secondary" />
                          <span className="text-sm text-secondary font-medium">{cup.winner}</span>
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openForm(cup)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cup.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {cup.description && (
                    <p className="text-sm text-muted-foreground mt-3">{cup.description}</p>
                  )}
                  {cup.date && (
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(cup.date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Cup Form Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">{editingCup ? 'Edit Cup' : 'Add Cup'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Cup Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Atlantis Cup" className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the cup..." className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label>Winner</Label>
                <Input value={winner} onChange={e => setWinner(e.target.value)} placeholder="Team or coach name" className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                {image ? (
                  <div className="relative h-32 rounded-lg overflow-hidden">
                    <img src={image} alt="Cup" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImage(null)} className="absolute top-2 right-2 bg-background/80 rounded-full p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Upload image</span>
                    </div>
                  </label>
                )}
              </div>
              <Button type="submit" className="w-full">{editingCup ? 'Update Cup' : 'Add Cup'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

const CupsPage = () => {
  // Check if visiting as admin
  const isAdmin = window.location.pathname.includes('admin');

  return (
    <AdminProvider isAdmin={isAdmin}>
      <NavBar />
      <CupsContent />
    </AdminProvider>
  );
};

export default CupsPage;
