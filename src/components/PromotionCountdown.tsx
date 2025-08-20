import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const PromotionCountdown: React.FC = () => {
  // Generate random time between 0-2 hours (in seconds)
  const getRandomTime = () => {
    const maxSeconds = 2 * 60 * 60; // 2 hours in seconds
    const randomSeconds = Math.floor(Math.random() * maxSeconds);
    const hours = Math.floor(randomSeconds / 3600);
    const minutes = Math.floor((randomSeconds % 3600) / 60);
    const seconds = randomSeconds % 60;
    return { hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(() => getRandomTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Generate new random time when it reaches 0
              const newTime = getRandomTime();
              return newTime;
            }
          }
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center space-x-4 text-sm font-medium">
          <Clock className="w-4 h-4" />
          <span>🔥 Ofertas por tiempo limitado</span>
          <div className="flex items-center space-x-2">
            <span>Termina en:</span>
            <div className="flex items-center space-x-1 bg-white bg-opacity-20 rounded px-2 py-1">
              <span className="font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span>:</span>
              <span className="font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span>:</span>
              <span className="font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
          <span className="hidden md:inline">✨ ¡No te las pierdas!</span>
        </div>
      </div>
    </div>
  );
};

export default PromotionCountdown;