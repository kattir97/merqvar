import { json, useLoaderData } from "@remix-run/react";
import { Container } from "~/components/container";
import { prisma } from "~/utils/db.server";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 5);
  // Calculate the pagination offset
  const offset = (page - 1) * pageSize;

  const [words, totalWords] = await Promise.all([
    prisma.word.findMany({
      select: {
        headword: true,
        speechPart: true,
        createdAt: true,
        translations: {
          select: { translation: true },
        },
      },
      skip: offset,
      take: pageSize,
    }),
    prisma.word.count(),
  ]);

  return json({ words, totalWords, page, pageSize });
}

export default function AdminPage() {
  const { words, totalWords, page, pageSize } = useLoaderData<typeof loader>();

  return (
    <Container>
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={words}
          totalWords={totalWords}
          page={page}
          pageSize={pageSize}
        />
      </div>
    </Container>
  );
}
