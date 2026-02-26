'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send, X, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob) => Promise<void>;
  onCancel: () => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

export default function VoiceRecorder({ onSendVoice, onCancel, onStartRecording, onStopRecording }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Arrêter tous les tracks audio pour libérer le micro
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Notifier le parent que l'enregistrement a commencé
      onStartRecording?.();
      
      // Démarrer le timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Erreur accès microphone:', error);
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Notifier le parent que l'enregistrement s'est arrêté
      onStopRecording?.();
    }
  };

  const handleSend = async () => {
    if (!audioBlob) return;
    
    try {
      setIsSending(true);
      await onSendVoice(audioBlob);
      // Le parent va gérer la fermeture
    } catch (error) {
      console.error('Erreur envoi vocal:', error);
      alert('Erreur lors de l\'envoi du message vocal');
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Notifier le parent si pas déjà fait (si on n'enregistrait pas)
    if (!isRecording) {
      onStopRecording?.();
    }
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 bg-white border-t border-gray-200 p-3">
      {!audioBlob ? (
        <>
          {/* Recording UI */}
          {isRecording ? (
            <>
              <div className="flex-1 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatTime(recordingTime)}
                  </span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#ec5a13] transition-all"
                    style={{ width: `${Math.min((recordingTime / 60) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <Button
                onClick={stopRecording}
                size="icon"
                className="bg-red-500 hover:bg-red-600 rounded-full"
              >
                <Square className="h-5 w-5 text-white fill-white" />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={startRecording}
                size="icon"
                className="bg-[#ec5a13] hover:bg-[#d94f0f] rounded-full"
              >
                <Mic className="h-5 w-5 text-white" />
              </Button>
              <span className="text-sm text-gray-600">Appuyez pour enregistrer</span>
            </>
          )}
          
          <Button
            onClick={handleCancel}
            size="icon"
            variant="ghost"
            className="rounded-full"
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </>
      ) : (
        <>
          {/* Preview and send UI */}
          <audio src={URL.createObjectURL(audioBlob)} controls className="flex-1" />
          
          <Button
            onClick={handleSend}
            disabled={isSending}
            size="icon"
            className="bg-[#ec5a13] hover:bg-[#d94f0f] rounded-full"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            ) : (
              <Send className="h-5 w-5 text-white" />
            )}
          </Button>
          
          <Button
            onClick={handleCancel}
            disabled={isSending}
            size="icon"
            variant="ghost"
            className="rounded-full"
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </>
      )}
    </div>
  );
}
