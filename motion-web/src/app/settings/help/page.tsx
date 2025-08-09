export default function HelpSupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f2d5] via-[#f5f0c8] to-[#f1eeb8]">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-[#3c7660] mb-6">Help & Support</h1>
        <p className="text-[#4d987b] mb-6">Get answers to common questions or reach out for help.</p>
        <div className="space-y-4 bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-white/50">
          <h2 className="text-xl font-semibold text-[#3c7660]">Contact</h2>
          <p className="text-[#4d987b]">Email: support@motionflow.app</p>
        </div>
      </div>
    </div>
  );
}
