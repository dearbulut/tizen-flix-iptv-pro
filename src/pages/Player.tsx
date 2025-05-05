
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XtreamApi } from '@/services/xtreamApi';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Volume2, VolumeX, Settings, X } from 'lucide-react';

const xtreamApi = new XtreamApi();

const Player = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [contentTitle, setContentTitle] = useState('');
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Hide controls after 3 seconds of inactivity
    const hideControlsTimer = () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      
      setControlsTimeout(timeout);
    };
    
    if (showControls) {
      hideControlsTimer();
    }
    
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [showControls]);
  
  useEffect(() => {
    const loadContent = async () => {
      try {
        if (!type || !id) {
          throw new Error('Invalid content parameters');
        }
        
        let streamUrl = '';
        
        switch (type) {
          case 'live':
            const channels = await xtreamApi.getLiveStreams();
            const channel = channels.find(c => c.stream_id === parseInt(id));
            if (channel) {
              setContentTitle(channel.name);
              streamUrl = xtreamApi.getLiveStreamUrl(parseInt(id));
            } else {
              throw new Error('Channel not found');
            }
            break;
            
          case 'movie':
            const movies = await xtreamApi.getVodStreams();
            const movie = movies.find(m => m.stream_id === parseInt(id));
            if (movie) {
              setContentTitle(movie.name);
              streamUrl = xtreamApi.getVodStreamUrl(parseInt(id));
            } else {
              throw new Error('Movie not found');
            }
            break;
            
          case 'series':
            // For series episodes, the id would be the episode id
            // We'd need additional parameters to identify the series and season
            const [seriesId, episodeId] = id.split('_');
            if (!seriesId || !episodeId) {
              throw new Error('Invalid series parameters');
            }
            
            const seriesInfo = await xtreamApi.getSeriesInfo(parseInt(seriesId));
            setContentTitle(seriesInfo.info.name);
            streamUrl = xtreamApi.getSeriesStreamUrl(parseInt(seriesId), episodeId);
            break;
            
          default:
            throw new Error('Unsupported content type');
        }
        
        if (videoRef.current) {
          videoRef.current.src = streamUrl;
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
            setError('Video oynatılırken bir hata oluştu');
          });
        }
        
      } catch (error) {
        console.error('Error loading content:', error);
        setError(error instanceof Error ? error.message : 'İçerik yüklenirken bir hata oluştu');
      }
    };
    
    loadContent();
    
    // Add event listener for keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          navigate(-1);
          break;
        case ' ':
          togglePlayPause();
          break;
        case 'm':
          toggleMute();
          break;
        default:
          break;
      }
      setShowControls(true);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [type, id, navigate]);
  
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
    setShowControls(true);
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
    setShowControls(true);
  };
  
  const handleVideoClick = () => {
    setShowControls(!showControls);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-netflix-black text-white p-4">
        <div className="text-center max-w-lg">
          <h2 className="text-2xl font-bold text-netflix-red mb-4">Oynatma Hatası</h2>
          <p className="text-lg mb-6">{error}</p>
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white"
          >
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-black">
      <video
        ref={videoRef}
        className="h-full w-full"
        autoPlay
        onClick={handleVideoClick}
        onError={() => setError('Video yüklenemedi. Lütfen daha sonra tekrar deneyiniz.')}
      >
        Your browser does not support the video tag.
      </video>
      
      {showControls && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col">
          {/* Top bar */}
          <div className="p-4 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <ArrowLeft size={24} />
            </Button>
            <h2 className="ml-4 text-xl font-medium text-white">{contentTitle}</h2>
          </div>
          
          {/* Center play/pause button */}
          <div className="flex-grow flex items-center justify-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={togglePlayPause}
              className="w-20 h-20 bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full"
            >
              {isPlaying ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4H6V20H10V4Z" fill="white" />
                  <path d="M18 4H14V20H18V4Z" fill="white" />
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="white" />
                </svg>
              )}
            </Button>
          </div>
          
          {/* Bottom controls */}
          <div className="p-4 flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMute}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <Settings size={24} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
