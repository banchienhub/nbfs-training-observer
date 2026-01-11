import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Users, 
  Edit2, 
  Trash2, 
  Save,
  X,
  Loader2,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Players() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    shirt_number: '',
    primary_role: '',
    team_id: '',
    status: 'active'
  });

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list('shirt_number'),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list(),
  });

  const { data: orgs = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Player.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Player.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Player.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      shirt_number: '',
      primary_role: '',
      team_id: teams[0]?.id || '',
      status: 'active'
    });
    setEditingPlayer(null);
    setShowDialog(false);
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      first_name: player.first_name,
      last_name: player.last_name,
      shirt_number: player.shirt_number,
      primary_role: player.primary_role,
      team_id: player.team_id,
      status: player.status
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    const org_id = orgs[0]?.id || '';
    const data = {
      ...formData,
      org_id,
      shirt_number: parseInt(formData.shirt_number)
    };

    if (editingPlayer) {
      updateMutation.mutate({ id: editingPlayer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'N/A';
  };

  const getRoleColor = (role) => {
    const colors = {
      portiere: 'bg-amber-100 text-amber-700',
      difensore: 'bg-blue-100 text-blue-700',
      centrocampista: 'bg-emerald-100 text-emerald-700',
      attaccante: 'bg-red-100 text-red-700'
    };
    return colors[role] || 'bg-slate-100 text-slate-700';
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-700',
      injured: 'bg-red-100 text-red-700',
      inactive: 'bg-slate-100 text-slate-600'
    };
    const labels = {
      active: 'Attivo',
      injured: 'Infortunato',
      inactive: 'Inattivo'
    };
    return (
      <Badge className={styles[status] || styles.active}>
        {labels[status] || 'Attivo'}
      </Badge>
    );
  };

  const groupedPlayers = players.reduce((acc, player) => {
    const teamName = getTeamName(player.team_id);
    if (!acc[teamName]) acc[teamName] = [];
    acc[teamName].push(player);
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
            Giocatori
          </h1>
          <p className="text-slate-500 mt-1">
            Gestisci la rosa dei giocatori
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => { if (!open) resetForm(); else setShowDialog(true); }}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <UserPlus className="w-4 h-4" />
              Aggiungi Giocatore
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPlayer ? 'Modifica Giocatore' : 'Nuovo Giocatore'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Nome *</label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Cognome *</label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Numero Maglia *</label>
                  <Input
                    type="number"
                    value={formData.shirt_number}
                    onChange={(e) => setFormData({ ...formData, shirt_number: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Ruolo *</label>
                  <Select 
                    value={formData.primary_role} 
                    onValueChange={(v) => setFormData({ ...formData, primary_role: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleziona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portiere">Portiere</SelectItem>
                      <SelectItem value="difensore">Difensore</SelectItem>
                      <SelectItem value="centrocampista">Centrocampista</SelectItem>
                      <SelectItem value="attaccante">Attaccante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Squadra *</label>
                <Select 
                  value={formData.team_id} 
                  onValueChange={(v) => setFormData({ ...formData, team_id: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleziona squadra" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Stato</label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Attivo</SelectItem>
                    <SelectItem value="injured">Infortunato</SelectItem>
                    <SelectItem value="inactive">Inattivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  className="flex-1"
                >
                  Annulla
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.first_name || !formData.last_name || !formData.shirt_number || !formData.primary_role || !formData.team_id || createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salva
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Players List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : players.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-700 text-lg mb-2">
              Nessun giocatore
            </h3>
            <p className="text-slate-500 mb-6">
              Aggiungi i giocatori alla rosa
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPlayers).map(([teamName, teamPlayers]) => (
            <Card key={teamName}>
              <CardHeader>
                <CardTitle className="text-lg">{teamName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl group"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg">
                        {player.shirt_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          {player.first_name} {player.last_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleColor(player.primary_role)}>
                            {player.primary_role}
                          </Badge>
                          {getStatusBadge(player.status)}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(player)}
                        >
                          <Edit2 className="w-4 h-4 text-slate-500" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Elimina giocatore</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sei sicuro di voler eliminare {player.first_name} {player.last_name}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(player.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Elimina
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}