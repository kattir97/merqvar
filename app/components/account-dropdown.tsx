// components/AccountDropdown.tsx
import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"; // Assuming ShadCN-style Avatar component
import { ChevronDown, LogOut, Settings, User } from "lucide-react"; // Icons (e.g., from lucide-react)
import { cn } from "~/lib/utils"; // Utility for className concatenation (common in ShadCN)
import { useOptionalUser } from "~/utils/user";
import { Form, Link } from "react-router";

const AccountDropdown: React.FC = () => {
  const user = useOptionalUser();
  const displayName = user?.name ?? user?.username;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "flex items-center space-x-2 rounded-md border border-gray-200 bg-white p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
            "dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-blue-600"
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {displayName}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            "min-w-[220px] rounded-md border border-gray-200 bg-white p-1 shadow-md",
            "dark:border-gray-700 dark:bg-gray-800",
            "animate-in fade-in-80"
          )}
          sideOffset={8}
        >
          {user?.role === "ADMIN" ? (
            <Link to="/admin">
              <DropdownMenu.Item
                className={cn(
                  "flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-100",
                  "dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                )}
              >
                <User className="h-4 w-4" />
                <span>Admin</span>
              </DropdownMenu.Item>
            </Link>
          ) : null}

          <DropdownMenu.Item
            className={cn(
              "flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-100",
              "dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

          <DropdownMenu.Item
            className={cn(
              "flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50 cursor-pointer",
              "dark:text-red-500 dark:hover:bg-red-900/50 dark:focus:bg-red-900/50"
            )}
            onSelect={(event) => {
              event.preventDefault(); // Prevent default behavior
              const form = document.getElementById("logout-form") as HTMLFormElement;
              form?.submit(); // Manually submit the form
            }}
          >
            <Form method="POST" action="/logout" id="logout-form">
              <button type="submit" className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </Form>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default AccountDropdown;
