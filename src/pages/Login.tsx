
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [server, setServer] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(server, username, password, rememberMe);
    } catch (error) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-netflix-black p-4">
      <div className="w-full max-w-md">
        <Card className="bg-netflix-darkGray border-netflix-mediumGray">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-netflix-red">TizenFlix IPTV</CardTitle>
            <CardDescription className="text-gray-300">Xtream Codes ile giriş yapın</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-white rounded-md">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="server" className="text-gray-200">Sunucu URL/DNS</Label>
                <Input
                  id="server"
                  placeholder="örn: iptv.sunucu.com"
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="bg-netflix-mediumGray border-gray-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-200">Kullanıcı Adı</Label>
                <Input
                  id="username"
                  placeholder="Kullanıcı adınızı girin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-netflix-mediumGray border-gray-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-netflix-mediumGray border-gray-700 text-white"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="rememberMe" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-300">
                  Beni hatırla
                </Label>
              </div>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-netflix-red hover:bg-red-700 text-white"
                size="lg"
              >
                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-xs text-gray-400">
            TizenFlix IPTV uygulaması &copy; {new Date().getFullYear()}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
