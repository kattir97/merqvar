import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form } from "@remix-run/react";

type SearchBarProps = {
  height?: "h-8" | "h-9" | "h-10" | "h-11" | "h-12";
};

export const SearchBar = ({ height = "h-12" }: SearchBarProps) => {
  return (
    <Form>
      <div className={`flex gap-2 ${height}`}>
        <Input className="h-full text-lg border-zinc-400" spellCheck={false} />
        <Button className="h-full">
          <div className="flex justify-center items-center gap-2">
            <Search size={20} />
            <span className="text-lg">Искать</span>
          </div>
        </Button>
      </div>
    </Form>
  );
};
