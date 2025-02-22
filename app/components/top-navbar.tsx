import { Link } from "@remix-run/react";
import { ThemeSwitch } from "../routes/theme-switch";
import { Theme } from "~/types/theme";
import { useOptionalUser } from "~/utils/user";
import AccountDropdown from "./account-dropdown";

const TopNavbar = ({ theme }: { theme: Theme }) => {
  const user = useOptionalUser();
  return (
    <nav className="flex justify-between items-center shadow-sm p-3 border-b h-[4rem]">
      <Link to="/" className="">
        Мярхъвар
      </Link>
      <ThemeSwitch userPreference={theme} />

      {user ? <AccountDropdown /> : null}
    </nav>
  );
};

export { TopNavbar };
