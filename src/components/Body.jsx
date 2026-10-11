import { toHtml } from '../data/body'

// Renders the article / case text. The HTML was cleaned on the server before it was stored.
export default function Body({ body }) {
  return <div className="rich" dangerouslySetInnerHTML={{ __html: toHtml(body) }} />
}
