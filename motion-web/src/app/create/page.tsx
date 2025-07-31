import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Wand2 } from "lucide-react";

export default function CreatePage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#2a5444] mb-2">Create Your Adventure</h1>
          <p className="text-[#3c7660]">Let AI craft the perfect local experience for you</p>
        </div>

        {/* Creation Form */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-[#2a5444] flex items-center gap-2">
              <Wand2 className="w-6 h-6" />
              Adventure Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#2a5444] mb-2">
                What type of experience are you looking for?
              </label>
              <Input 
                placeholder="e.g., outdoor adventure, cultural exploration, food tour..."
                className="border-[#3c7660]/30 focus:border-[#f2cc6c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2a5444] mb-2">
                Location (optional)
              </label>
              <Input 
                placeholder="Enter a specific area or leave blank for nearby suggestions"
                className="border-[#3c7660]/30 focus:border-[#f2cc6c]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2a5444] mb-2">
                  Duration
                </label>
                <Input 
                  placeholder="e.g., 2 hours, half day, full day"
                  className="border-[#3c7660]/30 focus:border-[#f2cc6c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2a5444] mb-2">
                  Budget
                </label>
                <Input 
                  placeholder="e.g., free, $20-50, no limit"
                  className="border-[#3c7660]/30 focus:border-[#f2cc6c]"
                />
              </div>
            </div>

            <Button className="w-full bg-[#f2cc6c] hover:bg-[#e6b84a] text-white font-semibold py-3">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate My Adventure
            </Button>
          </CardContent>
        </Card>

        {/* Coming Soon Notice */}
        <div className="text-center mt-8 p-6">
          <div className="max-w-md mx-auto">
            <Sparkles className="w-12 h-12 text-[#f2cc6c] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#2a5444] mb-2">AI Generation Coming Soon</h3>
            <p className="text-[#3c7660] text-sm">
              We&apos;re connecting this form to our AI backend to generate personalized adventures based on your preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
