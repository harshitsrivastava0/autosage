import { notFound } from "next/navigation";
import { getCarById } from "@/lib/cars/dataset";
import { Header } from "@/components/layout/Header";
import { CarDetailTabs } from "@/components/car/CarDetailTabs";

interface CarPageProps {
  params: Promise<{ id: string }>;
}

export default async function CarDetailPage({ params }: CarPageProps) {
  const { id } = await params;
  const car = getCarById(id);

  if (!car) notFound();

  return (
    <div className="flex flex-col min-h-full">
      <Header />
      <main className="flex-1">
        <CarDetailTabs car={car} />
      </main>
    </div>
  );
}

export async function generateStaticParams() {
  const { CARS } = await import("@/lib/cars/dataset");
  return CARS.map((c) => ({ id: c.id }));
}
