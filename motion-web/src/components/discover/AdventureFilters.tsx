
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function AdventureFilters({ filters, setFilters }) {
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 opacity-50" style={{ color: 'var(--sage)' }} />
        <Select value={filters.budget} onValueChange={(value) => updateFilter('budget', value)}>
          <SelectTrigger className="w-32 h-12 rounded-xl border-gold/30 bg-white/80 backdrop-blur-sm shadow-sm">
            <SelectValue placeholder="Budget" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Budgets</SelectItem>
            <SelectItem value="$">$ Budget</SelectItem>
            <SelectItem value="$$">$$ Budget</SelectItem>
            <SelectItem value="$$$">$$$ Budget</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Select value={filters.duration} onValueChange={(value) => updateFilter('duration', value)}>
        <SelectTrigger className="w-32 h-12 rounded-xl border-gold/30 bg-white/80 backdrop-blur-sm shadow-sm">
          <SelectValue placeholder="Duration" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any Duration</SelectItem>
          <SelectItem value="short">2 hours or less</SelectItem>
          <SelectItem value="medium">2-6 hours</SelectItem>
          <SelectItem value="long">6+ hours</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.experienceType} onValueChange={(value) => updateFilter('experienceType', value)}>
        <SelectTrigger className="w-40 h-12 rounded-xl border-gold/30 bg-white/80 backdrop-blur-sm shadow-sm">
          <SelectValue placeholder="Experience" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="hidden gem">Hidden Gem</SelectItem>
          <SelectItem value="explorer">Explorer</SelectItem>
          <SelectItem value="nature">Nature</SelectItem>
          <SelectItem value="foodie">Foodie</SelectItem>
          <SelectItem value="culture">Culture</SelectItem>
          <SelectItem value="adventure">Adventure</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
