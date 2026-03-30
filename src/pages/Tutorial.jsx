import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Play, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from '@/components/ui/alert-dialog';

export default function Tutorial() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);

  const { data: tutorials = [], isLoading } = useQuery({
    queryKey: ['tutorials'],
    queryFn: () => base44.entities.Tutorial.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Tutorial.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tutorials'] }),
  });

  const handleUpload = async () => {
    if (!form.title || !videoFile) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: videoFile });
    await base44.entities.Tutorial.create({
      title: form.title,
      description: form.description,
      video_url: file_url,
    });
    queryClient.invalidateQueries({ queryKey: ['tutorials'] });
    setShowDialog(false);
    setForm({ title: '', description: '' });
    setVideoFile(null);
    setUploading(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Tutorial</h1>
          <p className="text-slate-500 mt-1">Video guide sui comportamenti osservabili</p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          Aggiungi video
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : tutorials.length === 0 ? (
        <div className="text-center py-20">
          <Play className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg font-medium">Nessun tutorial ancora</p>
          <p className="text-slate-400 text-sm mt-1">Carica il primo video per iniziare</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id} className="overflow-hidden group">
              <div
                className="relative bg-slate-900 aspect-video cursor-pointer flex items-center justify-center"
                onClick={() => setPlayingVideo(tutorial)}
              >
                <video
                  src={tutorial.video_url}
                  className="w-full h-full object-cover opacity-70"
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{tutorial.title}</h3>
                    {tutorial.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{tutorial.description}</p>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="shrink-0 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Elimina tutorial</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sei sicuro di voler eliminare "{tutorial.title}"?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(tutorial.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Elimina
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuovo Tutorial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Titolo *</label>
              <Input
                placeholder="es. Come osservare lo Scanning"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Descrizione</label>
              <textarea
                placeholder="Descrivi cosa mostra questo video..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Video *</label>
              {videoFile ? (
                <div className="mt-1 flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                  <Play className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-sm text-slate-700 truncate flex-1">{videoFile.name}</span>
                  <button onClick={() => setVideoFile(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="mt-1 flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-sm text-slate-500">Clicca per selezionare un video</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                  />
                </label>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                Annulla
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!form.title || !videoFile || uploading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Carica'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Player Modal */}
      {playingVideo && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPlayingVideo(null)}
        >
          <div
            className="w-full max-w-3xl bg-black rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900">
              <h3 className="text-white font-semibold truncate">{playingVideo.title}</h3>
              <button
                onClick={() => setPlayingVideo(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <video
              src={playingVideo.video_url}
              controls
              autoPlay
              className="w-full"
            />
            {playingVideo.description && (
              <div className="px-4 py-3 bg-slate-900">
                <p className="text-slate-300 text-sm">{playingVideo.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}