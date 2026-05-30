import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { ResultsSection } from "@/components/results/ResultsSection";
import { getSession } from "@/lib/db";

interface ShortlistPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ShortlistPage({ params }: ShortlistPageProps) {
  const { sessionId } = await params;
  const session = await getSession(sessionId);

  if (!session || !session.shortlist || session.shortlist.length === 0) {
    return (
      <div className="flex flex-col min-h-full">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center">
          <p className="text-5xl">📋</p>
          <h1 className="text-2xl font-bold text-brand-navy">Shortlist not found</h1>
          <p className="text-gray-500 text-sm max-w-sm">
            This link may have expired or the shortlist hasn&apos;t been generated yet.
          </p>
          <Link
            href="/advisor"
            className="bg-brand-red text-white font-semibold px-7 py-3 rounded-full hover:bg-brand-red/90 transition-colors"
          >
            Create my own shortlist →
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header />
      <main className="flex-1">
        <ResultsSection
          shortlist={session.shortlist}
          honourableMentions={[]}
          readonly
          ownerCity={session.city}
        />
      </main>
    </div>
  );
}
