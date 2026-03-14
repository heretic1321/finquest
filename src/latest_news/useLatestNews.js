import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NEWS_SETTINGS } from './config'
import { fetchLatestFinanceNews } from './newsApi'

const formatError = (error) => {
  if (error instanceof Error && error.message) return error.message
  return 'Failed to load latest finance news.'
}

export const useLatestNews = (options) => {
  const settings = useMemo(
    () => ({ ...NEWS_SETTINGS, ...(options || {}) }),
    [
      options?.country,
      options?.language,
      options?.category,
      options?.query,
      options?.pageSize,
      options?.refreshMs,
    ],
  )

  const [articles, setArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)
  const timerRef = useRef(null)

  const loadNews = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setIsLoading(true)
      }

      setError('')
      const rows = await fetchLatestFinanceNews(settings)
      setArticles(rows)
      setLastUpdatedAt(new Date().toISOString())
    } catch (err) {
      setError(formatError(err))
    } finally {
      if (showLoader) {
        setIsLoading(false)
      }
    }
  }, [settings])

  useEffect(() => {
    void loadNews(true)

    if (settings.refreshMs > 0) {
      timerRef.current = setInterval(() => {
        void loadNews(false)
      }, settings.refreshMs)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [loadNews, settings.refreshMs])

  return {
    articles,
    isLoading,
    error,
    lastUpdatedAt,
    refreshNow: loadNews,
    refreshMs: settings.refreshMs,
  }
}
