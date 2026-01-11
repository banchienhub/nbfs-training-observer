import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  Calendar, 
  ArrowRight,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Reports() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.TrainingSession.list('-date'),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list(),
  });

  const { data: observations = [] } = useQuery({
    queryKey: ['all-observations'],
    queryFn: () => base44.entities.Observation.list(),
  });

  const { data: indices = [] } = useQuery({
    queryKey: ['all-indices'],
    queryFn: () => base44.entities.PlayerSessionIndex.list(),
  });

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'N/A';
  };

  const getSessionStats = (sessionId) => {
    const sessionObs = observations.filter(o => o.session_id === sessionId);
    const sessionIndices = indices.filter(i => i.session_id === sessionId);
    return {
      observations: sessionObs.length,
      playersWithIndices: sessionIndices.length
    };
  };

  // Filter only completed or in_progress sessions with data
  const sessionsWithData = sessions.filter(s => {
    const stats = getSessionStats(s.id);
    return stats.observations > 0 || stats.playersWithIndices > 0;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
          Report
        </h1>
        <p className="text-slate-500 mt-1">
          Visualizza i report delle sessioni completate
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Sessioni Totali</p>
            <p className="text-2xl font-bold text-slate-800">{sessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Con Dati</p>
            <p className="text-2xl font-bold text-emerald-600">{sessionsWithData.length}</p>
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
            <p className="text-2xl font-bold text-slate-800">{indices.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Sessioni con Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-20 bg-slate-100 rounded-lg" />
              ))}
            </div>
          ) : sessionsWithData.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 text-lg mb-2">
                Nessun report disponibile
              </h3>
              <p className="text-slate-500">
                Completa alcune osservazioni per generare i report
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessionsWithData.map((session) => {
                const stats = getSessionStats(session.id);
                return (
                  <Link
                    key={session.id}
                    to={createPageUrl(`SessionReport?session_id=${session.id}`)}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 flex flex-col items-center justify-center">
                      <span className="text-xs font-semibold text-emerald-600 uppercase">
                        {format(new Date(session.date), 'MMM', { locale: it })}
                      </span>
                      <span className="text-xl font-bold text-emerald-700">
                        {format(new Date(session.date), 'd')}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800">
                        {getTeamName(session.team_id)}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span>{stats.observations} osservazioni</span>
                        <span>•</span>
                        <span>{stats.playersWithIndices} giocatori con indici</span>
                      </div>
                    </div>

                    <Badge className="bg-emerald-100 text-emerald-700">
                      Vedi Report
                    </Badge>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}