import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export default function SubscriptionBadge() {
  const { user, canGenerate, canEdit } = useAuth();

  if (!user) return null;

  const getTierInfo = () => {
    switch (user.subscriptionTier) {
      case 'free':
        return {
          label: 'Free',
          color: 'bg-gray-500 text-white',
          limits: `${user.generationsUsed}/${user.generationsLimit} generations • ${user.editsUsed}/${user.editsLimit} edits`
        };
      case 'explorer':
        return {
          label: 'Explorer',
          color: 'bg-[#3c7660] text-white',
          limits: 'Unlimited generations • Unlimited edits'
        };
      case 'pro':
        return {
          label: 'Pro',
          color: 'bg-[#f2cc6c] text-black',
          limits: 'Unlimited generations • Premium features'
        };
      default:
        return {
          label: 'Free',
          color: 'bg-gray-500 text-white',
          limits: 'Unknown limits'
        };
    }
  };

  const tierInfo = getTierInfo();

  return (
    <div className="flex flex-col items-center space-y-2 p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex items-center space-x-2">
        <Badge className={tierInfo.color}>
          {tierInfo.label}
        </Badge>
        {user.subscriptionTier === 'free' && !canGenerate() && (
          <Badge variant="destructive">
            Limit Reached
          </Badge>
        )}
      </div>
      <p className="text-xs text-gray-600 text-center">
        {tierInfo.limits}
      </p>
      {user.subscriptionTier === 'free' && (
        <p className="text-xs text-blue-600 cursor-pointer hover:underline">
          Upgrade for unlimited access
        </p>
      )}
    </div>
  );
}
