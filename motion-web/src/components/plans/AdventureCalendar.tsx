import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";

export default function AdventureCalendar({ adventures }) {
  const getAdventuresForDate = (date) => {
    return adventures.filter(adventure => 
      adventure.scheduled_date && 
      isSameDay(new Date(adventure.scheduled_date), date)
    );
  };

  const hasAdventures = (date) => {
    return getAdventuresForDate(date).length > 0;
  };

  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const dayAdventures = getAdventuresForDate(selectedDate);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-lg bg-white/80">
        <CardHeader>
          <CardTitle style={{ color: 'var(--sage-dark)' }}>
            Adventure Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
            modifiers={{
              hasAdventure: (date) => hasAdventures(date)
            }}
            modifiersStyles={{
              hasAdventure: {
                backgroundColor: 'var(--sage)',
                color: 'white',
                borderRadius: '50%'
              }
            }}
          />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/80">
        <CardHeader>
          <CardTitle style={{ color: 'var(--sage-dark)' }}>
            {format(selectedDate, "MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dayAdventures.length === 0 ? (
            <div className="text-center py-8">
              <p className="opacity-70" style={{ color: 'var(--sage)' }}>
                No adventures scheduled for this date
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dayAdventures.map((adventure) => (
                <div key={adventure.id} className="p-4 rounded-lg bg-cream/50 border border-sage/10">
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--sage-dark)' }}>
                    {adventure.title}
                  </h4>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {adventure.duration_hours}h
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {adventure.budget_level}
                    </Badge>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--sage)' }}>
                    {adventure.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}