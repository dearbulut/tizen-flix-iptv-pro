
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import { XtreamApi, Movie } from '@/services/xtreamApi';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const xtreamApi = new XtreamApi();

const Movies = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<{category_id: string; category_name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await xtreamApi.getVodCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading movie categories:', error);
      }
    };
    
    loadCategories();
  }, []);
  
  useEffect(() => {
    const loadMovies = async () => {
      setIsLoading(true);
      try {
        const moviesData = selectedCategory === "all" 
          ? await xtreamApi.getVodStreams() 
          : await xtreamApi.getVodStreams(selectedCategory);
        setMovies(moviesData);
      } catch (error) {
        console.error('Error loading movies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMovies();
  }, [selectedCategory]);

  const handleMovieClick = (movieId: number) => {
    navigate(`/movie/${movieId}`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Filmler</h1>
        
        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <TabsList className="bg-netflix-darkGray">
              <TabsTrigger value="all" className="data-[state=active]:bg-netflix-red">
                Tümü
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.category_id} 
                  value={category.category_id}
                  className="data-[state=active]:bg-netflix-red"
                >
                  {category.category_name}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
          
          <TabsContent value={selectedCategory} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-netflix-red"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movies.map((movie) => (
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
                        loading="lazy"
                      />
                      {movie.rating && (
                        <div className="absolute top-2 right-2 bg-netflix-red px-2 py-1 rounded text-xs font-bold">
                          {movie.rating}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-white truncate">{movie.name}</h3>
                      {/* Make year property optional */}
                      {(movie as any).year && (
                        <p className="text-xs text-gray-400">{(movie as any).year}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!isLoading && movies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Bu kategoride film bulunamadı.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Movies;
