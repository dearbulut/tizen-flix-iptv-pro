
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import { XtreamApi, Series as SeriesType } from '@/services/xtreamApi';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Extended Series type to accommodate optional properties
interface ExtendedSeries extends SeriesType {
  year?: string;
}

const xtreamApi = new XtreamApi();

const Series = () => {
  const navigate = useNavigate();
  const [seriesList, setSeriesList] = useState<ExtendedSeries[]>([]);
  const [categories, setCategories] = useState<{category_id: string; category_name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await xtreamApi.getSeriesCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading series categories:', error);
      }
    };
    
    loadCategories();
  }, []);
  
  useEffect(() => {
    const loadSeries = async () => {
      setIsLoading(true);
      try {
        const seriesData = selectedCategory === "all" 
          ? await xtreamApi.getSeriesList() 
          : await xtreamApi.getSeriesList(selectedCategory);
        setSeriesList(seriesData as ExtendedSeries[]);
      } catch (error) {
        console.error('Error loading series:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSeries();
  }, [selectedCategory]);

  const handleSeriesClick = (seriesId: number) => {
    navigate(`/series/${seriesId}`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Diziler</h1>
        
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
                {seriesList.map((series) => (
                  <div 
                    key={series.series_id}
                    className="bg-netflix-darkGray rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                    onClick={() => handleSeriesClick(series.series_id)}
                  >
                    <div className="aspect-[2/3] relative">
                      <img 
                        src={series.cover || '/placeholder.svg'} 
                        alt={series.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {series.rating && (
                        <div className="absolute top-2 right-2 bg-netflix-red px-2 py-1 rounded text-xs font-bold">
                          {series.rating}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-white truncate">{series.name}</h3>
                      {series.year && (
                        <p className="text-xs text-gray-400">{series.year}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!isLoading && seriesList.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Bu kategoride dizi bulunamadı.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Series;
