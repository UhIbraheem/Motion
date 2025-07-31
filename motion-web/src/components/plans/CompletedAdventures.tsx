import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Share2 } from "lucide-react";
import { format } from "date-fns";

export default function CompletedAdventures({ adventures, loading, onShare }) {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (adventures.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: 'var(--sage)' }} />
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--sage-dark)' }}>
          No completed adventures yet
        </h3>
        <p className="opacity-70" style={{ color: 'var(--sage)' }}>
          Complete some adventures to build your memory collection
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {adventures.map((adventure) => (
        <Card key={adventure.id} className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold leading-tight" style={{ color: 'var(--sage-dark)' }}>
              {adventure.title}
            </CardTitle>
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {adventure.location}
                </Badge>
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {adventure.duration_hours}h
                </Badge>
              </div>
              {adventure.rating && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < adventure.rating ? 'fill-current' : ''
                      }`}
                      style={{ color: 'var(--gold)' }}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm mb-3" style={{ color: 'var(--sage)' }}>
              {adventure.description}
            </p>
            {adventure.completion_notes && (
              <div className="p-3 rounded-lg bg-cream/50 mb-4">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--sage-dark)' }}>
                  Your Experience:
                </p>
                <p className="text-xs" style={{ color: 'var(--sage)' }}>
                  {adventure.completion_notes}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-70" style={{ color: 'var(--sage)' }}>
                Completed {format(new Date(adventure.updated_date), "MMM d, yyyy")}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShare(adventure.id)}
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}