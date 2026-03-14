import { useMemo } from 'react'
import { useLatestNews } from './useLatestNews'
import './latestNews.css'

const relativeTime = (isoValue) => {
  if (!isoValue) return 'just now'

  const diffMs = Date.now() - new Date(isoValue).getTime()
  const min = Math.floor(diffMs / 60000)

  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`

  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const formatPublished = (isoValue) => {
  if (!isoValue) return 'Unknown time'

  return new Date(isoValue).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function LatestNewsPanel() {
  const { articles, isLoading, error, lastUpdatedAt, refreshNow, refreshMs } = useLatestNews()

  const refreshLabel = useMemo(() => {
    const min = Math.floor(refreshMs / 60000)
    if (min >= 60) return `${Math.floor(min / 60)}h`
    return `${min}m`
  }, [refreshMs])

  return (
    <section className="latest-news-wrapper">
      <header className="latest-news-header">
        <div>
          <h2>Latest India Finance News</h2>
          <p>
            Auto-refresh every {refreshLabel} · Last updated {relativeTime(lastUpdatedAt)}
          </p>
        </div>

        <button type="button" className="news-refresh-btn" onClick={() => void refreshNow()}>
          Refresh now
        </button>
      </header>

      {isLoading && <div className="news-state">Loading latest finance headlines…</div>}

      {!isLoading && error && (
        <div className="news-state news-error">Unable to fetch news: {error}</div>
      )}

      {!isLoading && articles.length === 0 && (
        <div className="news-state">No finance news available right now.</div>
      )}

      {!isLoading && articles.length > 0 && (
        <ul className="news-list">
          {articles.map((item) => (
            <li key={item.url} className="news-card">
              {item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" /> : null}

              <div>
                <p className="news-meta">
                  <span>{item.source}</span>
                  <span>{formatPublished(item.publishedAt)}</span>
                </p>

                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.title}
                </a>

                {item.description ? <p className="news-description">{item.description}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default LatestNewsPanel
