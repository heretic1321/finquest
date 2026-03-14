import { NEWS_ENV_KEYS, NEWS_SETTINGS } from './config'

const sortByPublishedDesc = (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)

const uniqueByUrlOrTitle = (items) => {
  const seen = new Set()

  return items.filter((item) => {
    const key = item.url || item.title

    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const normalizeNewsData = (payload) => {
  const rows = Array.isArray(payload?.results) ? payload.results : []

  return rows
    .map((row) => ({
      title: row.title,
      description: row.description || '',
      url: row.link,
      imageUrl: row.image_url || '',
      source: row.source_id || 'NewsData',
      publishedAt: row.pubDate ? row.pubDate.trim().replace(' ', 'T') + 'Z' : new Date().toISOString(),
    }))
    .filter((row) => row.title && row.url)
}

const normalizeGNews = (payload) => {
  const rows = Array.isArray(payload?.articles) ? payload.articles : []

  return rows
    .map((row) => ({
      title: row.title,
      description: row.description || '',
      url: row.url,
      imageUrl: row.image || '',
      source: row.source?.name || 'GNews',
      publishedAt: row.publishedAt || new Date().toISOString(),
    }))
    .filter((row) => row.title && row.url)
}

const fetchJson = async (url, providerName) => {
  const response = await fetch(url)

  if (!response.ok) {
    const error = new Error(`${providerName} request failed (${response.status})`)
    error.status = response.status
    error.providerName = providerName
    throw error
  }

  return response.json()
}

const fromNewsData = async ({ country, language, category, query, pageSize }) => {
  const key = import.meta.env[NEWS_ENV_KEYS.newsDataApiKey]

  if (!key) {
    throw new Error('Missing NewsData API key')
  }

  const url = new URL('https://newsdata.io/api/1/latest')
  url.searchParams.set('apikey', key)
  url.searchParams.set('country', country)
  url.searchParams.set('language', language)
  url.searchParams.set('category', category)
  url.searchParams.set('size', String(pageSize))
  url.searchParams.set('q', query)

  const payload = await fetchJson(url.toString(), 'NewsData')
  return normalizeNewsData(payload)
}

const fromGNews = async ({ country, language, category, pageSize }) => {
  const key = import.meta.env[NEWS_ENV_KEYS.gNewsApiKey]

  if (!key) {
    throw new Error('Missing GNews API key')
  }

  const topic = category === 'business' ? 'business' : 'world'
  const url = new URL('https://gnews.io/api/v4/top-headlines')
  url.searchParams.set('token', key)
  url.searchParams.set('lang', language)
  url.searchParams.set('country', country)
  url.searchParams.set('topic', topic)
  url.searchParams.set('max', String(pageSize))

  const payload = await fetchJson(url.toString(), 'GNews')
  return normalizeGNews(payload)
}

export const fetchLatestFinanceNews = async (overrides = {}) => {
  const settings = { ...NEWS_SETTINGS, ...overrides }

  const errors = []
  const gNewsEnvName = NEWS_ENV_KEYS?.gNewsApiKey
  const hasGNewsConfigured = Boolean(gNewsEnvName && import.meta.env[gNewsEnvName])

  try {
    const primary = await fromNewsData(settings)

    if (primary.length > 0) {
      return uniqueByUrlOrTitle(primary).sort(sortByPublishedDesc)
    }
  } catch (error) {
    errors.push(error)
  }

  if (hasGNewsConfigured) {
    try {
      const fallback = await fromGNews(settings)
      return uniqueByUrlOrTitle(fallback).sort(sortByPublishedDesc)
    } catch (error) {
      errors.push(error)
    }
  }

  const newsData429 = errors.find((error) => error?.status === 429)

  if (newsData429 && !hasGNewsConfigured) {
    throw new Error(
      'NewsData rate limit reached (429). Please wait before refreshing, or increase refresh time in config.',
    )
  }

  const message = errors.map((error) => error.message).join(' | ')
  throw new Error(message || 'Unable to fetch finance news')
}
