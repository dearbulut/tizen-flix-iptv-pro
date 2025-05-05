
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import { XtreamApi, Stream, Category, EPGData } from '@/services/xtreamApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const xtreamApi = new XtreamApi();

const LiveTV = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [channels, setChannels] = useState<Stream[]>([]);
  const [epgData, setEpgData] = useState<Record<number, any>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadLiveTV = async () => {
      setIsLoading(true);
      try {
        // Load categories
        const categoriesData = await xtreamApi.getLiveCategories();
        setCategories(categoriesData);
        
        // Load all channels initially
        const allChannels = await xtreamApi.getLiveStreams();
        setChannels(allChannels);
        
        // Get EPG data for the first 20 channels
        const epgPromises = allChannels.slice(0, 20).map(async channel => {
          try {
            const epg = await xtreamApi.getShortEPG(channel.stream_id);
            return { id: channel.stream_id, epg };
          } catch (error) {
            console.error(`Error fetching EPG for channel ${channel.stream_id}:`, error);
            return { id: channel.stream_id, epg: null };
          }
        });
        
        const epgResults = await Promise.all(epgPromises);
        const epgMap: Record<number, any> = {};
        epgResults.forEach(result => {
          if (result.epg) {
            epgMap[result.id] = result.epg;
          }
        });
        
        setEpgData(epgMap);
      } catch (error) {
        console.error('Error loading live TV data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLiveTV();
  }, []);
  
  useEffect(() => {
    const loadChannelsByCategory = async () => {
      setIsLoading(true);
      try {
        if (selectedCategory === "all") {
          const allChannels = await xtreamApi.getLiveStreams();
          setChannels(allChannels);
        } else {
          const filteredChannels = await xtreamApi.getLiveStreams(selectedCategory);
          setChannels(filteredChannels);
        }
      } catch (error) {
        console.error('Error loading channels by category:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChannelsByCategory();
  }, [selectedCategory]);

  const handleChannelClick = (channelId: number) => {
    navigate(`/player/live/${channelId}`);
  };
  
  const getCurrentProgram = (channelId: number) => {
    if (!epgData[channelId] || !epgData[channelId].epg_listings) {
      return { title: 'Program bilgisi yok', time: '' };
    }
    
    const channelEpg = Object.values(epgData[channelId].epg_listings)[0] as any[];
    if (!channelEpg || channelEpg.length === 0) {
      return { title: 'Program bilgisi yok', time: '' };
    }
    
    const now = Date.now() / 1000; // Current time in seconds
    const currentProgram = channelEpg.find(program => {
      const start = parseInt(program.start);
      const end = parseInt(program.end);
      return start <= now && end > now;
    });
    
    if (!currentProgram) {
      return { title: 'Program bilgisi yok', time: '' };
    }
    
    const startTime = new Date(parseInt(currentProgram.start) * 1000);
    const endTime = new Date(parseInt(currentProgram.end) * 1000);
    const timeStr = `${startTime.getHours()}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    
    return {
      title: currentProgram.title,
      time: timeStr
    };
  };
  
  const getNextProgram = (channelId: number) => {
    if (!epgData[channelId] || !epgData[channelId].epg_listings) {
      return { title: 'Program bilgisi yok', time: '' };
    }
    
    const channelEpg = Object.values(epgData[channelId].epg_listings)[0] as any[];
    if (!channelEpg || channelEpg.length <= 1) {
      return { title: 'Program bilgisi yok', time: '' };
    }
    
    const now = Date.now() / 1000; // Current time in seconds
    let currentProgramIndex = -1;
    
    for (let i = 0; i < channelEpg.length; i++) {
      const program = channelEpg[i];
      const start = parseInt(program.start);
      const end = parseInt(program.end);
      if (start <= now && end > now) {
        currentProgramIndex = i;
        break;
      }
    }
    
    if (currentProgramIndex === -1 || currentProgramIndex === channelEpg.length - 1) {
      return { title: 'Program bilgisi yok', time: '' };
    }
    
    const nextProgram = channelEpg[currentProgramIndex + 1];
    const startTime = new Date(parseInt(nextProgram.start) * 1000);
    const endTime = new Date(parseInt(nextProgram.end) * 1000);
    const timeStr = `${startTime.getHours()}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    
    return {
      title: nextProgram.title,
      time: timeStr
    };
  };

  if (isLoading && channels.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red mx-auto"></div>
            <p className="mt-4 text-xl text-white">Kanallar yükleniyor...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Canlı TV</h1>
        
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {channels.map((channel) => {
                  const currentProgram = getCurrentProgram(channel.stream_id);
                  const nextProgram = getNextProgram(channel.stream_id);
                  
                  return (
                    <div 
                      key={channel.stream_id}
                      className="bg-netflix-darkGray rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                      onClick={() => handleChannelClick(channel.stream_id)}
                    >
                      <div className="h-36 flex items-center justify-center bg-netflix-mediumGray p-4 relative">
                        <img 
                          src={channel.stream_icon || '/placeholder.svg'} 
                          alt={channel.name}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">{channel.name}</h3>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-300">
                            <span className="text-netflix-red font-medium">Şu an: </span>
                            <span>{currentProgram.title}</span>
                            <span className="text-xs ml-2 text-gray-400">{currentProgram.time}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            <span className="text-gray-300 font-medium">Sonraki: </span>
                            <span>{nextProgram.title}</span>
                            <span className="text-xs ml-2 text-gray-500">{nextProgram.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {!isLoading && channels.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Bu kategoride kanal bulunamadı.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default LiveTV;
