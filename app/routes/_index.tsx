import { LoaderFunction, type MetaFunction } from "react-router";
import { useLoaderData, useSearchParams } from "react-router";
import { Container } from "~/components/container";
import { SearchBar } from "~/components/search-bar";
import { fullTextSearch } from "~/utils/full-text-search";
import { WordServerType } from "~/types/types";
import { SearchX } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Агульский Словарь" },
    { name: "description", content: "Добро пожаловать в агульский словарь!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");

  if (!query) {
    return [];
  }

  const results = await fullTextSearch(query);

  return results;
};

export default function Index() {
  const results = useLoaderData<WordServerType[]>();

  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const hasResults = results.length > 0;

  const resultsUiState = query && !hasResults ? "Слово не найдено" : "";

  return (
    <Container>
      <SearchBar />

      <div className="my-5">
        {query && results.length > 0 ? (
          <ul>
            {results.map((word: WordServerType) => (
              <div className="border rounded-md p-2 my-2" key={word.id}>
                <span className="text-2xl font-semibold">{word.headword}</span>
                {" - "}
                <span className="italic">
                  {word.translations.map((tr) => tr.translation).join(", ")}
                </span>
                <div className="mt-4">
                  <span className="italic">примеры:</span>
                  <ul>
                    {word.examples?.map((ex, id) => {
                      return (
                        <li key={id}>
                          {ex.example} - {ex.translation}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center mt-10 text-lg">
            <div className="flex flex-col items-center justify-center">
              <SearchX size="40" />
              {resultsUiState}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
