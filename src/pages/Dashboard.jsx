import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Calendar, 
  Users, 
  Activity,
  ArrowRight,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.TrainingSession.list('-date', 5),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list(),
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list(),
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

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
          Benvenuto{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-slate-500 mt-1">
          Gestisci le osservazioni comportamentali degli allenamenti
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to={createPageUrl('NewSession')}>
          <Card className="group cursor-pointer border-2 border-dashed border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Nuova Sessione</h3>
                <p className="text-sm text-slate-500">Crea un nuovo allenamento</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold">{sessions.length}</p>
              <p className="text-sm text-slate-300">Sessioni totali</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold">{players.length}</p>
              <p className="text-sm text-emerald-100">Giocatori attivi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Sessioni Recenti</CardTitle>
          <Link to={createPageUrl('Sessions')}>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
              Vedi tutte
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-medium text-slate-600 mb-2">Nessuna sessione</h3>
              <p className="text-sm text-slate-500 mb-4">
                Inizia creando la tua prima sessione di allenamento
              </p>
              <Link to={createPageUrl('NewSession')}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuova Sessione
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Link
                  key={session.id}
                  to={createPageUrl(`SessionDetail?id=${session.id}`)}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-slate-500">
                      {format(new Date(session.date), 'MMM', { locale: it }).toUpperCase()}
                    </span>
                    <span className="text-lg font-bold text-slate-800">
                      {format(new Date(session.date), 'd')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-800 truncate">
                        {getTeamName(session.team_id)}
                      </h4>
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="capitalize">{session.session_type || 'Misto'}</span>
                      {session.focus && (
                        <>
                          <span>•</span>
                          <span className="truncate">{session.focus}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}