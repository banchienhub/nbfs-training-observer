import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Play, Loader2, Upload, X, Pencil } from 'lucide-react';
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
  const [batchItems, setBatchItems] = useState([]); // [{ file, title, description }]
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [playingVideo, setPlayingVideo] = useState(null);
  const [editingTutorial, setEditingTutorial] = useState(null); // { id, title, description }

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tutorial.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutorials'] });
      setEditingTutorial(null);
    },
  });

  const { data: tutorials = [], isLoading } = useQuery({
    queryKey: ['tutorials'],
    queryFn: () => base44.entities.Tutorial.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Tutorial.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tutorials'] }),
  });

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map((file) => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ''), // strip extension as default title
      description: '',
    }));
    setBatchItems((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const updateItem = (index, field, value) => {
    setBatchItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeItem = (index) => {
    setBatchItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (batchItems.length === 0) return;
    setUploading(true);
    setUploadProgress({ done: 0, total: batchItems.length });
    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i];
      const { file_url } = await base44.integrations.Core.UploadFile({ file: item.file });
      await base44.entities.Tutorial.create({
        title: item.title || item.file.name,
        description: item.description,
        video_url: file_url,
      });
      setUploadProgress({ done: i + 1, total: batchItems.length });
    }
    queryClient.invalidateQueries({ queryKey: ['tutorials'] });
    setShowDialog(false);
    setBatchItems([]);
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
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 text-slate-400 hover:text-slate-700"
                    onClick={() => setEditingTutorial({ id: tutorial.id, title: tutorial.title, description: tutorial.description || '' })}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!uploading) { setShowDialog(open); if (!open) setBatchItems([]); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Carica Tutorial</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Drop zone */}
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-sm text-slate-500 font-medium">Clicca per aggiungere video</span>
              <span className="text-xs text-slate-400">Puoi selezionarne più d'uno</span>
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={handleFilesSelected}
              />
            </label>

            {/* Batch list */}
            {batchItems.length > 0 && (
              <div className="space-y-3">
                {batchItems.map((item, index) => (
                  <div key={index} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Play className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs text-slate-500 truncate flex-1">{item.file.name}</span>
                      <button onClick={() => removeItem(index)} className="text-slate-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Input
                      placeholder="Titolo *"
                      value={item.title}
                      onChange={(e) => updateItem(index, 'title', e.target.value)}
                      className="mb-2 bg-white"
                    />
                    <textarea
                      placeholder="Descrizione (opzionale)"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {uploading && (
            <div className="pt-3">
              <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                <span>Caricamento in corso...</span>
                <span>{uploadProgress.done}/{uploadProgress.total}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t mt-2">
            <Button variant="outline" onClick={() => { setShowDialog(false); setBatchItems([]); }} className="flex-1" disabled={uploading}>
              Annulla
            </Button>
            <Button
              onClick={handleUpload}
              disabled={batchItems.length === 0 || batchItems.some(i => !i.title) || uploading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Carica ${batchItems.length > 1 ? `${batchItems.length} video` : 'video'}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTutorial} onOpenChange={(open) => !open && setEditingTutorial(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica Tutorial</DialogTitle>
          </DialogHeader>
          {editingTutorial && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Titolo *</label>
                <Input
                  value={editingTutorial.title}
                  onChange={(e) => setEditingTutorial({ ...editingTutorial, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Descrizione</label>
                <textarea
                  value={editingTutorial.description}
                  onChange={(e) => setEditingTutorial({ ...editingTutorial, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 gap-2">
                      <Trash2 className="w-4 h-4" />
                      Elimina
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Elimina tutorial</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sei sicuro di voler eliminare "{editingTutorial.title}"?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => { deleteMutation.mutate(editingTutorial.id); setEditingTutorial(null); }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Elimina
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <div className="flex gap-2 flex-1 justify-end">
                  <Button variant="outline" onClick={() => setEditingTutorial(null)}>Annulla</Button>
                  <Button
                    onClick={() => updateMutation.mutate({ id: editingTutorial.id, data: { title: editingTutorial.title, description: editingTutorial.description } })}
                    disabled={!editingTutorial.title || updateMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salva'}
                  </Button>
                </div>
              </div>
            </div>
          )}
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