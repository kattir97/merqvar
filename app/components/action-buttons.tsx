import { PencilLine, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

import { Form, Link } from "react-router";
import { Button } from "./ui/button";
import { WordColumnType } from "~/types/types";
import { useUser } from "~/utils/user";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";

const ActionButtons = ({ wordData }: { wordData: WordColumnType }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const user = useUser();
  const canDelete = user.roles.some((role) =>
    role.permissions.some((per) => per.action === "delete")
  );
  // const canDelete = true;

  return (
    <div className="flex gap-4">
      <button onClick={() => {}}>
        <Link to={`/admin/edit/${wordData.id}`}>
          <PencilLine className="hover:text-green-400 transition-all duration-200" />
        </Link>
      </button>
      {canDelete ? (
        <button onClick={() => setDialogOpen(true)}>
          <Trash2 className="text-red-400 hover:text-red-500 transition-all duration-200" />
        </button>
      ) : null}

      <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Вы уверены что хотите удалить это слово?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Это навсегда удалит данное слово.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form method="POST" action="/admin/delete-word">
            <AuthenticityTokenInput />
            <AlertDialogFooter>
              <AlertDialogCancel>Отменить</AlertDialogCancel>
              <Button
                className="bg-red-600 hover:bg-red-700"
                type="submit"
                onClick={() => setDialogOpen(false)}
              >
                Удалить
              </Button>
            </AlertDialogFooter>
            <input type="hidden" name="wordId" value={wordData.id} />
            <input type="hidden" name="headword" value={wordData.headword} />
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActionButtons;
