# latest_news module

This folder contains an isolated, reusable finance-news feature for FinQuest.

## What it does
- Fetches latest India-focused finance/business headlines.
- Uses provider fallback:
  1) NewsData (`VITE_NEWSDATA_API_KEY`)
  2) GNews (`VITE_GNEWS_API_KEY`)
- Auto refreshes at a fixed interval (`refreshMs`, default 5 minutes).
- Exposes a React panel UI and a hook.

## Files
- `config.js` → refresh + filter defaults
- `newsApi.js` → provider clients + normalization
- `useLatestNews.js` → polling, loading/error state
- `LatestNewsPanel.jsx` → display UI
- `latestNews.css` → panel styling

## Required env variables
Create a `.env` file in project root and add at least one key:

- `VITE_NEWSDATA_API_KEY=...`
- `VITE_GNEWS_API_KEY=...`

If both are present, NewsData is tried first and GNews is used as fallback.

## Realtime behavior
News APIs are normally polled (not true streaming). This module treats "realtime" as timed polling.

- External API fetch: every `refreshMs`
- Manual refresh button: immediate

You can tune `refreshMs` in `config.js`.
