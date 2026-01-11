import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Calculator,
  Download,
  User,
  BarChart3,
  Loader2,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// Index calculation mappings
const INDEX_MAPPINGS = {
  PAI: ['SCAN', 'OPL', 'PRAD', 'SENV'],
  DEI: ['DLAT', 'OPL', 'TFLEX', 'RREAD'],
  RRI: ['EREC', 'ASRES', 'LACC', 'FRUST', 'SELFC'],
  CLX: ['QCOM', 'CTIM', 'LPRESS', 'CMLEAD'],
  COAX: ['TFLEX', 'CRIG', 'ADEC', 'FEEDB', 'SELFC'],
  CAB: ['CAMBAL', 'CMLEAD'],
  TMI: ['CPTRIG', 'CMREAD'],
  DST: ['DISTH', 'FRUST'],
  SPIF: ['SPDISC']
};

const INVERSE_BEHAVIORS = ['DLAT', 'CRIG'];

const INDEX_LABELS = {
  PAI: 'Perceptual Attention',
  DEI: 'Decision Efficiency',
  RRI: 'Resilience Recovery',
  CLX: 'Communication Leadership',
  COAX: 'Coachability',
  CAB: 'Camaraderie Balance',
  TMI: 'Transition Momentum',
  DST: 'Discipline Stress',
  SPIF: 'Set Piece Intelligence'
};

