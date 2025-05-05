
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import { XtreamApi, Stream, Movie, Series } from '@/services/xtreamApi';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

const xtreamApi = new XtreamApi();

const Dashboard = () => {
  const navigate = useNavigate();
  const [featuredContent, setFeaturedContent] = useState<any | null>(null);
  const [liveChannels, setLiveChannels] = useState<Stream[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadDashboardContent = async () => {
      setIsLoading(true);
      try {
        // Load live channels
        const channels = await xtreamApi.getLiveStreams();
        setLiveChannels(channels.slice(0, 10));
        
        // Load movies
        const moviesData = await xtreamApi.getVodStreams();
        setMovies(moviesData.slice(0, 10));
        
        // Load series
        const seriesData = await xtreamApi.getSeriesList();
        setSeries(seriesData.slice(0, 10));
        
        // Set a random featured content
        const allContent = [...channels, ...moviesData, ...seriesData];
        if (allContent.length > 0) {
          const randomIndex = Math.floor(Math.random() * allContent.length);
          setFeaturedContent(allContent[randomIndex]);
        }
        
      } catch (error) {
        console.error('Error loading dashboard content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardContent();
  }, []);

  const handlePlayFeatured = () => {
    if (!featuredContent) return;
    
    if (featuredContent.stream_type === 'live') {
      navigate(`/player/live/${featuredContent.stream_id}`);
    } else if (featuredContent.stream_type === 'movie') {
      navigate(`/player/movie/${featuredContent.stream_id}`);
    } else if (featuredContent.series_id) {
      navigate(`/series/${featuredContent.series_id}`);
    }
  };
  
  const handleChannelClick = (channelId: number) => {
    navigate(`/player/live/${channelId}`);
  };
  
  const handleMovieClick = (movieId: number) => {
    navigate(`/movie/${movieId}`);
  };
  
  const handleSeriesClick = (seriesId: number) => {
    navigate(`/series/${seriesId}`);
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red mx-auto"></div>
            <p className="mt-4 text-xl text-white">İçerik yükleniyor...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Featured Content Hero */}
      {featuredContent && (
        <section className="relative h-[50vh] md:h-[70vh]">
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-black to-transparent z-10"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${featuredContent.stream_icon || featuredContent.cover || '/placeholder.svg'})`
            }}
          ></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {featuredContent.name}
            </h1>
            <Button 
              className="bg-netflix-red hover:bg-red-700 text-white px-8 py-6 text-lg rounded"
              onClick={handlePlayFeatured}
            >
              <Play size={20} className="mr-2" />
              Oynat
            </Button>
          </div>
        </section>
      )}

      {/* Live Channels Section */}
      <section className="content-row">
        <h2 className="content-title">Canlı Kanallar</h2>
        <div className="card-container">
          {liveChannels.map((channel) => (
            <div 
              key={channel.stream_id}
              className="content-card"
              onClick={() => handleChannelClick(channel.stream_id)}
            >
              <img 
                src={channel.stream_icon || '/placeholder.svg'} 
                alt={channel.name}
                className="thumbnail"
                loading="lazy"
              />
              <div className="card-info">
                <h3 className="font-medium">{channel.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Movies Section */}
      <section className="content-row">
        <h2 className="content-title">Filmler</h2>
        <div className="card-container">
          {movies.map((movie) => (
            <div 
              key={movie.stream_id}
              className="content-card movie-card"
              onClick={() => handleMovieClick(movie.stream_id)}
            >
              <img 
                src={movie.stream_icon || '/placeholder.svg'} 
                alt={movie.name}
                className="thumbnail"
                loading="lazy"
              />
              <div className="card-info">
                <h3 className="font-medium">{movie.name}</h3>
                {movie.rating && (
                  <div className="text-xs mt-1">
                    Rating: {movie.rating}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TV Series Section */}
      <section className="content-row">
        <h2 className="content-title">Diziler</h2>
        <div className="card-container">
          {series.map((seriesItem) => (
            <div 
              key={seriesItem.series_id}
              className="content-card series-card"
              onClick={() => handleSeriesClick(seriesItem.series_id)}
            >
              <img 
                src={seriesItem.cover || '/placeholder.svg'} 
                alt={seriesItem.name}
                className="thumbnail"
                loading="lazy"
              />
              <div className="card-info">
                <h3 className="font-medium">{seriesItem.name}</h3>
                {seriesItem.rating && (
                  <div className="text-xs mt-1">
                    Rating: {seriesItem.rating}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </MainLayout>
  );
};

export default Dashboard;
