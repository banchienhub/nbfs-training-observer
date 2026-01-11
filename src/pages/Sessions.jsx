import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, ArrowRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Sessions() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.TrainingSession.list('-date'),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list(),
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

  const getIntensityColor = (intensity) => {
    const colors = {
      bassa: 'bg-blue-100 text-blue-700',
      media: 'bg-yellow-100 text-yellow-700',
      alta: 'bg-orange-100 text-orange-700',
      molto_alta: 'bg-red-100 text-red-700'
    };
    return colors[intensity] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
            Sessioni di Allenamento
          </h1>
          <p className="text-slate-500 mt-1">
            Gestisci e visualizza tutte le sessioni
          </p>
        </div>
        <Link to={createPageUrl('NewSession')}>
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25">
            <Plus className="w-4 h-4 mr-2" />
            Nuova Sessione
          </Button>
        </Link>
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-slate-100 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-700 text-lg mb-2">
              Nessuna sessione
            </h3>
            <p className="text-slate-500 mb-6">
              Crea la tua prima sessione di allenamento per iniziare
            </p>
            <Link to={createPageUrl('NewSession')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Crea Sessione
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Link
              key={session.id}
              to={createPageUrl(`SessionDetail?id=${session.id}`)}
            >
              <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Date Badge */}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        {format(new Date(session.date), 'MMM', { locale: it })}
                      </span>
                      <span className="text-2xl font-bold text-slate-800">
                        {format(new Date(session.date), 'd')}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-semibold text-slate-800 text-lg">
                          {getTeamName(session.team_id)}
                        </h3>
                        {getStatusBadge(session.status)}
                      </div>
                      
                      <div className="flex items-center gap-3 flex-wrap text-sm">
                        {session.session_type && (
                          <Badge variant="outline" className="capitalize">
                            {session.session_type}
                          </Badge>
                        )}
                        {session.intensity && (
                          <Badge className={getIntensityColor(session.intensity)}>
                            Intensità {session.intensity.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>

                      {session.focus && (
                        <p className="text-sm text-slate-500 mt-2 truncate">
                          Focus: {session.focus}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}