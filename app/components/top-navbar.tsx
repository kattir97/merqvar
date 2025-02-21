import { Link } from "@remix-run/react";
import { ThemeSwitch } from "../routes/theme-switch";
import { Theme } from "~/types/theme";

const TopNavbar = ({ theme }: { theme: Theme }) => {
  return (
    <nav className="flex justify-between items-center shadow-sm p-3 border-b h-[4rem]">
      <Link to="/" className="">
        Мярхъвар
      </Link>
      <ThemeSwitch userPreference={theme} />
      <Link to="/login">Login</Link>
      <Link to="/admin" prefetch="intent">
        Админка
      </Link>
    </nav>
  );
};

export { TopNavbar };
