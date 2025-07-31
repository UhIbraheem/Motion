import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, MapPin } from "lucide-react";

export default function AccountSettings({ user, onUpdate, saving }) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    location: user.location || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: 'var(--sage-dark)' }}>
          <User className="w-5 h-5" />
          Account Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2" style={{ color: 'var(--sage-dark)' }}>
              <User className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Enter your full name"
              className="rounded-xl border-sage/20"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2" style={{ color: 'var(--sage-dark)' }}>
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              value={user.email}
              disabled
              className="rounded-xl bg-gray-50 opacity-70"
            />
            <p className="text-xs opacity-70" style={{ color: 'var(--sage)' }}>
              Email cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2" style={{ color: 'var(--sage-dark)' }}>
              <MapPin className="w-4 h-4" />
              Primary Location
            </Label>
            <Input
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Enter your city or area"
              className="rounded-xl border-sage/20"
            />
            <p className="text-xs opacity-70" style={{ color: 'var(--sage)' }}>
              Used as default for adventure recommendations
            </p>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl"
            style={{ backgroundColor: 'var(--sage)', color: 'white' }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}