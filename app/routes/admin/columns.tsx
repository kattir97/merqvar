import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import ActionButtons from "~/components/action-buttons";
import { Badge } from "~/components/ui/badge";

const AdminWordSchema = z.object({
  id: z.string(),
  headword: z.string(),
  translations: z.array(z.object({ translation: z.string() })),
  speechPart: z.string(),
  createdAt: z.string(),
});

type AdminWord = z.infer<typeof AdminWordSchema>;

export const columns: ColumnDef<AdminWord>[] = [
  {
    accessorKey: "headword",
    enableSorting: true,
    header: "Слово",
  },
  {
    accessorKey: "translations",
    header: "Перевод",
    cell: ({ row }) => {
      const translations = row.getValue("translations") as {
        translation: string;
      }[];
      return translations.map((t) => t.translation).join(", ");
    },
  },
  {
    accessorKey: "speechPart",
    header: "Часть речи",
    cell: ({ row }) => {
      const speechPart = row.getValue("speechPart") as string;
      return <Badge variant="secondary">{speechPart}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    enableSorting: true,
    header: "Добавлено",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return new Date(date).toLocaleString();
    },
  },
  {
    id: "actions", // Unique ID for the actions column
    header: "Действия",
    cell: ({ cell }) => {
      const wordData = cell.row.original;
      return <ActionButtons wordData={wordData} />;
    },
  },
];
