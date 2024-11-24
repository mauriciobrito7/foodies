export default async function MealPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  console.log(slug);
  return (
    <main>
      <h1>Meal</h1>
    </main>
  );
}
