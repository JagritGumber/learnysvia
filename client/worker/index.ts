export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    // Handle API routes
    if (url.pathname.startsWith("/api/")) {
      return Response.json({
        name: "Cloudflare",
      });
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
