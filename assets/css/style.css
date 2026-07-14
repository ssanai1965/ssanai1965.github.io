:root {
  --bg: #FBF8F2;
  --text: #2E2A24;
  --muted: #8A8272;
  --brand: #5C6E4A;
  --line: #E4DFD4;
  --card-bg: #FFFFFF;

  --c-diary: #C97B63;
  --c-hobby: #4F86A6;
  --c-info: #B08D57;
  --c-study: #6B5B95;
  --c-writing: #5C6E4A;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  line-height: 1.6;
}

.wrap {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 24px;
}

a { color: inherit; text-decoration: none; }

/* Header */
.site-header {
  border-bottom: 1px solid var(--line);
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding-top: 18px;
  padding-bottom: 18px;
  gap: 12px;
}

.brand {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tab {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  color: var(--muted);
  transition: background 0.15s, color 0.15s;
}

.tab:hover { background: var(--line); color: var(--text); }

.tab.is-active {
  background: var(--text);
  color: #fff;
}

.tab-accent {
  color: #fff;
  background: var(--brand);
}

.tab-accent:hover { background: #4a5a3b; color: #fff; }

/* Main */
.main { padding: 40px 24px 80px; }

.hero {
  padding: 24px 0 40px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 40px;
}

.hero h1 {
  font-size: 32px;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.hero p {
  margin: 0;
  color: var(--muted);
  font-size: 16px;
}

.section { margin-bottom: 48px; }

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-head h2 {
  font-size: 20px;
  margin: 0;
}

.see-all {
  font-size: 14px;
  color: var(--muted);
}

.see-all:hover { color: var(--brand); }

.listing-head h1 {
  font-size: 26px;
  margin: 0 0 6px;
}

.listing-desc {
  color: var(--muted);
  margin: 0;
}

.empty {
  color: var(--muted);
  padding: 40px 0;
  text-align: center;
}

/* Grid + Cards */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 720px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .grid { grid-template-columns: 1fr; }
}

.card {
  display: block;
  background: var(--card-bg);
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(46, 42, 36, 0.08);
}

.card-thumb {
  aspect-ratio: 4 / 3;
  background: #EFEAE0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-fallback {
  font-size: 14px;
  font-weight: 700;
  color: var(--muted);
}

.card-thumb[data-cat="diary"] { background: color-mix(in srgb, var(--c-diary) 18%, #fff); }
.card-thumb[data-cat="hobby"] { background: color-mix(in srgb, var(--c-hobby) 18%, #fff); }
.card-thumb[data-cat="info"] { background: color-mix(in srgb, var(--c-info) 18%, #fff); }
.card-thumb[data-cat="study"] { background: color-mix(in srgb, var(--c-study) 18%, #fff); }
.card-thumb[data-cat="writing"] { background: color-mix(in srgb, var(--c-writing) 18%, #fff); }

.card-body { padding: 14px 16px 18px; }

.chip {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  color: #fff;
  margin-bottom: 8px;
}

.chip[data-cat="diary"] { background: var(--c-diary); }
.chip[data-cat="hobby"] { background: var(--c-hobby); }
.chip[data-cat="info"] { background: var(--c-info); }
.chip[data-cat="study"] { background: var(--c-study); }
.chip[data-cat="writing"] { background: var(--c-writing); }

.card-title {
  font-size: 16px;
  margin: 0 0 6px;
  line-height: 1.4;
}

.card-date {
  font-size: 13px;
  color: var(--muted);
}

/* Post detail */
.post { max-width: 720px; margin: 0 auto; }

.post-title {
  font-size: 28px;
  margin: 10px 0 6px;
}

.post-date {
  color: var(--muted);
  font-size: 14px;
}

.post-image {
  margin: 24px 0;
  border-radius: 14px;
  overflow: hidden;
}

.post-image img { width: 100%; display: block; }

.post-content {
  font-size: 16px;
  margin-top: 24px;
}

.post-content img {
  max-width: 100%;
  border-radius: 10px;
}

.back-link {
  display: inline-block;
  margin-top: 40px;
  font-size: 14px;
  color: var(--muted);
}

.back-link:hover { color: var(--brand); }

/* Footer */
.site-footer {
  border-top: 1px solid var(--line);
  padding: 24px 0;
  color: var(--muted);
  font-size: 13px;
}
