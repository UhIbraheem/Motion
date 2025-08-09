import Link from 'next/link';

export default function PrivacySettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f2d5] via-[#f5f0c8] to-[#f1eeb8]">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-[#3c7660] mb-6">Privacy & Security</h1>
        <div className="space-y-4 bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-white/50">
          <p className="text-[#4d987b]">Manage your privacy and security options.</p>
          <ul className="list-disc pl-5 text-[#4d987b] space-y-2">
            <li>Control data sharing preferences</li>
            <li>Review our <Link href="/legal/privacy" className="text-[#3c7660] underline">Privacy Policy</Link></li>
            <li>Update password in <Link href="/auth/forgot-password" className="text-[#3c7660] underline">Reset Password</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
