// eslint-disable-next-line @typescript-eslint/no-require-imports
const sql = require('better-sqlite3');

const db = sql('meals.db');

export async function getMeals() {
  const stmt = db.prepare(`
    SELECT * FROM meals
  `);

  const meals = await stmt.all();
  return meals;
}

export async function getMeal(slug: string) {
  const stmt = db.prepare(`
    SELECT * FROM meals WHERE slug = ?
  `);

  const meal = await stmt.get(slug);
  return meal;
}
