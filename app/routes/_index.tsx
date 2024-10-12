import type { MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export const meta: MetaFunction = () => {
  return [
    { title: "Агульский Словарь" },
    { name: "description", content: "Добро пожаловать в агульский словарь!" },
  ];
};

export default function Index() {
  return (
    <div className=" flex flex-col max-w-5xl mt-10 mx-auto ">
      <Form>
        <div className="flex gap-2 h-12 ">
          <Input className="h-full text-lg" spellCheck={false} />
          <Button className="h-full">
            <div className="flex justify-center items-center gap-2">
              <Search size={20} />
              <span className="text-lg">Искать</span>
            </div>
          </Button>
        </div>
      </Form>
    </div>
  );
}
