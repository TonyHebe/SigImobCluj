import { ListariClientPage } from "@/app/listari/ListariClient";

type SearchParams = Record<string, string | string[] | undefined>;

function getSearchParam(sp: SearchParams | undefined, key: string) {
  const v = sp?.[key];
  return Array.isArray(v) ? v[0] : v;
}

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function ListariPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? undefined;
  const filters = {
    propertyType:
      getSearchParam(resolvedSearchParams, "propertyType") ?? "Oricare",
    neighborhood:
      getSearchParam(resolvedSearchParams, "neighborhood") ?? "Oricare",
    budget: getSearchParam(resolvedSearchParams, "budget") ?? "",
    id: getSearchParam(resolvedSearchParams, "id") ?? "",
  };

  return <ListariClientPage filters={filters} />;
}

