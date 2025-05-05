
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-netflix-black p-4">
      <div className="text-center max-w-lg">
        <h1 className="text-5xl font-bold text-netflix-red mb-6">404</h1>
        <h2 className="text-3xl font-semibold text-white mb-4">Sayfa Bulunamadı</h2>
        <p className="text-lg text-gray-300 mb-8">Aradığınız sayfa bulunamadı veya taşınmış olabilir.</p>
        <Button 
          onClick={() => navigate('/')}
          className="bg-netflix-red hover:bg-red-700 text-white px-6"
          size="lg"
        >
          Ana Sayfaya Dön
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
