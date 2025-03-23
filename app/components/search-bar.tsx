import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, useSearchParams } from "react-router";

type SearchBarProps = {
  height?: "h-8" | "h-9" | "h-10" | "h-11" | "h-12";
  defaultQuery?: string;
};

export const SearchBar = ({ height = "h-12" }: SearchBarProps) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  return (
    <Form method="GET" action="/">
      <div className={`flex gap-2 ${height}`}>
        <Input
          className="h-full text-lg border-zinc-400"
          spellCheck={false}
          defaultValue={query}
          name="query"
          id="searchInput"
        />
        <Button className="h-full" type="submit">
          <div className="flex justify-center items-center gap-2">
            <Search />
            <span className="text-lg md:block hidden">Искать</span>
          </div>
        </Button>
      </div>
    </Form>
  );
};
