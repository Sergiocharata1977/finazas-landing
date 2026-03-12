// src/app/(dashboard)/vendedor/clientes/[id]/visita/page.tsx
// Formulario de nueva visita con captura de fotos, audio y GPS

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { compressPhoto } from '@/lib/vendedor/compression';
import { db } from '@/lib/vendedor/db';
import type { ChecklistItem, UbicacionGPS } from '@/types/vendedor';
import {
  ArrowLeft,
  Camera,
  Check,
  Loader2,
  MapPin,
  Mic,
  Plus,
  Save,
  Square,
  X,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface FotoPreview {
  id: string;
  url: string;
  blob: Blob;
  thumbnail: Blob;
}

export default function NuevaVisitaPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const organizationId = user?.organization_id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Estado del formulario
  const [objetivo, setObjetivo] = useState('');
  const [notas, setNotas] = useState('');
  const [resultado, setResultado] = useState<
    'exitosa' | 'sin_contacto' | 'reprogramar' | ''
  >('');

  // Fotos
  const [fotos, setFotos] = useState<FotoPreview[]>([]);
  const [capturingPhoto, setCapturingPhoto] = useState(false);

  // Audio
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // GPS
  const [ubicacion, setUbicacion] = useState<UbicacionGPS | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: '1',
      texto: 'Verificar stock de productos',
      completado: false,
      obligatorio: false,
      orden: 1,
    },
    {
      id: '2',
      texto: 'Revisar estado de cultivos',
      completado: false,
      obligatorio: false,
      orden: 2,
    },
    {
      id: '3',
      texto: 'Consultar necesidades de insumos',
      completado: false,
      obligatorio: true,
      orden: 3,
    },
  ]);

  // Estado general
  const [saving, setSaving] = useState(false);
  const [clienteNombre, setClienteNombre] = useState('');

  // Obtener ubicación al cargar
  useEffect(() => {
    captureGPS();
    // TODO: Cargar nombre del cliente desde IndexedDB
    setClienteNombre('Agro Norte S.A.');
  }, []);

  // Capturar GPS
  const captureGPS = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('GPS no disponible');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        setUbicacion({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          timestamp: new Date().toISOString(),
        });
        setGpsLoading(false);
      },
      error => {
        setGpsError('No se pudo obtener ubicación');
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Capturar foto
  const handlePhotoCapture = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCapturingPhoto(true);
    try {
      const { blob, thumbnail } = await compressPhoto(file);
      const id = crypto.randomUUID();
      const url = URL.createObjectURL(blob);

      setFotos(prev => [...prev, { id, url, blob, thumbnail }]);
    } catch (error) {
      console.error('Error al procesar foto:', error);
    } finally {
      setCapturingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (id: string) => {
    setFotos(prev => {
      const foto = prev.find(f => f.id === id);
      if (foto) {
        URL.revokeObjectURL(foto.url);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  // Grabación de audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Timer para duración
      const startTime = Date.now();
      const interval = setInterval(() => {
        setAudioDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      mediaRecorderRef.current.addEventListener('stop', () => {
        clearInterval(interval);
      });
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioDuration(0);
  };

  // Toggle checklist item
  const toggleChecklist = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completado: !item.completado } : item
      )
    );
  };

  // Guardar visita
  const handleSave = async () => {
    if (!organizationId || !user?.id) return;

    setSaving(true);
    try {
      const visitaId = crypto.randomUUID();
      const now = new Date().toISOString();

      // Guardar fotos en IndexedDB
      const fotosIds: string[] = [];
      for (const foto of fotos) {
        const fotoId = await db.saveFotoWithBlob(
          {
            id: foto.id,
            organizationId,
            visitaId,
            clienteId: params.id as string,
            descripcion: '',
            tipo: 'campo',
            ubicacion: ubicacion || undefined,
            timestamp: now,
            syncStatus: 'pending',
            createdAt: now,
          },
          foto.blob,
          foto.thumbnail
        );
        fotosIds.push(fotoId);
      }

      // Guardar audio si existe
      const audiosIds: string[] = [];
      if (audioBlob) {
        const audioId = await db.saveAudioWithBlob(
          {
            id: crypto.randomUUID(),
            organizationId,
            visitaId,
            clienteId: params.id as string,
            duracionSegundos: audioDuration,
            transcripcionStatus: 'pending',
            timestamp: now,
            syncStatus: 'pending',
            createdAt: now,
          },
          audioBlob
        );
        audiosIds.push(audioId);
      }

      // Crear visita
      await db.createVisita({
        organizationId,
        clienteId: params.id as string,
        vendedorId: user.id,
        fecha: now.split('T')[0],
        horaInicio: now.split('T')[1].substring(0, 5),
        tipo: 'visita_campo',
        objetivo,
        notas,
        resultado: resultado || undefined,
        ubicacionInicio: ubicacion || undefined,
        fotosIds,
        audiosIds,
        checklist,
      });

      // Limpiar URLs de objetos
      fotos.forEach(f => URL.revokeObjectURL(f.url));
      if (audioUrl) URL.revokeObjectURL(audioUrl);

      // Navegar de vuelta
      router.push(`/app-vendedor/clientes/${params.id}`);
    } catch (error) {
      console.error('Error al guardar visita:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Cancelar</span>
          </button>
          <h1 className="font-semibold">Nueva Visita</h1>
          <div className="w-20" />
        </div>
        <p className="text-white/80 text-sm mt-2">{clienteNombre}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* GPS Status */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin
                  className={`w-5 h-5 ${ubicacion ? 'text-green-500' : 'text-gray-400'}`}
                />
                <div>
                  <p className="text-sm font-medium">
                    {gpsLoading
                      ? 'Obteniendo ubicación...'
                      : ubicacion
                        ? 'Ubicación capturada'
                        : gpsError || 'Sin ubicación'}
                  </p>
                  {ubicacion && (
                    <p className="text-xs text-gray-500">
                      Precisión: {Math.round(ubicacion.accuracy)}m
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={captureGPS}
                disabled={gpsLoading}
              >
                {gpsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Actualizar'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Objetivo */}
        <div className="space-y-2">
          <Label htmlFor="objetivo">Objetivo de la visita</Label>
          <Input
            id="objetivo"
            value={objetivo}
            onChange={e => setObjetivo(e.target.value)}
            placeholder="¿Cuál es el objetivo de esta visita?"
          />
        </div>

        {/* Fotos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Fotos ({fotos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {fotos.map(foto => (
                <div key={foto.id} className="relative w-20 h-20">
                  <img
                    src={foto.url}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(foto.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={capturingPhoto}
                className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
              >
                {capturingPhoto ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-6 h-6" />
                    <span className="text-xs">Foto</span>
                  </>
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Audio */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Nota de voz
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!audioBlob ? (
              <div className="flex items-center gap-4">
                <Button
                  variant={isRecording ? 'destructive' : 'outline'}
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  className="flex-1"
                >
                  {isRecording ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Detener ({formatDuration(audioDuration)})
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Grabar nota
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <audio src={audioUrl || ''} controls className="flex-1 h-10" />
                <Button variant="ghost" size="icon" onClick={removeAudio}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {checklist.map(item => (
              <button
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    item.completado
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}
                >
                  {item.completado && <Check className="w-4 h-4 text-white" />}
                </div>
                <span
                  className={
                    item.completado ? 'line-through text-gray-400' : ''
                  }
                >
                  {item.texto}
                  {item.obligatorio && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Notas */}
        <div className="space-y-2">
          <Label htmlFor="notas">Notas adicionales</Label>
          <Textarea
            id="notas"
            value={notas}
            onChange={e => setNotas(e.target.value)}
            placeholder="Observaciones, comentarios, etc."
            rows={4}
          />
        </div>

        {/* Resultado */}
        <div className="space-y-2">
          <Label>Resultado de la visita</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                value: 'exitosa',
                label: 'Exitosa',
                color: 'bg-green-100 border-green-500 text-green-700',
              },
              {
                value: 'sin_contacto',
                label: 'Sin contacto',
                color: 'bg-red-100 border-red-500 text-red-700',
              },
              {
                value: 'reprogramar',
                label: 'Reprogramar',
                color: 'bg-yellow-100 border-yellow-500 text-yellow-700',
              },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setResultado(opt.value as typeof resultado)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  resultado === opt.value
                    ? opt.color
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botón Guardar */}
        <Button
          className="w-full h-14 text-lg gap-2"
          size="lg"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Visita
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-500">
          Los datos se guardarán localmente y se sincronizarán cuando haya
          conexión
        </p>
      </div>
    </div>
  );
}
