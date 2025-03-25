import { LoaderFunction, useNavigate, type MetaFunction } from "react-router";
import { useLoaderData, useSearchParams } from "react-router";
import { Container } from "~/components/container";
import { SearchBar } from "~/components/search-bar";
import { fullTextSearch } from "~/utils/full-text-search";
import { TagType, WordServerType } from "~/types/types";
import { SearchX } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { prisma } from "~/utils/db.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Агульский Словарь" },
    { name: "description", content: "Добро пожаловать в агульский словарь!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");

  const searchByTag = async (tagName: string) => {
    const tag = tagName.replace("#", "");
    const data = await prisma.word.findMany({
      where: { tags: { some: { name: tag } } },
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

  if (query.startsWith("#")) {
    return await searchByTag(query);
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

  const handleTagClick = (tagName: string) => {
    // Update URL with the selected tag, clearing any existing query
    const tagWithHash = `#${tagName}`;
    navigate(`/?query=${encodeURIComponent(tagWithHash)}`, { replace: true });
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

  return (
    <Container>
      <SearchBar searchQuery={query ?? ""} />

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

                <div className="mt-4 flex flex-col gap-2">
                  <span className="italic">теги:</span>
                  <div className="flex gap-2">
                    {word.tags?.map((tag: TagType) => {
                      return (
                        <Badge
                          key={tag.id}
                          className="cursor-pointer"
                          variant="secondary"
                          data-value={tag.name}
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
              </div>
            ))}
          </ul>
        ) : (
          resultsUiState
        )}
      </div>
    </Container>
  );
}
