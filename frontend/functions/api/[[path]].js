
const BACKEND = "https://student-tracker-backend-wi0h.onrender.com";

export async function onRequest(context) {
  const incoming = new URL(context.request.url);
  const target = new URL(incoming.pathname + incoming.search, BACKEND);

  const headers = new Headers(context.request.headers);
  headers.delete("host");

  const response = await fetch(target, {
    method: context.request.method,
    headers,
    body: ["GET", "HEAD"].includes(context.request.method)
      ? undefined
      : context.request.body,
    redirect: "manual"
  });

  const responseHeaders = new Headers(response.headers);

  // Cookies will now be associated with the Cloudflare domain.
  responseHeaders.delete("access-control-allow-origin");
  responseHeaders.delete("access-control-allow-credentials");

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders
  });
}
