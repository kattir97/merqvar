import { Link } from "react-router";
import { ThemeSwitch } from "../routes/theme-switch";
import { Theme } from "~/types/theme";
import { useOptionalUser } from "~/utils/user";
import AccountDropdown from "./account-dropdown";
import { NavLink } from "react-router";
import { BookA, MonitorCog, Table, User } from "lucide-react";
import { Badge, badgeVariants } from "./ui/badge";
import "@fontsource/anta";

const TopNavbar = ({
  theme,
  hasAdminAccess,
}: {
  theme: Theme;
  hasAdminAccess: boolean;
}) => {
  const user = useOptionalUser();

  return (
    <nav className="flex justify-between items-center shadow-sm p-3 border-b h-[4rem]">
      <Link to="/" className="font-anta text-xl">
        Merqvar
      </Link>

      <ThemeSwitch userPreference={theme} />

      <div className="flex gap-2">
        {user ? (
          <NavLink to="/profile">
            <Badge variant="secondary" className="p-2 gap-2">
              <User />
              <span>{user?.username}</span>
            </Badge>
          </NavLink>
        ) : null}

        {hasAdminAccess ? (
          <NavLink to="/admin">
            <Badge variant="secondary" className="p-2 gap-2">
              <MonitorCog />
              <span>Admin</span>
            </Badge>
          </NavLink>
        ) : null}
        {/* {user ? <AccountDropdown /> : null} */}
      </div>
    </nav>
  );
};

export { TopNavbar };