export default function SessionReport() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const { data: session } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const sessions = await base44.entities.TrainingSession.filter({ id: sessionId });
      return sessions[0];
    },
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
    queryFn: () => base44.entities.Behavior.list(),
  });

  const { data: observations = [] } = useQuery({
    queryKey: ['observations', sessionId],
    queryFn: () => base44.entities.Observation.filter({ session_id: sessionId }),
    enabled: !!sessionId,
  });

  const { data: existingIndices = [] } = useQuery({
    queryKey: ['indices', sessionId],
    queryFn: () => base44.entities.PlayerSessionIndex.filter({ session_id: sessionId }),
    enabled: !!sessionId,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list(),
  });

  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: () => base44.entities.BehaviorDomain.list('sort_order'),
  });

  const behaviorCodeMap = useMemo(() => {
    const map = {};
    behaviors.forEach(b => {
      map[b.id] = b;
    });
    return map;
  }, [behaviors]);

  const calculateIndices = async () => {
    setIsCalculating(true);

    for (const player of players) {
      const playerObs = observations.filter(o => o.player_id === player.id);
      
      if (playerObs.length === 0) continue;

      // Group observations by behavior
      const behaviorValues = {};
      playerObs.forEach(obs => {
        const behavior = behaviorCodeMap[obs.behavior_id];
        if (behavior) {
          if (!behaviorValues[behavior.code]) {
            behaviorValues[behavior.code] = [];
          }
          behaviorValues[behavior.code].push(obs.value);
        }
      });

      // Calculate average for each behavior
      const behaviorAverages = {};
      Object.keys(behaviorValues).forEach(code => {
        const values = behaviorValues[code];
        let avg = values.reduce((a, b) => a + b, 0) / values.length;
        
        // Apply inverse if needed
        if (INVERSE_BEHAVIORS.includes(code)) {
          avg = 3 - avg;
        }
        
        behaviorAverages[code] = avg;
      });

      // Calculate indices
      const indices = {};
      Object.keys(INDEX_MAPPINGS).forEach(indexName => {
        const behaviorCodes = INDEX_MAPPINGS[indexName];
        const values = behaviorCodes
          .filter(code => behaviorAverages[code] !== undefined)
          .map(code => behaviorAverages[code]);
        
        if (values.length > 0) {
          indices[indexName] = values.reduce((a, b) => a + b, 0) / values.length;
        } else {
          indices[indexName] = null;
        }
      });

      // Calculate overall
      const validIndices = Object.values(indices).filter(v => v !== null);
      const overall = validIndices.length > 0 
        ? validIndices.reduce((a, b) => a + b, 0) / validIndices.length
        : null;

      // Check if exists
      const existing = existingIndices.find(i => i.player_id === player.id);

      if (existing) {
        await base44.entities.PlayerSessionIndex.update(existing.id, {
          ...indices,
          overall,
          computed_version: '1.0'
        });
      } else {
        await base44.entities.PlayerSessionIndex.create({
          session_id: sessionId,
          player_id: player.id,
          ...indices,
          overall,
          computed_version: '1.0'
        });
      }
    }

    await queryClient.invalidateQueries({ queryKey: ['indices', sessionId] });
    setIsCalculating(false);
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'N/A';
  };

  const getPlayerIndices = (playerId) => {
    return existingIndices.find(i => i.player_id === playerId);
  };

  const getPlayerObservations = (playerId) => {
    return observations.filter(o => o.player_id === playerId);
  };

  const getScoreColor = (value) => {
    if (value === null || value === undefined) return 'text-slate-400';
    if (value >= 2.5) return 'text-emerald-500';
    if (value >= 1.5) return 'text-yellow-500';
    if (value >= 0.5) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (value) => {
    if (value === null || value === undefined) return 'bg-slate-100';
    if (value >= 2.5) return 'bg-emerald-100';
    if (value >= 1.5) return 'bg-yellow-100';
    if (value >= 0.5) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getRadarData = (indices) => {
    return Object.keys(INDEX_MAPPINGS).map(key => ({
      index: key,
      value: indices?.[key] ?? 0,
      fullMark: 3
    }));
  };

  const exportToCSV = () => {
    const headers = ['Giocatore', 'Numero', ...Object.keys(INDEX_MAPPINGS), 'Overall'];
    const rows = players.map(player => {
      const indices = getPlayerIndices(player.id);
      return [
        `${player.first_name} ${player.last_name}`,
        player.shirt_number,
        ...Object.keys(INDEX_MAPPINGS).map(k => indices?.[k]?.toFixed(2) || '-'),
        indices?.overall?.toFixed(2) || '-'
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_sessione_${session?.date || 'export'}.csv`;
    a.click();
  };

  const selectedPlayerData = selectedPlayer ? {
    player: selectedPlayer,
    indices: getPlayerIndices(selectedPlayer.id),
    observations: getPlayerObservations(selectedPlayer.id)
  } : null;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate(createPageUrl(`SessionDetail?id=${sessionId}`))}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Torna alla sessione</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
              Report Sessione
            </h1>
            <p className="text-slate-500 mt-1">
              {getTeamName(session?.team_id)} - {session?.date && format(new Date(session.date), "d MMMM yyyy", { locale: it })}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Esporta CSV
            </Button>
            <Button
              onClick={calculateIndices}
              disabled={isCalculating}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              {isCalculating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Calculator className="w-4 h-4" />
              )}
              Calcola Indici
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Giocatori</p>
            <p className="text-2xl font-bold text-slate-800">{players.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Osservazioni</p>
            <p className="text-2xl font-bold text-slate-800">{observations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Indici Calcolati</p>
            <p className="text-2xl font-bold text-slate-800">{existingIndices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Copertura</p>
            <p className="text-2xl font-bold text-slate-800">
              {players.length > 0 
                ? Math.round((existingIndices.length / players.length) * 100) 
                : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Players Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Indici per Giocatore
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 text-sm">Giocatore</th>
                  {Object.keys(INDEX_MAPPINGS).map(key => (
                    <th key={key} className="text-center py-3 px-2 font-semibold text-slate-600 text-xs">
                      {key}
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-semibold text-slate-600 text-sm">Overall</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => {
                  const indices = getPlayerIndices(player.id);
                  const obsCount = getPlayerObservations(player.id).length;
                  
                  return (
                    <tr 
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-sm">
                            {player.shirt_number}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{player.last_name}</p>
                            <p className="text-xs text-slate-500">{obsCount} obs.</p>
                          </div>
                        </div>
                      </td>
                      {Object.keys(INDEX_MAPPINGS).map(key => (
                        <td key={key} className="py-3 px-2 text-center">
                          {indices?.[key] !== null && indices?.[key] !== undefined ? (
                            <span className={`
                              inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold
                              ${getScoreBg(indices[key])} ${getScoreColor(indices[key])}
                            `}>
                              {indices[key].toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      ))}
                      <td className="py-3 px-4 text-center">
                        {indices?.overall !== null && indices?.overall !== undefined ? (
                          <Badge className={`${getScoreBg(indices.overall)} ${getScoreColor(indices.overall)} font-bold`}>
                            {indices.overall.toFixed(2)}
                          </Badge>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Player Detail Sheet */}
      <Sheet open={!!selectedPlayer} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 overflow-y-auto">
          {selectedPlayerData && (
            <>
              <SheetHeader className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xl">
                      {selectedPlayerData.player.shirt_number}
                    </div>
                    <div>
                      <SheetTitle className="text-white text-xl">
                        {selectedPlayerData.player.first_name} {selectedPlayerData.player.last_name}
                      </SheetTitle>
                      <p className="text-slate-400 capitalize">{selectedPlayerData.player.primary_role}</p>
                    </div>
                  </div>
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

              <div className="p-6 space-y-6">
                {/* Radar Chart */}
                {selectedPlayerData.indices && (
                  <Card>
                    <CardContent className="p-4">
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={getRadarData(selectedPlayerData.indices)}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis 
                            dataKey="index" 
                            tick={{ fill: '#64748b', fontSize: 11 }}
                          />
                          <PolarRadiusAxis 
                            angle={30} 
                            domain={[0, 3]} 
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                          />
                          <Radar
                            name="Indici"
                            dataKey="value"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Index Details */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Dettaglio Indici</h3>
                  <div className="space-y-2">
                    {Object.keys(INDEX_MAPPINGS).map(key => {
                      const value = selectedPlayerData.indices?.[key];
                      return (
                        <div 
                          key={key}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-slate-800">{key}</p>
                            <p className="text-xs text-slate-500">{INDEX_LABELS[key]}</p>
                          </div>
                          <span className={`
                            font-bold text-lg
                            ${getScoreColor(value)}
                          `}>
                            {value !== null && value !== undefined ? value.toFixed(2) : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Observations List */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">
                    Osservazioni ({selectedPlayerData.observations.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedPlayerData.observations.map((obs) => {
                      const behavior = behaviorCodeMap[obs.behavior_id];
                      return (
                        <div 
                          key={obs.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate text-sm">
                              {behavior?.name_it || 'N/A'}
                            </p>
                            {obs.note && (
                              <p className="text-xs text-slate-500 truncate">{obs.note}</p>
                            )}
                          </div>
                          <Badge className={`${getScoreBg(obs.value)} ${getScoreColor(obs.value)} shrink-0`}>
                            {obs.value}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}