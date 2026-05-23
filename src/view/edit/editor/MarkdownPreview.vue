<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const props = defineProps<{
  content: string
}>()

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight(str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
      } catch {
        // fall through
      }
    }
    return escapeHtml(str)
  },
})

const renderedContent = computed(() => {
  if (!props.content) return '<p style="color: var(--muted-foreground); text-align: center; padding: 4rem 0;">暂无内容</p>'
  return md.render(props.content)
})
</script>

<template>
  <div class="flex flex-1 flex-col overflow-hidden">
    <!-- Preview header -->
    <div class="flex items-center border-b px-4 py-2.5">
      <span class="text-xs font-medium text-muted-foreground">预览</span>
    </div>

    <!-- Preview body -->
    <div class="flex-1 overflow-y-auto">
      <div
        class="markdown-body px-6 py-5"
        v-html="renderedContent"
      />
    </div>
  </div>
</template>

<style>
.markdown-body {
  color: var(--foreground);
  line-height: 1.75;
  font-size: 0.9375rem;
  max-width: 100%;
  word-wrap: break-word;
}

/* Headings */
.markdown-body h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
  letter-spacing: -0.02em;
}

.markdown-body h2 {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--border);
}

.markdown-body h3 {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 1.25rem 0 0.5rem;
}

.markdown-body h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}

/* Paragraph */
.markdown-body p {
  margin: 0 0 0.875rem;
}

/* Links */
.markdown-body a {
  color: var(--primary);
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

/* Lists */
.markdown-body ul,
.markdown-body ol {
  margin: 0 0 0.875rem;
  padding-left: 1.5rem;
}

.markdown-body li {
  margin-bottom: 0.25rem;
}

.markdown-body li > ul,
.markdown-body li > ol {
  margin-bottom: 0;
}

/* Task list (checkboxes) */
.markdown-body input[type='checkbox'] {
  margin-right: 0.375rem;
}

/* Blockquotes */
.markdown-body blockquote {
  margin: 0 0 0.875rem;
  padding: 0.5rem 1rem;
  border-left: 3px solid var(--primary);
  background: color-mix(in srgb, var(--primary) 8%, transparent);
  border-radius: 0 0.375rem 0.375rem 0;
}

.markdown-body blockquote p:last-child {
  margin-bottom: 0;
}

/* Inline code */
.markdown-body code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.85em;
  padding: 0.15em 0.4em;
  border-radius: 0.25rem;
  background: var(--muted);
  color: var(--foreground);
}

/* Code blocks */
.markdown-body pre {
  margin: 0 0 0.875rem;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  background: var(--muted);
  border: 1px solid var(--border);
  position: relative;
}

.markdown-body pre code {
  padding: 0;
  background: none;
  border-radius: 0;
  font-size: 0.8125rem;
  line-height: 1.6;
  tab-size: 2;
}

/* Tables */
.markdown-body table {
  width: 100%;
  margin: 0 0 0.875rem;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.markdown-body th,
.markdown-body td {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  text-align: left;
}

.markdown-body th {
  background: var(--muted);
  font-weight: 600;
}

.markdown-body tr:nth-child(even) {
  background: color-mix(in srgb, var(--muted) 50%, transparent);
}

/* Horizontal rules */
.markdown-body hr {
  margin: 1.5rem 0;
  border: none;
  border-top: 1px solid var(--border);
}

/* Images */
.markdown-body img {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
}

/* Strong / Bold */
.markdown-body strong {
  font-weight: 700;
}

/* Highlight.js token colors for light mode (overrides github.css where needed) */
.markdown-body .hljs {
  background: transparent;
  color: inherit;
}

/* Task list styling */
.markdown-body ul li:has(input[type='checkbox']) {
  list-style: none;
  margin-left: -1.5rem;
}

/* Mermaid / math / other fenced content placeholder */
.markdown-body .language-mermaid {
  text-align: center;
}

/* Dark mode: override highlight.js tokens (github-dark color scheme) */
.dark .markdown-body pre {
  background: #151515;
  border-color: #30363d;
}

.dark .markdown-body .hljs {
  background: transparent;
}

.dark .markdown-body .hljs-keyword,
.dark .markdown-body .hljs-selector-tag,
.dark .markdown-body .hljs-literal,
.dark .markdown-body .hljs-section,
.dark .markdown-body .hljs-link {
  color: #f97583;
}

.dark .markdown-body .hljs-string,
.dark .markdown-body .hljs-addition,
.dark .markdown-body .hljs-attribute,
.dark .markdown-body .hljs-template-variable,
.dark .markdown-body .hljs-bullet {
  color: #9ecbff;
}

.dark .markdown-body .hljs-number,
.dark .markdown-body .hljs-built_in,
.dark .markdown-body .hljs-type,
.dark .markdown-body .hljs-params {
  color: #79b8ff;
}

.dark .markdown-body .hljs-comment,
.dark .markdown-body .hljs-deletion,
.dark .markdown-body .hljs-meta {
  color: #6a737d;
}

.dark .markdown-body .hljs-title,
.dark .markdown-body .hljs-function,
.dark .markdown-body .hljs-selector-id,
.dark .markdown-body .hljs-selector-class {
  color: #b392f0;
}

.dark .markdown-body .hljs-variable,
.dark .markdown-body .hljs-attr {
  color: #ffab70;
}

.dark .markdown-body .hljs-tag,
.dark .markdown-body .hljs-name {
  color: #85e89d;
}
</style>
