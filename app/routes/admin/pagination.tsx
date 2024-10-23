import { useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";

type PaginationProps = {
  page: number;
  isLoading: boolean;
  pageCount: number;
};

export const Pagination = ({ page, isLoading, pageCount }: PaginationProps) => {
  const navigate = useNavigate();

  const handlePageChange = (newPage: number) => {
    // Build the new URL with updated query params (page number)
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("page", String(newPage));
    navigate(`${newUrl.pathname}?${newUrl.searchParams.toString()}`, {
      replace: true, // Update the URL without triggering a full page reload
    });
  };

  return (
    <div className="flex items-center justify-center space-x-2 py-4 mr-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1 || isLoading}
      >
        Предыдущая
      </Button>
      <span>{`Страница ${page} из ${pageCount}`}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page + 1)}
        disabled={page >= pageCount || isLoading}
      >
        Следующая
      </Button>
    </div>
  );
};
