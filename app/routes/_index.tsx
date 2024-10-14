import type { MetaFunction } from "@remix-run/node";
import { Container } from "~/components/container";
import { SearchBar } from "~/components/search-bar";

export const meta: MetaFunction = () => {
  return [
    { title: "Агульский Словарь" },
    { name: "description", content: "Добро пожаловать в агульский словарь!" },
  ];
};

export default function Index() {
  return (
    <Container>
      <SearchBar />
    </Container>
  );
}
