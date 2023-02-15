import { innerHTML, html, use } from '//diffhtml.org/core';
import { Component, createSideEffect, createState } from '//diffhtml.org/components';
import serviceWorker from '//diffhtml.org/middleware-service-worker';

const API = 'https://hacker-news.firebaseio.com/v0';
const hackerNewsImage = 'https://cdn.glitch.com/d33ada82-6625-467c-909c-caf5d3d9cc42%2Fhn.gif?v=1616264743410';

use(serviceWorker());

/**
 * Shows comments in a thread
 */
function CommentList({ parent, kids }) {
  const [ comments, setComments ] = createState([]);

  createSideEffect(async () => {
    if (kids) {
      const comments = await Promise.all(kids.map(id => {
        return fetch(`${API}/item/${id}.json`).then(resp => resp.json());
      }));

      setComments(comments);
    }
  });

  return html`
    ${comments
      .filter((comment) => comment.parent === parent)
      .filter(comment => comment.by)
      .map(comment => html`
        <div class="hacker-news-comment">
          <a href="#comment-1" class="hacker-news-comment-border-link"></a>

          <div class="hacker-news-comment-heading">
            <div class="hacker-news-comment-info">
              <a href="#" class="hacker-news-comment-author">@${comment.by}</a>
            </div>
          </div>

          <div class="hacker-news-comment-body">
            ${html(comment.text)}
          </div>

          ${Boolean(comment?.kids?.length) && html`
            <div class="hacker-news-replies">
              <${CommentList} parent=${comment.id} kids=${comment.kids} />
            </div>
          `}
        </div>
      `)}
  `;
}

/**
 * Shows news items
 */
function NewsItem({ row, isExpanded, onClick, key, tagName }) {
  const [ isFrameCollapsed, setFrameCollapsed ] = createState(true);
  const toggleFrameCollapsed = ev => {
    ev.stopPropagation();
    setFrameCollapsed(!isFrameCollapsed);
  }

  return html`
    <div
      class=${isExpanded ? 'hacker-news-item-expanded' : 'hacker-news-item'}
      onClick=${!isExpanded && onClick}
      key=${key}
    >
      ${!isExpanded && html`
        <div class="hacker-news-comment-count">
          <span>
            ${String(row?.descendants ?? 0)}
          </span>
        </div>
      `}

      <header class="hacker-news-item-header">
        <strong class="hacker-news-title">
          ${isExpanded && html`
            <a target="_new" href=${row.url}>${row.title}</a>
          `}
          ${!isExpanded && html`<a href="#">${row.title}</a>`}
        </strong>

        <p class="hacker-news-by-line">
          <span class="hacker-news-score">${row.score} points</span>
          <a href="https://news.ycombinator.com/user?id=${row.by}" class="hacker-news-by">@${row.by}</a>
          ${Boolean(row.url) && html`
            <span class="hacker-news-url">(${new URL(row.url).hostname})</span>
          `}
        </p>
      </header>

      ${isExpanded && html`
        <div class="hacker-news-content">
          <p><strong>${String(row?.descendants ?? 'No')} Comments</strong></p>

          <div class="hacker-news-comment-thread">
            <${CommentList} parent=${row.id} kids=${row.kids} />
          </div>
        </div>
      `}
    </div>
  `;
}

function App() {
  const [ state, setState ] = createState({
    rows: [],
    expandedRow: null,
  });

  const openNewsItem = (newsItemRow) => ev => {
    ev.stopPropagation();
    ev.preventDefault();

    setState({
      ...state,
      expandedRow: newsItemRow,
      lastScroll: document.documentElement.scrollTop,
    });
  };

  const closeNewsItem = ev => {
    ev.stopPropagation();
    ev.preventDefault();

    let scrollTo = state.lastScroll;

    if (state.expandedRow) {
      setState({ ...state, expandedRow: null });
    }
    else {
      // If clicking on the hacker news logo and nothing is open
      // scroll to the top.
      scrollTo = 0;
    }

    window.scrollTo(0, scrollTo);
  };

  createSideEffect(async () => {
    // Fetch the top stories
    const resp = await fetch(`${API}/topstories.json`);
    const ids = await resp.json();

    // Fetch the first 20 top stories metadata
    const rows = await Promise.all(ids.slice(0, 30).map(id => {
      return fetch(`${API}/item/${id}.json`).then(resp => resp.json());
    }));

    setState({ ...state, rows });
  });

  return html`
    <div class="hacker-news">
      <h1 class="hacker-news-header">
        <a href="#" onClick=${closeNewsItem} class="no-select">
          <img
            alt="Hacker News"
            src=${hackerNewsImage}
            class="hacker-news-logo"
            width="18"
            height="18"
          > Hacker News
        </a>
      </h1>

      ${!state.expandedRow && state.rows.length && html`
        <div class="hacker-news-list">
          ${state.rows.map((row, index) => html`
            <${NewsItem}
              key=${row.title}
              row=${row}
              onClick=${openNewsItem(row)}
              isExpanded=${false}
            />
          `)}
        </div>
      `}

      ${state.expandedRow !== null && html`
        <${NewsItem}
          tagName="div"
          row=${state.expandedRow}
          isExpanded=${true}
          style=${{ position: 'fixed', top: 0 }}
        />
      `}

      ${!state.rows.length && html`
        <p class="hacker-news-empty">Loading items to display</p>
      `}
    </div>
  `;
}

innerHTML(document.body.querySelector('main'), html`<${App} />`);
