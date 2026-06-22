# Cloudflare Worker TODO List

A lightweight, single-file TODO list application built with Cloudflare Workers. It features a complete REST API and a built-in web interface.

## Features
- **Single File**: Both backend API and frontend UI are contained within `todo-worker.js`.
- **RESTful API**: Supports GET, POST, PATCH, and DELETE operations.
- **Web UI**: High-performance, vanilla JS frontend with CSS.
- **No External Dependencies**: Built using standard Web APIs.

## How it works
1. **Routing**: The worker inspects the URL path to determine whether to serve the HTML interface or handle an API request.
2. **Persistence**: Currently uses an in-memory `STATE` object. Note that data resets on worker "cold starts." For permanent storage, you can easily adapt this to use Cloudflare KV or D1.
3. **Subpath Support**: Automatically detects its own hosting path to ensure API calls from the browser are routed correctly.

## How to Deploy
No `wrangler.toml` is strictly required if you use the Cloudflare Dashboard:
1. Create a new Worker in the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Copy the contents of `todo-worker.js` into the online editor.
3. Save and Deploy.

If you prefer using Wrangler CLI:
```bash
npx wrangler publish todo-worker.js --name clouflare-todo
```

## References
This project was implemented by a **Camel AI Assistant** running in a terminal environment.

---
*Created on 2026-06-22*