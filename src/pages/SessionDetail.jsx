import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Plus, 
  Play, 
  Trash2, 
  Clock, 
  BarChart3,
  Edit2,
  Save,
  X,
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
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function SessionDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('id');

  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [newBlock, setNewBlock] = useState({ name: '', start_minute: '', end_minute: '' });
  const [editingBlock, setEditingBlock] = useState(null);

  const { data: session, isLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const sessions = await base44.entities.TrainingSession.filter({ id: sessionId });
      return sessions[0];
    },
    enabled: !!sessionId,
  });

  const { data: blocks = [] } = useQuery({
    queryKey: ['blocks', sessionId],
    queryFn: () => base44.entities.SessionBlock.filter({ session_id: sessionId }, 'sort_order'),
    enabled: !!sessionId,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list(),
  });

  const { data: observations = [] } = useQuery({
    queryKey: ['observations', sessionId],
    queryFn: () => base44.entities.Observation.filter({ session_id: sessionId }),
    enabled: !!sessionId,
  });

  const createBlockMutation = useMutation({
    mutationFn: (data) => base44.entities.SessionBlock.create({
      ...data,
      session_id: sessionId,
      sort_order: blocks.length + 1
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks', sessionId] });
      setShowBlockDialog(false);
      setNewBlock({ name: '', start_minute: '', end_minute: '' });
    },
  });

  const updateBlockMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SessionBlock.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks', sessionId] });
      setEditingBlock(null);
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (id) => base44.entities.SessionBlock.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks', sessionId] });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: (data) => base44.entities.TrainingSession.update(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
    },
  });

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'N/A';
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-600',
      in_progress: 'bg-amber-100 text-amber-700',
      completed: 'bg-emerald-100 text-emerald-700'
    };
    const labels = {
      draft: 'Bozza',
      in_progress: 'In corso',
      completed: 'Completata'
    };
    return (
      <Badge className={`${styles[status] || styles.draft} font-medium`}>
        {labels[status] || 'Bozza'}
      </Badge>
    );
  };

  const handleCreateBlock = () => {
    createBlockMutation.mutate({
      name: newBlock.name,
      start_minute: newBlock.start_minute ? parseInt(newBlock.start_minute) : null,
      end_minute: newBlock.end_minute ? parseInt(newBlock.end_minute) : null,
    });
  };

  const handleStartObservation = () => {
    if (session?.status === 'draft') {
      updateSessionMutation.mutate({ status: 'in_progress' });
    }
    navigate(createPageUrl(`LiveObservation?session_id=${sessionId}`));
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <p className="text-slate-500">Sessione non trovata</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate(createPageUrl('Sessions'))}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sessioni</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
                {getTeamName(session.team_id)}
              </h1>
              {getStatusBadge(session.status)}
            </div>
            <p className="text-slate-500">
              {format(new Date(session.date), "EEEE d MMMM yyyy", { locale: it })}
            </p>
          </div>

          <div className="flex gap-3">
            <Link to={createPageUrl(`SessionReport?session_id=${sessionId}`)}>
              <Button variant="outline" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Report
              </Button>
            </Link>
            <Button 
              onClick={handleStartObservation}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              <Play className="w-4 h-4" />
              Osservazione
            </Button>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Tipo</p>
              <p className="font-medium text-slate-800 capitalize">
                {session.session_type || 'Non specificato'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Intensità</p>
              <p className="font-medium text-slate-800 capitalize">
                {session.intensity?.replace('_', ' ') || 'Non specificata'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Focus</p>
              <p className="font-medium text-slate-800">
                {session.focus || 'Non specificato'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Osservazioni</p>
              <p className="font-medium text-slate-800">{observations.length}</p>
            </div>
          </div>
          {session.notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-slate-500 mb-1">Note</p>
              <p className="text-slate-700">{session.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blocks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Blocchi / Drill
          </CardTitle>
          <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Aggiungi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuovo Blocco</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Nome *</label>
                  <Input
                    placeholder="es. Rondo 4v2"
                    value={newBlock.name}
                    onChange={(e) => setNewBlock({ ...newBlock, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Minuto inizio</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newBlock.start_minute}
                      onChange={(e) => setNewBlock({ ...newBlock, start_minute: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Minuto fine</label>
                    <Input
                      type="number"
                      placeholder="15"
                      value={newBlock.end_minute}
                      onChange={(e) => setNewBlock({ ...newBlock, end_minute: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBlockDialog(false)}
                    className="flex-1"
                  >
                    Annulla
                  </Button>
                  <Button 
                    onClick={handleCreateBlock}
                    disabled={!newBlock.name || createBlockMutation.isPending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {createBlockMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : 'Crea'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {blocks.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-2">Nessun blocco creato</p>
              <p className="text-sm text-slate-400">
                Aggiungi blocchi per organizzare l'allenamento
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
                    {index + 1}
                  </div>
                  
                  {editingBlock === block.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={block.name}
                        onChange={(e) => {
                          const updatedBlocks = blocks.map(b => 
                            b.id === block.id ? { ...b, name: e.target.value } : b
                          );
                          queryClient.setQueryData(['blocks', sessionId], updatedBlocks);
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => updateBlockMutation.mutate({ 
                          id: block.id, 
                          data: { name: block.name } 
                        })}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingBlock(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{block.name}</p>
                        {(block.start_minute || block.end_minute) && (
                          <p className="text-sm text-slate-500">
                            {block.start_minute || 0}' - {block.end_minute || '?'}'
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingBlock(block.id)}
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
                              <AlertDialogTitle>Elimina blocco</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sei sicuro di voler eliminare "{block.name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteBlockMutation.mutate(block.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Elimina
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}