import { Link, NavLink } from "react-router";
import { ThemeSwitch } from "../routes/theme-switch";
import { Theme } from "~/types/theme";
import { useOptionalUser } from "~/utils/user";
import { Menu, MonitorCog, User, X } from "lucide-react";
import { Badge } from "./ui/badge";
import "@fontsource/anta";
import { useState } from "react";
import { Card } from "./ui/card";

const TopNavbar = ({
  theme,
  hasAdminAccess,
}: {
  theme: Theme;
  hasAdminAccess: boolean;
}) => {
  const user = useOptionalUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const clearSearchInput = () => {
    const searchEl = document.getElementById("searchInput") as HTMLInputElement;

    if (searchEl) {
      searchEl.value = "";
    }
  };

  return (
    <nav className="flex justify-between items-center shadow-sm p-3 border-b h-[4rem]">
      <Link to="/" className="font-anta text-xl" onClick={clearSearchInput}>
        Merqvar
      </Link>

      <ThemeSwitch userPreference={theme} />
      {/* Desktop nav hidden on mobile */}
      <div className="hidden md:flex gap-2">
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
      </div>

      {/* Mobile Menu Toggle */}
      {user ? (
        <button
          className="md:hidden"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      ) : null}

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <Card
          className="fixed top-16 left-0 right-0  p-4 shadow-md z-50
          flex flex-col items-stretch rounded-none"
        >
          <NavLink to="/profile" onClick={() => setIsMenuOpen(false)}>
            <Badge
              variant="secondary"
              className="p-2 gap-2 mb-2 flex justify-center"
            >
              <User />
              <span>{user?.username}</span>
            </Badge>
          </NavLink>
          {hasAdminAccess && (
            <NavLink to="/admin" onClick={() => setIsMenuOpen(false)}>
              <Badge
                variant="secondary"
                className="p-2 gap-2 mb-2 flex justify-center"
              >
                <MonitorCog />
                <span>Admin</span>
              </Badge>
            </NavLink>
          )}
        </Card>
      )}
    </nav>
  );
};

export { TopNavbar };
