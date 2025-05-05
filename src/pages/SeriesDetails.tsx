
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { XtreamApi, Series, SeriesInfo } from '@/services/xtreamApi';
import { Button } from '@/components/ui/button';
import { Play, Star, Calendar } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

const xtreamApi = new XtreamApi();

interface Episode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    movie_image: string;
    plot: string;
    duration_secs: number;
    duration: string;
  };
}

interface Season {
  season_number: string;
  episodes: Episode[];
}

// Extended Series type to accommodate optional properties
interface ExtendedSeries extends Series {
  year?: string;
}

// Extended SeriesInfo to accommodate optional properties
interface ExtendedSeriesInfo extends SeriesInfo {
  info: {
    name: string;
    cover: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    release_date: string;
    last_modified: string;
    rating: string;
    rating_5based: number;
    cover_big?: string;
  };
}

const SeriesDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [series, setSeries] = useState<ExtendedSeries | null>(null);
  const [seriesInfo, setSeriesInfo] = useState<ExtendedSeriesInfo | null>(null);
  const [seasons, setSeasons] = useState<Record<string, Season>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSeriesDetails = async () => {
      setIsLoading(true);
      try {
        if (!id) {
          throw new Error('Dizi ID bulunamadı');
        }
        
        // Get basic series info
        const allSeries = await xtreamApi.getSeriesList();
        const foundSeries = allSeries.find(s => s.series_id === parseInt(id));
        
        if (foundSeries) {
          setSeries(foundSeries as ExtendedSeries);
          
          // Get detailed series info with episodes
          const info = await xtreamApi.getSeriesInfo(parseInt(id));
          setSeriesInfo(info as ExtendedSeriesInfo);
          
          // Organize episodes by season
          const seasonMap: Record<string, Season> = {};
          
          if (info && info.episodes) {
            Object.entries(info.episodes).forEach(([seasonNum, episodes]) => {
              seasonMap[seasonNum] = {
                season_number: seasonNum,
                episodes: episodes as Episode[]
              };
            });
          }
          
          setSeasons(seasonMap);
        } else {
          throw new Error('Dizi bulunamadı');
        }
      } catch (error) {
        console.error('Error loading series details:', error);
        setError(error instanceof Error ? error.message : 'Dizi detayları yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSeriesDetails();
  }, [id]);

  const handlePlayEpisode = (seasonNum: string, episodeId: string) => {
    navigate(`/player/series/${id}_${episodeId}`);
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} sa ${minutes} dk`;
    }
    return `${minutes} dk`;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red mx-auto"></div>
            <p className="mt-4 text-xl text-white">Dizi detayları yükleniyor...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !series || !seriesInfo) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-netflix-darkGray p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-netflix-red mb-4">Hata</h2>
            <p className="text-lg text-white mb-6">{error || 'Dizi bulunamadı'}</p>
            <Button 
              onClick={() => navigate('/series')}
              className="bg-netflix-red hover:bg-red-700"
            >
              Dizilere Dön
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const coverImage = series.cover || (seriesInfo.info.cover_big || seriesInfo.info.cover) || '/placeholder.svg';

  return (
    <MainLayout>
      <div className="relative">
        {/* Background image with overlay */}
        <div className="absolute inset-0 h-[50vh] md:h-[70vh]">
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-black to-transparent z-10"></div>
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${coverImage})`
            }}
          ></div>
        </div>
        
        {/* Content */}
        <div className="relative z-20 min-h-screen">
          <div className="container mx-auto px-4 pt-[30vh] md:pt-[45vh]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Series poster */}
              <div className="hidden md:block">
                <div className="w-full max-w-xs mx-auto">
                  <img 
                    src={series.cover || seriesInfo.info.cover || '/placeholder.svg'} 
                    alt={series.name}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              </div>
              
              {/* Series details */}
              <div className="md:col-span-2 space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white">{series.name}</h1>
                
                <div className="flex flex-wrap gap-4">
                  {series.year && (
                    <div className="flex items-center text-gray-300">
                      <Calendar size={16} className="mr-1" />
                      <span>{series.year}</span>
                    </div>
                  )}
                  {series.rating && (
                    <div className="flex items-center text-gray-300">
                      <Star size={16} className="mr-1 text-yellow-500" />
                      <span>{series.rating}</span>
                    </div>
                  )}
                  {seriesInfo.info.genre && (
                    <div className="flex items-center text-gray-300">
                      <span>{seriesInfo.info.genre}</span>
                    </div>
                  )}
                </div>
                
                {seriesInfo.info.plot && (
                  <div className="text-gray-300">
                    <h2 className="text-xl font-semibold text-white mb-2">Özet</h2>
                    <p>{seriesInfo.info.plot}</p>
                  </div>
                )}
                
                {seriesInfo.info.cast && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">Oyuncular</h2>
                    <p className="text-gray-300">{seriesInfo.info.cast}</p>
                  </div>
                )}
                
                {seriesInfo.info.director && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">Yönetmen</h2>
                    <p className="text-gray-300">{seriesInfo.info.director}</p>
                  </div>
                )}
                
                {/* Episodes by season */}
                <div className="pt-6">
                  <h2 className="text-2xl font-semibold text-white mb-4">Bölümler</h2>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {Object.keys(seasons).sort().map((seasonNum) => (
                      <AccordionItem 
                        key={seasonNum} 
                        value={seasonNum}
                        className="border-netflix-mediumGray"
                      >
                        <AccordionTrigger className="text-xl text-white hover:text-netflix-red">
                          Sezon {seasonNum}
                        </AccordionTrigger>
                        <AccordionContent>
                          <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                              {seasons[seasonNum].episodes.map((episode) => (
                                <div 
                                  key={episode.id}
                                  className="bg-netflix-darkGray rounded-lg overflow-hidden"
                                >
                                  <div className="grid grid-cols-[100px_1fr] md:grid-cols-[150px_1fr] gap-4">
                                    <div className="aspect-video bg-netflix-mediumGray">
                                      <img 
                                        src={episode.info.movie_image || series.cover || '/placeholder.svg'} 
                                        alt={`Bölüm ${episode.episode_num}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="py-2 pr-4 flex flex-col justify-between">
                                      <div>
                                        <h3 className="font-medium text-white">
                                          {episode.episode_num}. {episode.title || `Bölüm ${episode.episode_num}`}
                                        </h3>
                                        {episode.info.plot && (
                                          <p className="text-sm text-gray-300 line-clamp-2 mt-1">
                                            {episode.info.plot}
                                          </p>
                                        )}
                                        {episode.info.duration_secs && (
                                          <p className="text-xs text-gray-400 mt-1">
                                            {formatTime(episode.info.duration_secs)}
                                          </p>
                                        )}
                                      </div>
                                      <div className="mt-2">
                                        <Button 
                                          size="sm"
                                          className="bg-netflix-red hover:bg-red-700"
                                          onClick={() => handlePlayEpisode(seasonNum, episode.id)}
                                        >
                                          <Play size={14} className="mr-1" />
                                          Oynat
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SeriesDetails;
