import { useEffect, useState } from 'react';

export const Timer = () => {
  const [seconds, setSeconds] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`;

  return <div className="timer">{formattedTime}</div>;
};
