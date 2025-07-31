
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, MapPin } from "lucide-react";

export default function TrendingSection({ adventures }) {
  // Simple trending logic - most recent adventures
  const trendingAdventures = adventures
    .filter(a => a.is_shared)
    .slice(0, 3);

  if (trendingAdventures.length === 0) return null;

  return (
    <Card className="w-full lg:w-80 border border-gold/30 bg-white/80 backdrop-blur-sm shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--gold)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--sage-dark)' }}>
            Trending Now
          </span>
        </div>
        <div className="space-y-2">
          {trendingAdventures.map((adventure, index) => (
            <div key={adventure.id} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium"
                   style={{ backgroundColor: 'var(--sage-light)', color: 'white' }}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--sage-dark)' }}>
                  {adventure.title}
                </p>
                <p className="text-xs opacity-70 flex items-center gap-1" style={{ color: 'var(--sage)' }}>
                  <MapPin className="w-3 h-3" />
                  {adventure.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
