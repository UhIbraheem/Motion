
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, MapPin, Clock, Star } from "lucide-react";

export default function LoadingAnimation() {
  return (
    <Card className="border border-gold/30 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg animate-pulse"
                 style={{ background: 'linear-gradient(135deg, var(--sage), var(--gold))' }}>
              <Sparkles className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <Star className="w-4 h-4 animate-bounce" style={{ color: 'var(--gold)' }} />
            </div>
            <div className="absolute top-4 right-1/2 transform translate-x-8">
              <MapPin className="w-4 h-4 animate-bounce" style={{ color: 'var(--teal)', animationDelay: '0.2s' }} />
            </div>
            <div className="absolute top-4 left-1/2 transform -translate-x-8">
              <Clock className="w-4 h-4 animate-bounce" style={{ color: 'var(--sage)', animationDelay: '0.4s' }} />
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--sage-dark)' }}>
            Crafting Your Perfect Adventure
          </h3>
          
          <div className="space-y-2 mb-6">
            <p className="text-sm animate-fade-in" style={{ color: 'var(--sage)', animationDelay: '0s' }}>
              🗺️ Analyzing your location and preferences
            </p>
            <p className="text-sm animate-fade-in" style={{ color: 'var(--sage)', animationDelay: '1s' }}>
              💎 Finding hidden gems and local favorites
            </p>
            <p className="text-sm animate-fade-in" style={{ color: 'var(--sage)', animationDelay: '2s' }}>
              🎯 Creating your personalized itinerary
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: 'var(--sage)',
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
