export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    // Handle API routes - proxy to external server
    if (url.pathname.startsWith("/api/")) {
      const serverUrl = env.VITE_SERVER_URL;
      const apiUrl = new URL(url.pathname + url.search, serverUrl);

      // Copy headers but remove host to avoid conflicts
      const headers = new Headers();
      for (const [key, value] of request.headers.entries()) {
        if (key.toLowerCase() !== "host") {
          headers.set(key, value);
        }
      }

      try {
        const response = await fetch(apiUrl.toString(), {
          method: request.method,
          headers: headers,
          body: request.body,
        });

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Failed to proxy request" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Try to serve static assets from the ASSETS binding
    try {
      const response = await env.ASSETS.fetch(request);
      if (response.status !== 404) {
        return response;
      }
    } catch (error) {
      // If ASSETS binding fails, continue to fallback
    }

    // Fallback to serving index.html for SPA routing
    try {
      const indexResponse = await env.ASSETS.fetch(
        new URL("/index.html", url.origin)
      );
      if (indexResponse.ok) {
        return new Response(indexResponse.body, {
          ...indexResponse,
          headers: {
            ...Object.fromEntries(indexResponse.headers.entries()),
            "Content-Type": "text/html",
          },
        });
      }
    } catch (error) {
      // If index.html fetch fails, continue to 404
    }

    // Return 404 if nothing matches
    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
