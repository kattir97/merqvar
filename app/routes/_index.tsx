import { LoaderFunction, type MetaFunction } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Container } from "~/components/container";
import { SearchBar } from "~/components/search-bar";
import { WordType } from "~/types/types";
import { fullTextSearch } from "~/utils/full-text-search";

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
  const results = useLoaderData<WordType[]>();
  const navigate = useNavigate();
  const [resultsUiState, setResultsUiState] = useState("");
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");

  // Clear the query parameter on page load
  useEffect(() => {
    if (query) {
      navigate("/", { replace: true }); // Remove query parameter from the URL
    }
  }, []);

  useEffect(() => {
    // Update resultsUiState based on results
    if (!query) {
      setResultsUiState(""); // Empty on refresh or no query
    } else if (query && results.length === 0) {
      setResultsUiState("Not found");
    } else {
      setResultsUiState(""); // Reset UI state if results are found
    }
  }, [query, results]);

  return (
    <Container>
      <SearchBar />

      <div className="my-5">
        {query && results.length > 0 ? (
          <ul>
            {results.map((word: WordType) => (
              <div className="border rounded-md p-2 my-2" key={word.id}>
                <span className="text-2xl font-semibold">{word.headword}</span> -{" "}
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
          <p>{resultsUiState}</p>
        )}
      </div>
    </Container>
  );
}
