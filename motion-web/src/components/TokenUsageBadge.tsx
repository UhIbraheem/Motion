'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DollarSign,
  Zap,
  TrendingDown,
  Info,
  BarChart3,
  Clock
} from 'lucide-react';
import type { UsageMeta } from '@/services/aiService';

interface TokenUsageBadgeProps {
  meta?: UsageMeta;
  variant?: 'compact' | 'detailed';
}

export function TokenUsageBadge({ meta, variant = 'compact' }: TokenUsageBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!meta) return null;

  const { tokenUsage, cost, model, timestamp } = meta;

  // Compact badge version (shown inline)
  if (variant === 'compact') {
    return (
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/90 backdrop-blur-sm border-[#3c7660]/20 hover:bg-[#3c7660]/5 transition-all duration-300"
          >
            <Zap className="w-3.5 h-3.5 mr-2 text-[#f2cc6c]" />
            <span className="text-[#3c7660] font-semibold">${cost.totalCost.toFixed(4)}</span>
            <Info className="w-3 h-3 ml-2 text-gray-400" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#3c7660]" />
              AI Generation Cost Breakdown
            </DialogTitle>
            <DialogDescription>
              Token usage and cost details for this adventure
            </DialogDescription>
          </DialogHeader>
          <TokenUsageDetails meta={meta} />
        </DialogContent>
      </Dialog>
    );
  }

  // Detailed card version (shown in stats/settings)
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-[#3c7660]/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-[#3c7660]">
          <BarChart3 className="w-5 h-5" />
          AI Usage & Cost
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TokenUsageDetails meta={meta} />
      </CardContent>
    </Card>
  );
}

function TokenUsageDetails({ meta }: { meta: UsageMeta }) {
  const { tokenUsage, cost, model, timestamp } = meta;

  return (
    <div className="space-y-4">
      {/* Cost Summary */}
      <div className="bg-gradient-to-br from-[#3c7660]/5 to-[#f2cc6c]/5 rounded-xl p-4 border border-[#3c7660]/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 font-medium">Total Cost</span>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-[#3c7660]" />
            <span className="text-2xl font-bold text-[#3c7660]">
              ${cost.totalCost.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs mt-3">
          <div className="bg-white/60 rounded-lg p-2">
            <p className="text-gray-500 mb-1">Input Cost</p>
            <p className="font-semibold text-gray-800">${cost.inputCost.toFixed(4)}</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2">
            <p className="text-gray-500 mb-1">Output Cost</p>
            <p className="font-semibold text-gray-800">${cost.outputCost.toFixed(4)}</p>
          </div>
        </div>
      </div>

      {/* Token Usage */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#f2cc6c]" />
          Token Usage
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Input Tokens</span>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              {cost.promptTokens.toLocaleString()}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Output Tokens</span>
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
              {cost.completionTokens.toLocaleString()}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
            <span className="text-gray-700 font-medium">Total Tokens</span>
            <Badge variant="secondary" className="bg-[#3c7660]/10 text-[#3c7660] border-[#3c7660]/20 font-semibold">
              {cost.totalTokens.toLocaleString()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Caching Savings */}
      {cost.cacheSavings > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-emerald-800">
              Caching Savings Available
            </h4>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-700">Potential Savings</span>
              <span className="font-bold text-emerald-800">
                ${cost.cacheSavings.toFixed(4)} ({cost.savingsPercentage}%)
              </span>
            </div>
            <p className="text-xs text-emerald-600 mt-2">
              Enable prompt caching to reduce costs by up to 50% on repeated generations
            </p>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="pt-3 border-t border-gray-100 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Model
          </span>
          <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-mono">
            {model}
          </code>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Generated
          </span>
          <span className="text-gray-600">
            {new Date(timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TokenUsageBadge;
