import Image from 'next/image';
import { getMeal } from '../../../../lib/meals';
import { notFound } from 'next/navigation';

export default async function MealPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const meal = await getMeal(slug);
  const parsedIntructions: string[] = meal.instructions.split('\n').map((instruction: string) => instruction.trim());

  if (!meal) {
    notFound();
  }

  return (
    <main className="space-y-4 px-6 text-white">
      <h1>{meal.title}</h1>
      <section className="space-y-4">
        <Image src={meal.image} alt={meal.title} width={200} height={200} className="rounded-full" />
        <p>{meal.summary}</p>
        <ol className="space-y-2">
          {parsedIntructions.map((instruction, index) => (
            <li key={`${meal.slug}-${index}`}>{instruction}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
