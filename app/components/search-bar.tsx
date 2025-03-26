import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, useNavigation } from "react-router";
import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";

type SearchBarProps = {
  height?: "h-8" | "h-9" | "h-10" | "h-11" | "h-12";
  searchQuery: string;
};

export const SearchBar = ({ height = "h-12", searchQuery }: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const navigation = useNavigation();

  const isSearching = navigation.state === "loading" && inputValue;

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  return (
    <Form method="GET" action="/">
      <div className={`flex gap-2 ${height}`}>
        <Input
          className="h-full text-lg border-zinc-400"
          spellCheck={false}
          value={inputValue}
          onChange={handleChange}
          name="query"
          id="searchInput"
        />
        <Button className="h-full" type="submit">
          <div className="flex justify-center items-center gap-2">
            {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
            <span className="text-lg md:block hidden">Искать</span>
          </div>
        </Button>
      </div>
    </Form>
  );
};
