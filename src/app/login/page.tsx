import { LoginPageClient } from "@/components/LoginPageClient";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const nextParamRaw = searchParams?.next;
  const nextParam = Array.isArray(nextParamRaw) ? nextParamRaw[0] : nextParamRaw;
  const nextPath = nextParam && nextParam.startsWith("/") ? nextParam : "/";

  return <LoginPageClient nextPath={nextPath} />;
}

