// src/app/page.tsx (root page)
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-6">Motion Web App</h1>
      <p className="text-lg mb-8">AI-Powered Local Adventure Discovery</p>
      
      <div className="flex gap-4 justify-center">
        <Link href="/discover">
          <Button>Discover Adventures</Button>
        </Link>
        <Link href="/create">
          <Button variant="outline">Create Adventure</Button>
        </Link>
        <Link href="/plans">
          <Button variant="outline">My Plans</Button>
        </Link>
        <Link href="/profile">
          <Button variant="outline">Profile</Button>
        </Link>
      </div>
    </div>
  )
}