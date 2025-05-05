
import React from 'react';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Profile = () => {
  const { userInfo, logout } = useAuth();
  
  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'Bilgi yok';
    
    // Check if timestamp is already in the correct format
    if (timestamp.includes('-') || timestamp.includes('/')) {
      return new Date(timestamp).toLocaleDateString('tr-TR');
    }
    
    // If it's a unix timestamp
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Profilim</h1>
        
        {userInfo ? (
          <div className="space-y-6">
            <Card className="bg-netflix-darkGray border-netflix-mediumGray">
              <CardHeader>
                <CardTitle>Hesap Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 mb-1">Kullanıcı Adı</p>
                    <p className="text-white font-medium">{userInfo.username}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Durum</p>
                    <p className="text-white font-medium">
                      {userInfo.status === 'Active' ? (
                        <span className="text-green-500">Aktif</span>
                      ) : (
                        <span className="text-red-500">Deaktif</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Üyelik Bitiş Tarihi</p>
                    <p className="text-white font-medium">{formatDate(userInfo.exp_date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Oluşturulma Tarihi</p>
                    <p className="text-white font-medium">{formatDate(userInfo.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Aktif Bağlantılar</p>
                    <p className="text-white font-medium">{userInfo.active_cons}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Maksimum Bağlantı</p>
                    <p className="text-white font-medium">{userInfo.max_connections}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-netflix-darkGray border-netflix-mediumGray">
              <CardHeader>
                <CardTitle>İzleme Geçmişi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">İzleme geçmişiniz burada görünecektir.</p>
                {/* We would show watch history here if we had that feature implemented */}
                <div className="py-8 text-center text-gray-500">
                  <p>Henüz izleme geçmişiniz bulunmuyor.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-netflix-darkGray border-netflix-mediumGray">
              <CardHeader>
                <CardTitle>Favoriler</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Favorileriniz burada görünecektir.</p>
                {/* We would show favorites here if we had that feature implemented */}
                <div className="py-8 text-center text-gray-500">
                  <p>Henüz favorileriniz bulunmuyor.</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center mt-8">
              <Button 
                onClick={logout}
                variant="destructive" 
                size="lg"
                className="bg-netflix-red hover:bg-red-700"
              >
                <LogOut size={18} className="mr-2" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Profil bilgileri yüklenemiyor.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;
