import { json, useLoaderData } from "@remix-run/react";
import { Container } from "~/components/container";
import { prisma } from "~/utils/db.server";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Prisma } from "@prisma/client";
import { toastSessionStorage } from "~/utils/toast.server";
import { toast as showToast } from "sonner";
import { useEffect, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  // cookie
  const cookie = request.headers.get("cookie");
  const toastCookieSession = await toastSessionStorage.getSession(cookie);
  const toast = toastCookieSession.get("toast");
  // toastCookieSession.unset("toast");
  console.log("toast", toast);

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 10);
  // Calculate the pagination offset
  const offset = (page - 1) * pageSize;

  // Sorting parameters
  const sortBy = url.searchParams.get("sortBy") || "createdAt"; // Default to "createdAt"
  const order = url.searchParams.get("order") === "asc" ? "asc" : "desc"; // Default to "desc"

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
        id: true,
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

  return json(
    { words, totalWords, page, pageSize, sortBy, order, filter, toast },
    {
      headers: {
        "set-cookie": await toastSessionStorage.commitSession(toastCookieSession),
      },
    }
  );
}

export default function AdminPage() {
  const { words, totalWords, page, pageSize, sortBy, order, filter, toast } =
    useLoaderData<typeof loader>();

  return (
    <Container>
      {toast ? <ShowToast toast={toast} /> : null}
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

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function ShowToast({ toast }: { toast: any }) {
  const mounted = useMounted();

  const { id, type, title, description } = toast as {
    id: string;
    type: "success" | "message";
    title: string;
    description: string;
  };
  useEffect(() => {
    if (!mounted) return;
    setTimeout(() => {
      showToast[type](title, { id, description, position: "top-center" });
    }, 0);
  }, [description, id, title, type, mounted]);
  return null;
}
