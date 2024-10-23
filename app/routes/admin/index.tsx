import { json, useLoaderData } from "@remix-run/react";
import { Container } from "~/components/container";
import { prisma } from "~/utils/db.server";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Prisma } from "@prisma/client";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 10);
  // Calculate the pagination offset
  const offset = (page - 1) * pageSize;

  // Sorting parameters
  const sortBy = url.searchParams.get("sortBy") || "createdAt"; // Default to "createdAt"
  const order = url.searchParams.get("order") === "desc" ? "desc" : "asc"; // Default to "asc"

  // Validate the sorting field, allowing only headword and createdAt
  const allowedSortFields = ["headword", "createdAt"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  const filter = url.searchParams.get("filter") || "";

  const whereClause: Prisma.WordWhereInput = filter
    ? {
        OR: [
          {
            headword: {
              contains: filter,
              mode: "insensitive",
            },
          },
          {
            translations: {
              some: {
                translation: {
                  contains: filter,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      }
    : {};

  const [words, totalWords] = await Promise.all([
    prisma.word.findMany({
      where: whereClause,
      select: {
        headword: true,
        ergative: true,
        speechPart: true,
        origin: true,
        root: true,
        tags: true,
        createdAt: true,
        examples: true,
        translations: {
          select: { translation: true },
        },
      },
      skip: offset,
      take: pageSize,
      orderBy: { [sortField]: order },
    }),
    prisma.word.count({
      where: whereClause,
    }),
  ]);

  return json({ words, totalWords, page, pageSize, sortBy, order, filter });
}

export default function AdminPage() {
  const { words, totalWords, page, pageSize, sortBy, order, filter } =
    useLoaderData<typeof loader>();

  return (
    <Container>
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={words}
          totalWords={totalWords}
          page={page}
          pageSize={pageSize}
          sorting={{ sortBy, order }}
          globalFilter={filter}
        />
      </div>
    </Container>
  );
}
