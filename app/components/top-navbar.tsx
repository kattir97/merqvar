import { Link } from "@remix-run/react";

const TopNavbar: React.FC = () => {
  return (
    <nav className="flex justify-between items-center shadow-sm p-3 border-b">
      <Link to="/" className="">
        Мярхъвар
      </Link>
      <Link to="/admin" prefetch="intent">
        Админка
      </Link>
    </nav>
  );
};

export { TopNavbar };
