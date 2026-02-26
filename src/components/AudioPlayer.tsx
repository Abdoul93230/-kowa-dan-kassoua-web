'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlayerProps {
  audioUrl: string;
  isCurrentUser?: boolean;
}

export default function AudioPlayer({ audioUrl, isCurrentUser = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsLoading(false);
      console.error('Erreur de chargement audio');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Erreur lecture audio:', error);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `message-vocal-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (time: number): string => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 min-w-[250px] max-w-[300px]">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Bouton Play/Pause */}
      <Button
        onClick={togglePlay}
        disabled={isLoading}
        variant="ghost"
        size="icon"
        className={`h-9 w-9 rounded-full flex-shrink-0 ${
          isCurrentUser
            ? 'hover:bg-white/20 text-white'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        {isLoading ? (
          <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
        ) : isPlaying ? (
          <Pause className="h-5 w-5" fill="currentColor" />
        ) : (
          <Play className="h-5 w-5" fill="currentColor" />
        )}
      </Button>

      {/* Waveform/Progress et temps */}
      <div className="flex-1 flex flex-col gap-1">
        {/* Barre de progression avec style waveform */}
        <div className="relative w-full h-8 flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            disabled={isLoading}
            className="w-full h-1 cursor-pointer appearance-none bg-transparent"
            style={{
              background: `linear-gradient(to right, ${
                isCurrentUser ? 'rgba(255,255,255,0.9)' : '#ec5a13'
              } 0%, ${
                isCurrentUser ? 'rgba(255,255,255,0.9)' : '#ec5a13'
              } ${progressPercentage}%, ${
                isCurrentUser ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'
              } ${progressPercentage}%, ${
                isCurrentUser ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'
              } 100%)`,
              borderRadius: '4px',
            }}
          />
          <style jsx>{`
            input[type='range']::-webkit-slider-thumb {
              appearance: none;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: ${isCurrentUser ? '#ffffff' : '#ec5a13'};
              cursor: pointer;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            }
            input[type='range']::-moz-range-thumb {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: ${isCurrentUser ? '#ffffff' : '#ec5a13'};
              cursor: pointer;
              border: none;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            }
          `}</style>
        </div>

        {/* Durée */}
        <div className={`text-[11px] font-medium ${
          isCurrentUser ? 'text-white/80' : 'text-gray-600'
        }`}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Bouton téléchargement */}
      <Button
        onClick={handleDownload}
        variant="ghost"
        size="icon"
        className={`h-8 w-8 flex-shrink-0 ${
          isCurrentUser
            ? 'hover:bg-white/20 text-white/70 hover:text-white'
            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
        }`}
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}
