import { prisma } from "./db.server";

export async function fullTextSearch(query: string) {
  const sanitizedQuery = query.replace(/'/g, "''");

  const wordIds = await prisma.$queryRawUnsafe<{ id: string }[]>(`
    SELECT DISTINCT w.id
    FROM "Word" w
    WHERE w.textsearchable_index_col @@ to_tsquery('simple', '${sanitizedQuery}')
    UNION
    SELECT DISTINCT t."wordId"
    FROM "Translation" t
    WHERE t.textsearchable_index_col @@ to_tsquery('russian', '${sanitizedQuery}')`);

  const ids = wordIds.map((obj) => obj.id);


  if (!wordIds.length) return [];

  // Fetch Words and related data
  const results = await prisma.word.findMany({
    where: { id: { in: ids } },
    include: {
      translations: true,
      examples: true,
      tags: true,
    },
  });

  return results;
}