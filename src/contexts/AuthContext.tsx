
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { XtreamApi, UserInfo } from '@/services/xtreamApi';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: UserInfo | null;
  login: (server: string, username: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const xtreamApi = new XtreamApi();

  useEffect(() => {
    const checkSavedCredentials = async () => {
      const savedServer = localStorage.getItem('xtream_server');
      const savedUsername = localStorage.getItem('xtream_username');
      const savedPassword = localStorage.getItem('xtream_password');
      
      if (savedServer && savedUsername && savedPassword) {
        try {
          setIsLoading(true);
          const response = await xtreamApi.authenticate(savedServer, savedUsername, savedPassword);
          if (response.user_info) {
            setUserInfo(response.user_info);
            setIsAuthenticated(true);
            xtreamApi.saveCredentials(savedServer, savedUsername, savedPassword);
            navigate('/');
          }
        } catch (error) {
          console.error('Auto-login failed:', error);
          // Don't remove credentials for timeout errors - server might be temporarily unavailable
          if (!(error instanceof Error && (error.message.includes('zaman aşımı') || error.message.includes('timeout')))) {
            localStorage.removeItem('xtream_server');
            localStorage.removeItem('xtream_username');
            localStorage.removeItem('xtream_password');
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    checkSavedCredentials();
  }, [navigate]);

  const login = async (server: string, username: string, password: string, rememberMe: boolean) => {
    try {
      setIsLoading(true);
      // Use retry mechanism in authenticate method
      const response = await xtreamApi.authenticate(server, username, password, 2); // Try up to 3 times (initial + 2 retries)
      
      if (response.user_info) {
        setUserInfo(response.user_info);
        setIsAuthenticated(true);
        
        if (rememberMe) {
          localStorage.setItem('xtream_server', server);
          localStorage.setItem('xtream_username', username);
          localStorage.setItem('xtream_password', password);
        }
        
        xtreamApi.saveCredentials(server, username, password);
        toast({
          title: "Giriş başarılı!",
          description: "IPTV servisine hoş geldiniz.",
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      let errorMessage = "Lütfen giriş bilgilerinizi kontrol edin.";
      
      // Provide more specific error messages based on error type
      if (error.message.includes('zaman aşımı') || error.message.includes('timeout') || error.code === 'ECONNABORTED') {
        errorMessage = "Bağlantı zaman aşımına uğradı. Sunucu yanıt vermiyor olabilir veya geçici bir ağ sorunu olabilir.";
      } else if (error.message === 'Network Error') {
        errorMessage = "Sunucuya bağlanılamadı. Lütfen sunucu adresini ve internet bağlantınızı kontrol edin.";
      } else if (error.response?.status === 401) {
        errorMessage = "Kullanıcı adı veya şifre hatalı.";
      } else if (error.code === 'ERR_CONNECTION_TIMED_OUT') {
        errorMessage = "Sunucu bağlantısı zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.";
      }
      
      toast({
        title: "Giriş başarısız",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('xtream_server');
    localStorage.removeItem('xtream_username');
    localStorage.removeItem('xtream_password');
    setIsAuthenticated(false);
    setUserInfo(null);
    navigate('/login');
    toast({
      title: "Çıkış yapıldı",
      description: "Başarıyla çıkış yaptınız.",
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
