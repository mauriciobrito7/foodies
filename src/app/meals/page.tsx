import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { getMeals } from '../../../lib/meals';

async function Meals() {
  const meals = await getMeals();

  return (
    <ul>
      {meals.map((meal) => (
        <li key={meal.slug}>
          <Link href={`/meals/${meal.slug}`}>
            {meal.image && (
              <Image src={meal.image} alt={meal.title} width={200} height={200} className="rounded-full" />
            )}
            <h2 className="font-bold text-white">{meal.title}</h2>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function MealsPage() {
  return (
    <main>
      <h1>Meals</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <Meals />
      </Suspense>
    </main>
  );
}
