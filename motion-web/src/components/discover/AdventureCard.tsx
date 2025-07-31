
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Bookmark, Share2, Star, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function AdventureCard({ adventure, onSave, user, showTrendingBadge = false }) {
  const getBudgetSymbol = (budget) => {
    return budget === '$' ? '$' : budget === '$$' ? '$$' : '$$$';
  };

  const getBudgetColor = (budget) => {
    switch (budget) {
      case '$': return 'var(--teal)';
      case '$$': return 'var(--sage)';
      case '$$$': return 'var(--gold)';
      default: return 'var(--sage)';
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border border-gold/30 bg-white/80 backdrop-blur-sm overflow-hidden">
      {showTrendingBadge && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0">
            <TrendingUp className="w-3 h-3 mr-1" />
            Trending
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <CardTitle className="text-lg font-bold leading-tight group-hover:text-sage-dark transition-colors"
                     style={{ color: 'var(--sage-dark)' }}>
            {adventure.title}
          </CardTitle>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="text-xs px-2 py-1 bg-white/60 border border-sage/20">
            <MapPin className="w-3 h-3 mr-1" />
            {adventure.location}
          </Badge>
          <Badge variant="secondary" className="text-xs px-2 py-1 bg-white/60 border border-sage/20">
            <Clock className="w-3 h-3 mr-1" />
            {adventure.duration_hours}h
          </Badge>
          <Badge variant="secondary" 
                 className="text-xs px-2 py-1 bg-white/60 border border-sage/20"
                 style={{ color: getBudgetColor(adventure.budget_level) }}>
            <DollarSign className="w-3 h-3 mr-1" />
            {getBudgetSymbol(adventure.budget_level)}
          </Badge>
        </div>

        {adventure.experience_type && (
          <Badge className="text-xs w-fit px-3 py-1 rounded-full"
                 style={{ backgroundColor: 'var(--sage-light)', color: 'white' }}>
            {adventure.experience_type}
          </Badge>
        )}
      </CardHeader>

      <CardContent>
        <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--sage)' }}>
          {adventure.description}
        </p>

        {adventure.steps && adventure.steps.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--sage-dark)' }}>
              Highlights:
            </h4>
            <ul className="text-xs space-y-1">
              {adventure.steps.slice(0, 2).map((step, index) => (
                <li key={index} className="flex items-center gap-2" style={{ color: 'var(--sage)' }}>
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--sage-light)' }}></div>
                  {step.location}: {step.activity}
                </li>
              ))}
              {adventure.steps.length > 2 && (
                <li className="text-xs opacity-70" style={{ color: 'var(--sage)' }}>
                  +{adventure.steps.length - 2} more stops
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-sage/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                 style={{ backgroundColor: 'var(--sage-light)', color: 'white' }}>
              {adventure.created_by?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <span className="text-xs opacity-70" style={{ color: 'var(--sage)' }}>
              {format(new Date(adventure.created_date), "MMM d")}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 px-3 text-xs hover:bg-sage/10"
              style={{ color: 'var(--sage)' }}
            >
              <Share2 className="w-3 h-3" />
            </Button>
            {user && (
              <Button 
                onClick={() => onSave(adventure)}
                size="sm"
                className="h-8 px-3 text-xs shadow-sm"
                style={{ backgroundColor: 'var(--sage)', color: 'white' }}
              >
                <Bookmark className="w-3 h-3 mr-1" />
                Save
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
