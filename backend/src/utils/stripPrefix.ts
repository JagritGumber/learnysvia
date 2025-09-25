import cookie from "cookie";

export function stripPrefixFromCookie(cookieHeader: string): string {
  const parsed = cookie.parse(cookieHeader);
  const out: Record<string, string> = {};

  for (const [name, val] of Object.entries(parsed)) {
    const newName = name.replace(/^(?:__Secure|__Host)[-_.]?/, "");
    out[newName] = val!;
  }

  return Object.entries(out)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}
