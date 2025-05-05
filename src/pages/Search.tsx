
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { XtreamApi, Movie, Stream, Series } from '@/services/xtreamApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon } from 'lucide-react';

// Extended types to accommodate optional properties
interface ExtendedMovie extends Movie {
  year?: string;
}

interface ExtendedSeries extends Series {
  year?: string;
}

const xtreamApi = new XtreamApi();

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [movies, setMovies] = useState<ExtendedMovie[]>([]);
  const [series, setSeries] = useState<ExtendedSeries[]>([]);
  const [channels, setChannels] = useState<Stream[]>([]);
  const [results, setResults] = useState<{
    movies: ExtendedMovie[];
    series: ExtendedSeries[];
    channels: Stream[];
  }>({
    movies: [],
    series: [],
    channels: [],
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [moviesData, seriesData, channelsData] = await Promise.all([
          xtreamApi.getVodStreams(),
          xtreamApi.getSeriesList(),
          xtreamApi.getLiveStreams()
        ]);
        
        setMovies(moviesData as ExtendedMovie[]);
        setSeries(seriesData as ExtendedSeries[]);
        setChannels(channelsData);
        
        // If we have a search term from URL, perform search
        const initialQuery = searchParams.get('q');
        if (initialQuery) {
          performSearch(initialQuery);
        }
      } catch (error) {
        console.error('Error loading search data:', error);
      }
    };
    
    loadInitialData();
  }, []);

  const performSearch = (term: string) => {
    setIsLoading(true);
    
    const query = term.toLowerCase().trim();
    
    const filteredMovies = movies.filter(movie => 
      movie.name.toLowerCase().includes(query)
    );
    
    const filteredSeries = series.filter(series => 
      series.name.toLowerCase().includes(query)
    );
    
    const filteredChannels = channels.filter(channel => 
      channel.name.toLowerCase().includes(query)
    );
    
    setResults({
      movies: filteredMovies,
      series: filteredSeries,
      channels: filteredChannels
    });
    
    setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm });
      performSearch(searchTerm);
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

  const getTotalResultsCount = () => {
    return results.movies.length + results.series.length + results.channels.length;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Arama</h1>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            placeholder="Film, dizi veya kanal ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-netflix-mediumGray border-gray-700 text-white"
          />
          <Button 
            type="submit" 
            className="bg-netflix-red hover:bg-red-700 px-4"
          >
            <SearchIcon size={18} />
          </Button>
        </form>

        {searchParams.get('q') && (
          <div className="mb-6">
            <p className="text-gray-300">
              <span className="font-medium">"{searchParams.get('q')}"</span> için arama sonuçları: 
              {isLoading ? (
                <span className="ml-2">Aranıyor...</span>
              ) : (
                <span className="ml-2">{getTotalResultsCount()} sonuç bulundu</span>
              )}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-netflix-red"></div>
          </div>
        ) : searchParams.get('q') ? (
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-netflix-darkGray">
              <TabsTrigger value="all" className="data-[state=active]:bg-netflix-red">
                Tümü ({getTotalResultsCount()})
              </TabsTrigger>
              <TabsTrigger value="movies" className="data-[state=active]:bg-netflix-red">
                Filmler ({results.movies.length})
              </TabsTrigger>
              <TabsTrigger value="series" className="data-[state=active]:bg-netflix-red">
                Diziler ({results.series.length})
              </TabsTrigger>
              <TabsTrigger value="channels" className="data-[state=active]:bg-netflix-red">
                Kanallar ({results.channels.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {getTotalResultsCount() === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">Sonuç bulunamadı.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Channels Section */}
                  {results.channels.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Kanallar</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {results.channels.slice(0, 5).map((channel) => (
                          <div 
                            key={channel.stream_id}
                            className="bg-netflix-darkGray rounded-lg p-3 cursor-pointer hover:bg-netflix-mediumGray transition-colors"
                            onClick={() => handleChannelClick(channel.stream_id)}
                          >
                            <div className="aspect-video flex items-center justify-center bg-black rounded mb-2">
                              <img 
                                src={channel.stream_icon || '/placeholder.svg'} 
                                alt={channel.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <h3 className="text-sm font-medium truncate">{channel.name}</h3>
                          </div>
                        ))}
                      </div>
                      {results.channels.length > 5 && (
                        <div className="text-right mt-2">
                          <Button 
                            variant="link" 
                            onClick={() => setActiveTab('channels')}
                            className="text-netflix-red hover:text-white"
                          >
                            Tümünü gör
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Movies Section */}
                  {results.movies.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Filmler</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {results.movies.slice(0, 5).map((movie) => (
                          <div 
                            key={movie.stream_id}
                            className="bg-netflix-darkGray rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                            onClick={() => handleMovieClick(movie.stream_id)}
                          >
                            <div className="aspect-[2/3] relative">
                              <img 
                                src={movie.stream_icon || '/placeholder.svg'} 
                                alt={movie.name}
                                className="w-full h-full object-cover"
                              />
                              {movie.rating && (
                                <div className="absolute top-2 right-2 bg-netflix-red px-2 py-1 rounded text-xs font-bold">
                                  {movie.rating}
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <h3 className="text-sm font-medium truncate">{movie.name}</h3>
                              {movie.year && <p className="text-xs text-gray-400">{movie.year}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                      {results.movies.length > 5 && (
                        <div className="text-right mt-2">
                          <Button 
                            variant="link" 
                            onClick={() => setActiveTab('movies')}
                            className="text-netflix-red hover:text-white"
                          >
                            Tümünü gör
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Series Section */}
                  {results.series.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Diziler</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {results.series.slice(0, 5).map((seriesItem) => (
                          <div 
                            key={seriesItem.series_id}
                            className="bg-netflix-darkGray rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                            onClick={() => handleSeriesClick(seriesItem.series_id)}
                          >
                            <div className="aspect-[2/3] relative">
                              <img 
                                src={seriesItem.cover || '/placeholder.svg'} 
                                alt={seriesItem.name}
                                className="w-full h-full object-cover"
                              />
                              {seriesItem.rating && (
                                <div className="absolute top-2 right-2 bg-netflix-red px-2 py-1 rounded text-xs font-bold">
                                  {seriesItem.rating}
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <h3 className="text-sm font-medium truncate">{seriesItem.name}</h3>
                              {seriesItem.year && <p className="text-xs text-gray-400">{seriesItem.year}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                      {results.series.length > 5 && (
                        <div className="text-right mt-2">
                          <Button 
                            variant="link" 
                            onClick={() => setActiveTab('series')}
                            className="text-netflix-red hover:text-white"
                          >
                            Tümünü gör
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="movies" className="mt-6">
              {results.movies.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">Film bulunamadı.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.movies.map((movie) => (
                    <div 
                      key={movie.stream_id}
                      className="bg-netflix-darkGray rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                      onClick={() => handleMovieClick(movie.stream_id)}
                    >
                      <div className="aspect-[2/3] relative">
                        <img 
                          src={movie.stream_icon || '/placeholder.svg'} 
                          alt={movie.name}
                          className="w-full h-full object-cover"
                        />
                        {movie.rating && (
                          <div className="absolute top-2 right-2 bg-netflix-red px-2 py-1 rounded text-xs font-bold">
                            {movie.rating}
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <h3 className="text-sm font-medium truncate">{movie.name}</h3>
                        {movie.year && <p className="text-xs text-gray-400">{movie.year}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="series" className="mt-6">
              {results.series.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">Dizi bulunamadı.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.series.map((seriesItem) => (
                    <div 
                      key={seriesItem.series_id}
                      className="bg-netflix-darkGray rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                      onClick={() => handleSeriesClick(seriesItem.series_id)}
                    >
                      <div className="aspect-[2/3] relative">
                        <img 
                          src={seriesItem.cover || '/placeholder.svg'} 
                          alt={seriesItem.name}
                          className="w-full h-full object-cover"
                        />
                        {seriesItem.rating && (
                          <div className="absolute top-2 right-2 bg-netflix-red px-2 py-1 rounded text-xs font-bold">
                            {seriesItem.rating}
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <h3 className="text-sm font-medium truncate">{seriesItem.name}</h3>
                        {seriesItem.year && <p className="text-xs text-gray-400">{seriesItem.year}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="channels" className="mt-6">
              {results.channels.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">Kanal bulunamadı.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.channels.map((channel) => (
                    <div 
                      key={channel.stream_id}
                      className="bg-netflix-darkGray rounded-lg p-3 cursor-pointer hover:bg-netflix-mediumGray transition-colors"
                      onClick={() => handleChannelClick(channel.stream_id)}
                    >
                      <div className="aspect-video flex items-center justify-center bg-black rounded mb-2">
                        <img 
                          src={channel.stream_icon || '/placeholder.svg'} 
                          alt={channel.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <h3 className="text-sm font-medium truncate">{channel.name}</h3>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12 text-gray-400">
            İçerik aramak için yukarıdaki arama kutusunu kullanın.
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Search;
