import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Check, 
  Users,
  ChevronDown,
  X,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveObservation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [playerObservations, setPlayerObservations] = useState({});
  const [showNote, setShowNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [savingStates, setSavingStates] = useState({});

  const { data: session } = useQuery({
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

  const { data: players = [] } = useQuery({
    queryKey: ['players', session?.team_id],
    queryFn: () => base44.entities.Player.filter({ 
      team_id: session.team_id,
      status: 'active'
    }, 'shirt_number'),
    enabled: !!session?.team_id,
  });

  const { data: behaviors = [] } = useQuery({
    queryKey: ['behaviors'],
    queryFn: () => base44.entities.Behavior.filter({ is_active: true }, 'sort_order'),
  });

  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: () => base44.entities.BehaviorDomain.list('sort_order'),
  });

  const { data: existingObservations = [] } = useQuery({
    queryKey: ['observations', sessionId],
    queryFn: () => base44.entities.Observation.filter({ session_id: sessionId }),
    enabled: !!sessionId,
  });

  // Load existing observations into state
  useEffect(() => {
    if (existingObservations.length > 0 && selectedPlayer) {
      const playerObs = {};
      existingObservations
        .filter(o => o.player_id === selectedPlayer.id)
        .forEach(obs => {
          const key = `${obs.behavior_id}_${obs.block_id || 'all'}`;
          playerObs[key] = { value: obs.value, id: obs.id, note: obs.note };
        });
      setPlayerObservations(playerObs);
    }
  }, [existingObservations, selectedPlayer]);

  const createObservationMutation = useMutation({
    mutationFn: (data) => base44.entities.Observation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations', sessionId] });
    },
  });

  const updateObservationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Observation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations', sessionId] });
    },
  });

  const handleScoreSelect = async (behaviorId, value) => {
    const blockId = selectedBlock === 'all' ? null : selectedBlock;
    const key = `${behaviorId}_${blockId || 'all'}`;
    
    setSavingStates(prev => ({ ...prev, [key]: true }));

    const existingObs = playerObservations[key];

    if (existingObs?.id) {
      // Update existing
      await updateObservationMutation.mutateAsync({
        id: existingObs.id,
        data: { value }
      });
      setPlayerObservations(prev => ({
        ...prev,
        [key]: { ...prev[key], value }
      }));
    } else {
      // Create new
      const newObs = await createObservationMutation.mutateAsync({
        org_id: session.org_id,
        session_id: sessionId,
        block_id: blockId,
        player_id: selectedPlayer.id,
        behavior_id: behaviorId,
        value
      });
      setPlayerObservations(prev => ({
        ...prev,
        [key]: { value, id: newObs.id }
      }));
    }

    setSavingStates(prev => ({ ...prev, [key]: false }));
  };

  const handleSaveNote = async (behaviorId) => {
    const blockId = selectedBlock === 'all' ? null : selectedBlock;
    const key = `${behaviorId}_${blockId || 'all'}`;
    const existingObs = playerObservations[key];

    if (existingObs?.id) {
      await updateObservationMutation.mutateAsync({
        id: existingObs.id,
        data: { note: noteText }
      });
      setPlayerObservations(prev => ({
        ...prev,
        [key]: { ...prev[key], note: noteText }
      }));
    }
    setShowNote(null);
    setNoteText('');
  };

  const getBehaviorsByDomain = (domainId) => {
    return behaviors.filter(b => b.domain_id === domainId);
  };

  const getObservationValue = (behaviorId) => {
    const blockId = selectedBlock === 'all' ? null : selectedBlock;
    const key = `${behaviorId}_${blockId || 'all'}`;
    return playerObservations[key]?.value;
  };

  const getObservationNote = (behaviorId) => {
    const blockId = selectedBlock === 'all' ? null : selectedBlock;
    const key = `${behaviorId}_${blockId || 'all'}`;
    return playerObservations[key]?.note;
  };

  const getRoleColor = (role) => {
    const colors = {
      portiere: 'bg-amber-500',
      difensore: 'bg-blue-500',
      centrocampista: 'bg-emerald-500',
      attaccante: 'bg-red-500'
    };
    return colors[role] || 'bg-slate-500';
  };

  const getPlayerObservationCount = (playerId) => {
    return existingObservations.filter(o => o.player_id === playerId).length;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(createPageUrl(`SessionDetail?id=${sessionId}`))}
            className="flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Indietro</span>
          </button>
          
          <div className="flex-1 text-center px-4">
            <h1 className="text-white font-semibold truncate">Osservazione Live</h1>
          </div>

          <Select value={selectedBlock} onValueChange={setSelectedBlock}>
            <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Blocco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              {blocks.map((block) => (
                <SelectItem key={block.id} value={block.id}>
                  {block.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Players Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {players.map((player) => {
            const obsCount = getPlayerObservationCount(player.id);
            return (
              <motion.button
                key={player.id}
                onClick={() => {
                  setSelectedPlayer(player);
                  setPlayerObservations({});
                }}
                className={`
                  relative p-4 rounded-xl transition-all
                  ${selectedPlayer?.id === player.id 
                    ? 'bg-emerald-600 ring-2 ring-emerald-400' 
                    : 'bg-slate-800 hover:bg-slate-700'
                  }
                `}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`
                  w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold text-xl
                  ${getRoleColor(player.primary_role)}
                `}>
                  {player.shirt_number}
                </div>
                <p className="text-white text-sm mt-2 truncate text-center font-medium">
                  {player.last_name}
                </p>
                {obsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs px-1.5">
                    {obsCount}
                  </Badge>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Behavior Panel */}
      <Sheet open={!!selectedPlayer} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
        <SheetContent side="bottom" className="h-[85vh] bg-slate-900 border-slate-700 p-0">
          <SheetHeader className="p-4 bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-white flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                  ${selectedPlayer ? getRoleColor(selectedPlayer.primary_role) : 'bg-slate-600'}
                `}>
                  {selectedPlayer?.shirt_number}
                </div>
                <span>{selectedPlayer?.first_name} {selectedPlayer?.last_name}</span>
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPlayer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </SheetHeader>

          <div className="overflow-auto h-full pb-20">
            {domains.map((domain) => {
              const domainBehaviors = getBehaviorsByDomain(domain.id);
              if (domainBehaviors.length === 0) return null;

              return (
                <div key={domain.id} className="border-b border-slate-800">
                  <div className="px-4 py-3 bg-slate-800/50 sticky top-0">
                    <h3 className="text-emerald-400 font-semibold text-sm uppercase tracking-wide">
                      {domain.name_it}
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {domainBehaviors.map((behavior) => {
                      const currentValue = getObservationValue(behavior.id);
                      const hasNote = getObservationNote(behavior.id);
                      const blockId = selectedBlock === 'all' ? null : selectedBlock;
                      const key = `${behavior.id}_${blockId || 'all'}`;
                      const isSaving = savingStates[key];

                      return (
                        <div key={behavior.id} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="text-white font-medium text-sm truncate">
                                {behavior.name_it}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setShowNote(behavior.id);
                                setNoteText(getObservationNote(behavior.id) || '');
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                hasNote ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'
                              }`}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex gap-2">
                            {[0, 1, 2, 3].map((score) => (
                              <motion.button
                                key={score}
                                onClick={() => handleScoreSelect(behavior.id, score)}
                                disabled={isSaving}
                                className={`
                                  flex-1 py-3 rounded-xl font-bold text-lg transition-all relative
                                  ${currentValue === score
                                    ? score === 0 ? 'bg-red-500 text-white'
                                    : score === 1 ? 'bg-orange-500 text-white'
                                    : score === 2 ? 'bg-yellow-500 text-slate-900'
                                    : 'bg-emerald-500 text-white'
                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                  }
                                `}
                                whileTap={{ scale: 0.9 }}
                              >
                                {isSaving && currentValue === score ? (
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                  score
                                )}
                                {currentValue === score && !isSaving && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center"
                                  >
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  </motion.div>
                                )}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Note Dialog */}
      <AnimatePresence>
        {showNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowNote(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-xl w-full max-w-md p-4"
            >
              <h3 className="text-white font-semibold mb-3">Aggiungi nota</h3>
              <Input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Nota opzionale..."
                className="bg-slate-700 border-slate-600 text-white mb-3"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNote(null)}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Annulla
                </Button>
                <Button
                  onClick={() => handleSaveNote(showNote)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Salva
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}