import { LoaderFunction, useNavigate, type MetaFunction } from "react-router";
import { useLoaderData, useSearchParams } from "react-router";
import { Container } from "~/components/container";
import { SearchBar } from "~/components/search-bar";
import { fullTextSearch } from "~/utils/full-text-search";
import { TagType, WordServerType } from "~/types/types";
import { SearchX } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { prisma } from "~/utils/db.server";
import { useEffect, useState } from "react";
import { Card } from "~/components/ui/card";

export const meta: MetaFunction = () => {
  return [
    { title: "Агульский Словарь" },
    { name: "description", content: "Добро пожаловать в агульский словарь!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");

  const searchByTag = async (tagNames: string[]) => {
    const tags = tagNames
      .map((tag) => tag.replace("#", "").trim())
      .filter(Boolean);

    const data = await prisma.word.findMany({
      where: {
        tags: {
          some: {
            // Use 'some' for "any of these tags"; use 'every' for "all of these tags"
            name: { in: tags },
          },
        },
      },
      include: {
        translations: true,
        examples: true,
        tags: true,
      },
    });

    return data;
  };

  if (!query) {
    return [];
  }

  if (query.includes("#")) {
    const tags = query.split(" ").filter((t) => t.startsWith("#"));
    return await searchByTag(tags);
  } else {
    return await fullTextSearch(query);
  }
};

export default function Index() {
  const results = useLoaderData<WordServerType[]>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const hasResults = results.length > 0;
  const intialTags = query?.split(" ").filter((t) => t.startsWith("#"));

  const [selectedTags, setSelectedTags] = useState(intialTags ?? []);

  const handleTagClick = (tagName: string) => {
    // Update URL with the selected tag, clearing any existing query
    const newTags = selectedTags.includes(tagName)
      ? selectedTags.filter((t) => t !== tagName)
      : [...selectedTags, tagName];

    setSelectedTags(newTags);

    const tagQuery = newTags.join(" ");

    navigate(`/?query=${encodeURIComponent(tagQuery)}`, { replace: true });
  };

  const noWordFound = (
    <div className="flex items-center justify-center mt-10 text-lg">
      <div className="flex flex-col items-center justify-center">
        <SearchX size="40" />
        <span>Слово не найдено</span>
      </div>
    </div>
  );

  const resultsUiState = query && !hasResults ? noWordFound : "";

  // Sync selectedTags with query when it changes (e.g., from SearchBar)
  useEffect(() => {
    const tagsFromQuery =
      query?.split(" ").filter((t) => t.startsWith("#")) ?? [];
    setSelectedTags(tagsFromQuery);
  }, [query]);

  return (
    <Container>
      <SearchBar searchQuery={query ?? ""} />

      <div className="my-5">
        {query && results.length > 0 ? (
          <ul>
            {results.map((word: WordServerType) => (
              <Card
                className="border bg-gray-50 rounded-lg shadow-sm p-4 my-4"
                key={word.id}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-700">
                    {word.headword}
                  </span>
                  {/* <button onClick={() => playAudio(word.audioUrl)}>🔊</button> */}

                  {" - "}
                  <span className="italic">
                    {word.translations.map((tr) => tr.translation).join(", ")}
                  </span>
                </div>

                <div className="mt-2 space-y-2">
                  {word.examples?.map((ex, id) => (
                    <blockquote
                      key={id}
                      className="border-l-4 border-blue-900 pl-3 italic text-gray-700"
                    >
                      💬 <b>{ex.example}</b> — {ex.translation}
                    </blockquote>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {/* <span className="italic">теги:</span */}
                  <div className="flex gap-2">
                    {word.tags?.map((tag: TagType) => {
                      return (
                        <Badge
                          key={tag.id}
                          className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 hover:bg-gray-300 cursor-pointer"
                          variant="secondary"
                          data-value={`#${tag.name}`}
                          onClick={(e) =>
                            handleTagClick(
                              e.currentTarget.getAttribute("data-value") ?? ""
                            )
                          }
                        >
                          #{tag.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </ul>
        ) : (
          resultsUiState
        )}
      </div>
    </Container>
  );
}
