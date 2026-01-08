import { ListariClientPage } from "@/app/listari/ListariClient";

type SearchParams = Record<string, string | string[] | undefined>;

function getSearchParam(sp: SearchParams | undefined, key: string) {
  const v = sp?.[key];
  return Array.isArray(v) ? v[0] : v;
}

function getSearchParamInt(
  sp: SearchParams | undefined,
  key: string,
  fallback: number,
) {
  const raw = getSearchParam(sp, key);
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  const asInt = Math.floor(n);
  return asInt >= 1 ? asInt : fallback;
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
  const page = getSearchParamInt(resolvedSearchParams, "page", 1);

  return <ListariClientPage filters={filters} page={page} />;
}

