import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

export default function NewSession() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    team_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    session_type: '',
    focus: '',
    intensity: '',
    notes: '',
    status: 'draft'
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
    mutationFn: (data) => base44.entities.TrainingSession.create(data),
    onSuccess: (newSession) => {
      navigate(createPageUrl(`SessionDetail?id=${newSession.id}`));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const org_id = orgs[0]?.id || '';
    createMutation.mutate({
      ...formData,
      org_id
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Indietro</span>
        </button>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
          Nuova Sessione
        </h1>
        <p className="text-slate-500 mt-1">
          Crea una nuova sessione di allenamento
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Dettagli Sessione
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Team Selection */}
            <div className="space-y-2">
              <Label htmlFor="team">Squadra *</Label>
              <Select 
                value={formData.team_id} 
                onValueChange={(v) => handleChange('team_id', v)}
              >
                <SelectTrigger>
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

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>

            {/* Session Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo Sessione</Label>
              <Select 
                value={formData.session_type} 
                onValueChange={(v) => handleChange('session_type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnico">Tecnico</SelectItem>
                  <SelectItem value="tattico">Tattico</SelectItem>
                  <SelectItem value="fisico">Fisico</SelectItem>
                  <SelectItem value="partitella">Partitella</SelectItem>
                  <SelectItem value="misto">Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Intensity */}
            <div className="space-y-2">
              <Label htmlFor="intensity">Intensità</Label>
              <Select 
                value={formData.intensity} 
                onValueChange={(v) => handleChange('intensity', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona intensità" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bassa">Bassa</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="molto_alta">Molto Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Focus */}
            <div className="space-y-2">
              <Label htmlFor="focus">Focus dell'Allenamento</Label>
              <Input
                id="focus"
                placeholder="es. Transizioni offensive"
                value={formData.focus}
                onChange={(e) => handleChange('focus', e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Note</Label>
              <Textarea
                id="notes"
                placeholder="Note aggiuntive..."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit */}
            <div className="pt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={!formData.team_id || !formData.date || createMutation.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Crea Sessione
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}