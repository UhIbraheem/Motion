import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function ScheduledAdventures({ adventures, loading, onComplete }) {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (adventures.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: 'var(--sage)' }} />
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--sage-dark)' }}>
          No scheduled adventures
        </h3>
        <p className="opacity-70" style={{ color: 'var(--sage)' }}>
          Schedule some adventures from your saved collection
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {adventures.map((adventure) => (
        <Card key={adventure.id} className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between mb-3">
              <CardTitle className="text-lg font-bold leading-tight" style={{ color: 'var(--sage-dark)' }}>
                {adventure.title}
              </CardTitle>
              <Badge className="text-xs px-3 py-1"
                     style={{ backgroundColor: 'var(--gold)', color: 'white' }}>
                {format(new Date(adventure.scheduled_date), "MMM d")}
              </Badge>
            </div>
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
          </CardHeader>

          <CardContent>
            <p className="text-sm mb-4" style={{ color: 'var(--sage)' }}>
              {adventure.description}
            </p>
            <Button
              onClick={() => onComplete(adventure.id)}
              className="w-full"
              style={{ backgroundColor: 'var(--teal)', color: 'white' }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}