
import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { Lock } from 'lucide-react';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [autoLogin, setAutoLogin] = useState(localStorage.getItem('xtream_username') !== null);
  const [parentalControl, setParentalControl] = useState(localStorage.getItem('parental_control') === 'enabled');
  const [parentalPin, setParentalPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('app_language') || 'tr');
  
  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };
  
  const handleAutoLoginChange = (checked: boolean) => {
    setAutoLogin(checked);
    if (!checked) {
      localStorage.removeItem('xtream_server');
      localStorage.removeItem('xtream_username');
      localStorage.removeItem('xtream_password');
      
      toast({
        title: "Otomatik giriş kapatıldı",
        description: "Bir sonraki girişinizde bilgilerinizi yeniden girmeniz gerekecek.",
      });
    } else {
      toast({
        title: "Otomatik giriş açık",
        description: "Mevcut oturum bilgileri kaydedildi.",
      });
    }
  };
  
  const handleParentalControlChange = (checked: boolean) => {
    if (checked) {
      setShowPinInput(true);
    } else {
      setParentalControl(false);
      localStorage.removeItem('parental_control');
      localStorage.removeItem('parental_pin');
      
      toast({
        title: "Ebeveyn kontrolü kapatıldı",
        description: "Artık tüm içeriklere erişilebilir.",
      });
    }
  };
  
  const handlePinSubmit = () => {
    if (parentalPin.length === 4) {
      setParentalControl(true);
      localStorage.setItem('parental_control', 'enabled');
      localStorage.setItem('parental_pin', parentalPin);
      setShowPinInput(false);
      
      toast({
        title: "Ebeveyn kontrolü etkinleştirildi",
        description: "Kısıtlı içeriklere erişmek için PIN kodu gerekecek.",
      });
    } else {
      toast({
        title: "Geçersiz PIN",
        description: "Lütfen 4 haneli bir PIN giriniz.",
        variant: "destructive",
      });
    }
  };
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem('app_language', value);
    
    toast({
      title: "Dil değiştirildi",
      description: value === 'tr' ? "Uygulama dili Türkçe olarak ayarlandı." : "Application language set to English.",
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Ayarlar</h1>
        
        <div className="space-y-6">
          {/* Theme Setting */}
          <Card className="bg-netflix-darkGray border-netflix-mediumGray">
            <CardHeader>
              <CardTitle>Görünüm</CardTitle>
              <CardDescription>Uygulama temasını özelleştirin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-mode">Karanlık Mod</Label>
                <Switch
                  id="theme-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={handleThemeChange}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Auto Login Setting */}
          <Card className="bg-netflix-darkGray border-netflix-mediumGray">
            <CardHeader>
              <CardTitle>Oturum</CardTitle>
              <CardDescription>Giriş tercihleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-login">Otomatik Giriş</Label>
                <Switch
                  id="auto-login"
                  checked={autoLogin}
                  onCheckedChange={handleAutoLoginChange}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Parental Control Setting */}
          <Card className="bg-netflix-darkGray border-netflix-mediumGray">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={20} /> Ebeveyn Kontrolü
              </CardTitle>
              <CardDescription>Yetişkin içerikler için kısıtlamalar</CardDescription>
            </CardHeader>
            <CardContent>
              {showPinInput ? (
                <div className="space-y-4">
                  <Label htmlFor="parental-pin">4 Haneli PIN Kodu Belirleyin</Label>
                  <Input
                    id="parental-pin"
                    type="password" 
                    maxLength={4}
                    placeholder="PIN kodu girin"
                    value={parentalPin}
                    onChange={(e) => setParentalPin(e.target.value)}
                    className="bg-netflix-mediumGray border-gray-700 text-white"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPinInput(false)}
                      className="border-gray-600"
                    >
                      İptal
                    </Button>
                    <Button 
                      onClick={handlePinSubmit}
                      className="bg-netflix-red hover:bg-red-700"
                    >
                      Kaydet
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <Label htmlFor="parental-control">Ebeveyn Kontrolü</Label>
                  <Switch
                    id="parental-control"
                    checked={parentalControl}
                    onCheckedChange={handleParentalControlChange}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Language Setting */}
          <Card className="bg-netflix-darkGray border-netflix-mediumGray">
            <CardHeader>
              <CardTitle>Dil (Language)</CardTitle>
              <CardDescription>Uygulama dilini değiştir</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={language} 
                onValueChange={handleLanguageChange} 
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tr" id="lang-tr" />
                  <Label htmlFor="lang-tr">Türkçe</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="lang-en" />
                  <Label htmlFor="lang-en">English</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          
          {/* App Info */}
          <Card className="bg-netflix-darkGray border-netflix-mediumGray">
            <CardHeader>
              <CardTitle>Uygulama Hakkında</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-gray-400">
                <p>TizenFlix IPTV</p>
                <p>Versiyon: 1.0.0</p>
                <p>© 2025 Tüm hakları saklıdır.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
