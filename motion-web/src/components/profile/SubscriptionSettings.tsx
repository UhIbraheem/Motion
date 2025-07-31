import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Sparkles } from "lucide-react";

export default function SubscriptionSettings({ user, onUpdate }) {
  const isPremium = user.subscription_tier === 'premium';

  const handleUpgrade = () => {
    // In a real app, this would integrate with Stripe
    alert("Stripe integration would handle premium upgrade here!");
  };

  const handleCancel = () => {
    // In a real app, this would cancel the subscription
    alert("Subscription cancellation would be handled here!");
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-0 shadow-lg bg-white/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--sage-dark)' }}>
            <Crown className="w-5 h-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="text-sm px-3 py-1"
                       style={{ 
                         backgroundColor: isPremium ? 'var(--gold)' : 'var(--sage)', 
                         color: 'white' 
                       }}>
                  {isPremium ? 'Motion+ Premium' : 'Free Plan'}
                </Badge>
                {isPremium && (
                  <span className="text-sm opacity-70" style={{ color: 'var(--sage)' }}>
                    $9.99/month
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: 'var(--sage)' }}>
                {isPremium 
                  ? 'Unlimited adventures and premium features'
                  : `${user.adventures_used_this_month || 0}/3 adventures used this month`
                }
              </p>
            </div>
          </div>

          {!isPremium && (
            <Button
              onClick={handleUpgrade}
              className="w-full rounded-xl"
              style={{ backgroundColor: 'var(--gold)', color: 'white' }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Motion+ Premium
            </Button>
          )}

          {isPremium && (
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="w-full rounded-xl border-red-300 text-red-600 hover:bg-red-50"
              >
                Cancel Subscription
              </Button>
              <p className="text-xs text-center opacity-70" style={{ color: 'var(--sage)' }}>
                Your subscription will remain active until the end of the current billing period
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/80">
          <CardHeader>
            <CardTitle className="text-center" style={{ color: 'var(--sage-dark)' }}>
              Free Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <span className="text-2xl font-bold" style={{ color: 'var(--sage-dark)' }}>$0</span>
              <span className="text-sm opacity-70" style={{ color: 'var(--sage)' }}>/month</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4" style={{ color: 'var(--teal)' }} />
                3 adventures per month
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4" style={{ color: 'var(--teal)' }} />
                Basic adventure customization
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4" style={{ color: 'var(--teal)' }} />
                Save and schedule adventures
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-xl bg-white/90 relative overflow-hidden"
              style={{ borderColor: 'var(--gold)' }}>
          <div className="absolute top-0 right-0 bg-gradient-to-l from-gold to-transparent px-4 py-1">
            <span className="text-xs font-semibold text-white">POPULAR</span>
          </div>
          <CardHeader>
            <CardTitle className="text-center" style={{ color: 'var(--sage-dark)' }}>
              Motion+ Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <span className="text-2xl font-bold" style={{ color: 'var(--sage-dark)' }}>$9.99</span>
              <span className="text-sm opacity-70" style={{ color: 'var(--sage)' }}>/month</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                Unlimited adventures
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                Advanced customization
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                Group planning tools
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                Priority customer support
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                Early access to new features
              </li>
            </ul>
            {!isPremium && (
              <Button
                onClick={handleUpgrade}
                className="w-full mt-4 rounded-xl"
                style={{ backgroundColor: 'var(--gold)', color: 'white' }}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}