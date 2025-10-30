"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  expiresAt: string;
  onExpired?: () => void;
}

export function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft("Expired");
        if (onExpired) {
          onExpired();
        }
        return;
      }

      // Calculate days, hours, minutes
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days} hari ${hours} jam`);
      } else if (hours > 0) {
        setTimeLeft(`${hours} jam ${minutes} menit`);
      } else {
        setTimeLeft(`${minutes} menit`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  return (
    <div className={`flex items-center gap-1 text-sm ${isExpired ? "text-destructive" : "text-muted-foreground"}`}>
      <Clock className="h-3 w-3" />
      <span>{timeLeft}</span>
    </div>
  );
}
