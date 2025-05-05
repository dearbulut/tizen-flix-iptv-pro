
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { XtreamApi, Movie } from '@/services/xtreamApi';
import { Button } from '@/components/ui/button';
import { Play, Clock, Star, Calendar, Film } from 'lucide-react';

const xtreamApi = new XtreamApi();

// Extended Movie type to accommodate optional properties
interface ExtendedMovie extends Movie {
  year?: string;
  duration?: string;
  genre?: string;
  plot?: string;
  cast?: string;
  director?: string;
}

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<ExtendedMovie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadMovieDetails = async () => {
      setIsLoading(true);
      try {
        if (!id) {
          throw new Error('Film ID bulunamadı');
        }
        
        // Get all movies and find the one with matching id
        const allMovies = await xtreamApi.getVodStreams();
        const foundMovie = allMovies.find(m => m.stream_id === parseInt(id));
        
        if (foundMovie) {
          setMovie(foundMovie as ExtendedMovie);
        } else {
          throw new Error('Film bulunamadı');
        }
      } catch (error) {
        console.error('Error loading movie details:', error);
        setError(error instanceof Error ? error.message : 'Film detayları yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMovieDetails();
  }, [id]);

  const handlePlayMovie = () => {
    if (movie) {
      navigate(`/player/movie/${movie.stream_id}`);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red mx-auto"></div>
            <p className="mt-4 text-xl text-white">Film detayları yükleniyor...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !movie) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-netflix-darkGray p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-netflix-red mb-4">Hata</h2>
            <p className="text-lg text-white mb-6">{error || 'Film bulunamadı'}</p>
            <Button 
              onClick={() => navigate('/movies')}
              className="bg-netflix-red hover:bg-red-700"
            >
              Filmlere Dön
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

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
              backgroundImage: `url(${movie.stream_icon || '/placeholder.svg'})`
            }}
          ></div>
        </div>
        
        {/* Content */}
        <div className="relative z-20 min-h-screen">
          <div className="container mx-auto px-4 pt-[30vh] md:pt-[45vh]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Movie poster */}
              <div className="hidden md:block">
                <div className="w-full max-w-xs mx-auto">
                  <img 
                    src={movie.stream_icon || '/placeholder.svg'} 
                    alt={movie.name}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              </div>
              
              {/* Movie details */}
              <div className="md:col-span-2 space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white">{movie.name}</h1>
                
                <div className="flex flex-wrap gap-4">
                  {movie.year && (
                    <div className="flex items-center text-gray-300">
                      <Calendar size={16} className="mr-1" />
                      <span>{movie.year}</span>
                    </div>
                  )}
                  {movie.rating && (
                    <div className="flex items-center text-gray-300">
                      <Star size={16} className="mr-1 text-yellow-500" />
                      <span>{movie.rating}</span>
                    </div>
                  )}
                  {movie.duration && (
                    <div className="flex items-center text-gray-300">
                      <Clock size={16} className="mr-1" />
                      <span>{movie.duration} dk</span>
                    </div>
                  )}
                  {movie.genre && (
                    <div className="flex items-center text-gray-300">
                      <Film size={16} className="mr-1" />
                      <span>{movie.genre}</span>
                    </div>
                  )}
                </div>
                
                {movie.plot && (
                  <div className="text-gray-300">
                    <h2 className="text-xl font-semibold text-white mb-2">Özet</h2>
                    <p>{movie.plot}</p>
                  </div>
                )}
                
                <div className="pt-4">
                  <Button 
                    onClick={handlePlayMovie}
                    className="bg-netflix-red hover:bg-red-700 text-white px-6 py-6 text-lg"
                    size="lg"
                  >
                    <Play size={20} className="mr-2" />
                    Oynat
                  </Button>
                </div>
                
                {movie.cast && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">Oyuncular</h2>
                    <p className="text-gray-300">{movie.cast}</p>
                  </div>
                )}
                
                {movie.director && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">Yönetmen</h2>
                    <p className="text-gray-300">{movie.director}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MovieDetails;
