import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center bg-white">
      <div className="text-6xl font-black text-brand-navy/10">404</div>
      <div>
        <h1 className="text-xl font-bold text-brand-navy mb-2">Page not found</h1>
        <p className="text-sm text-gray-500">This page doesn&apos;t exist or may have moved.</p>
      </div>
      <Link
        href="/"
        className="bg-brand-navy text-white font-medium px-7 py-3 rounded-full hover:bg-brand-navy/90 transition-colors"
      >
        Back to AutoSage →
      </Link>
    </div>
  );
}
