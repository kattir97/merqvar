import { ColumnDef } from "@tanstack/react-table";
import { PencilLine, Trash2, ArrowUpDown } from "lucide-react";
import { z } from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

const AdminWordSchema = z.object({
  headword: z.string(),
  translations: z.array(z.object({ translation: z.string() })),
  speechPart: z.string(),
  createdAt: z.string(),
});

type AdminWord = z.infer<typeof AdminWordSchema>;

export const columns: ColumnDef<AdminWord>[] = [
  {
    accessorKey: "headword",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Слово
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "translations",
    header: "Перевод",
    cell: ({ row }) => {
      const translations = row.getValue("translations") as { translation: string }[];
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
    header: "Добавлено",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return new Date(date).toLocaleString();
    },
  },
  {
    id: "actions", // Unique ID for the actions column
    header: "Действия",
    cell: () => (
      <div className="flex gap-4">
        <button onClick={() => {}}>
          <PencilLine className="hover:text-green-400 transition-all duration-200" />
        </button>
        <button onClick={() => {}}>
          <Trash2 className="text-red-400 hover:text-red-500 transition-all duration-200" />
        </button>
      </div>
    ),
  },
];
