// src/app/page.tsx (root page)
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Compass, Sparkles, Calendar, User } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-[#2a5444] mb-4">
            Motion
          </h1>
          <p className="text-xl text-[#3c7660] max-w-2xl mx-auto">
            AI-Powered Local Adventure Discovery. Your mindful companion for exploring what&apos;s around you.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <Link href="/discover">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#f2cc6c] bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-[#3c7660] rounded-full flex items-center justify-center">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#2a5444]">Discover</h3>
                <p className="text-sm text-[#3c7660]">Explore community adventures</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/create">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#f2cc6c] bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-[#f2cc6c] rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#2a5444]">Create</h3>
                <p className="text-sm text-[#3c7660]">Generate your perfect adventure</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/plans">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#f2cc6c] bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-[#4d987b] rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#2a5444]">Plans</h3>
                <p className="text-sm text-[#3c7660]">Your saved adventures</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#f2cc6c] bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-[#2a5444] rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#2a5444]">Profile</h3>
                <p className="text-sm text-[#3c7660]">Account & preferences</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* CTA Button */}
        <div className="pt-8">
          <Link href="/create">
            <Button 
              size="lg" 
              className="bg-[#f2cc6c] hover:bg-[#e6b84a] text-white font-semibold px-8 py-3"
            >
              Start Your Adventure
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}