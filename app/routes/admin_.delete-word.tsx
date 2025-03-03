import { prisma } from "~/utils/db.server";
import { ActionFunction, redirect } from "react-router";
import { toastSessionStorage } from "~/utils/toast.server";
import { requireAdmin } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
  await requireAdmin(request);
  const formData = await request.formData();
  const wordId = formData.get("wordId");
  const headword = formData.get("headword");

  if (typeof wordId === "string") {
    try {
      await prisma.word.delete({
        where: { id: wordId },
      });

      const cookie = request.headers.get("cookie");
      const toastCookieSession = await toastSessionStorage.getSession(cookie);
      toastCookieSession.flash("toast", {
        type: "success",
        title: "Слово удалено",
        description: `Слово ${headword} было удалено!`,
      });

      return redirect("/admin", {
        headers: {
          "set-cookie": await toastSessionStorage.commitSession(toastCookieSession),
        },
      }); // Adjust to your admin page route
    } catch (error) {
      console.error("Failed to delete word:", error);
      throw new Error("Failed to delete word.");
    }
  }

  throw new Error("Invalid word ID.");
};
