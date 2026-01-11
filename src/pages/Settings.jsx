import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  Users2, 
  Save, 
  Plus,
  Edit2,
  Trash2,
  Loader2
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

export default function Settings() {
  const queryClient = useQueryClient();
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({
    name: '',
    category: '',
    season_label: '2024-25'
  });

  const { data: orgs = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list(),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list(),
  });

  const org = orgs[0];

  const updateOrgMutation = useMutation({
    mutationFn: (data) => base44.entities.Organization.update(org.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: (data) => base44.entities.Team.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      resetTeamForm();
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Team.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      resetTeamForm();
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (id) => base44.entities.Team.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const resetTeamForm = () => {
    setTeamForm({ name: '', category: '', season_label: '2024-25' });
    setEditingTeam(null);
    setShowTeamDialog(false);
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      category: team.category,
      season_label: team.season_label
    });
    setShowTeamDialog(true);
  };

  const handleSaveTeam = () => {
    const data = {
      ...teamForm,
      org_id: org?.id
    };

    if (editingTeam) {
      updateTeamMutation.mutate({ id: editingTeam.id, data });
    } else {
      createTeamMutation.mutate(data);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      under_14: 'Under 14',
      under_15: 'Under 15',
      under_16: 'Under 16',
      under_17: 'Under 17',
      under_18: 'Under 18',
      under_19: 'Under 19',
      under_21: 'Under 21',
      primavera: 'Primavera',
      prima_squadra: 'Prima Squadra'
    };
    return labels[category] || category;
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
          Impostazioni
        </h1>
        <p className="text-slate-500 mt-1">
          Gestisci organizzazione e squadre
        </p>
      </div>

      {/* Organization */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            Organizzazione
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Nome Organizzazione</label>
            <Input
              value={org?.name || ''}
              onChange={(e) => updateOrgMutation.mutate({ name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Paese</label>
              <Input
                value={org?.country || ''}
                onChange={(e) => updateOrgMutation.mutate({ country: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Fuso Orario</label>
              <Input
                value={org?.timezone || 'Europe/Rome'}
                onChange={(e) => updateOrgMutation.mutate({ timezone: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users2 className="w-5 h-5 text-emerald-600" />
            Squadre
          </CardTitle>
          <Dialog open={showTeamDialog} onOpenChange={(open) => { if (!open) resetTeamForm(); else setShowTeamDialog(true); }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Aggiungi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTeam ? 'Modifica Squadra' : 'Nuova Squadra'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Nome *</label>
                  <Input
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    className="mt-1"
                    placeholder="es. Primavera"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Categoria</label>
                  <Select 
                    value={teamForm.category} 
                    onValueChange={(v) => setTeamForm({ ...teamForm, category: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleziona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_14">Under 14</SelectItem>
                      <SelectItem value="under_15">Under 15</SelectItem>
                      <SelectItem value="under_16">Under 16</SelectItem>
                      <SelectItem value="under_17">Under 17</SelectItem>
                      <SelectItem value="under_18">Under 18</SelectItem>
                      <SelectItem value="under_19">Under 19</SelectItem>
                      <SelectItem value="under_21">Under 21</SelectItem>
                      <SelectItem value="primavera">Primavera</SelectItem>
                      <SelectItem value="prima_squadra">Prima Squadra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Stagione</label>
                  <Input
                    value={teamForm.season_label}
                    onChange={(e) => setTeamForm({ ...teamForm, season_label: e.target.value })}
                    className="mt-1"
                    placeholder="es. 2024-25"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={resetTeamForm}
                    className="flex-1"
                  >
                    Annulla
                  </Button>
                  <Button 
                    onClick={handleSaveTeam}
                    disabled={!teamForm.name || createTeamMutation.isPending || updateTeamMutation.isPending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {(createTeamMutation.isPending || updateTeamMutation.isPending) ? (
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
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <div className="text-center py-8">
              <Users2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Nessuna squadra creata</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{team.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {team.category && (
                        <Badge variant="outline">
                          {getCategoryLabel(team.category)}
                        </Badge>
                      )}
                      {team.season_label && (
                        <span className="text-sm text-slate-500">
                          {team.season_label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditTeam(team)}
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
                          <AlertDialogTitle>Elimina squadra</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler eliminare "{team.name}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteTeamMutation.mutate(team.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}