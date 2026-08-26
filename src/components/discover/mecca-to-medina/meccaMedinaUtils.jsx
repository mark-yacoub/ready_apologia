import React from 'react';
import { getQuranUrl } from '../../../utils/urlFactory.js';

export function parseQuranRef(refStr, base = '') {
  if (!refStr) return null;
  // Format: "quran/109/6" or "quran/22/39-40"
  const parts = String(refStr).replace(/^quran\//, '').split('/');
  if (parts.length >= 2) {
    const surah = parts[0];
    const ayah = parts[1];
    return getQuranUrl({ surah, ayah, base });
  }
  return null;
}

export function parseTafsirRef(refStr, base = '') {
  if (!refStr) return null;
  // Format: "ibnkathir/4/77" or "tabari/2/106"
  const parts = String(refStr).split('/');
  if (parts.length >= 3) {
    const scholarKey = parts[0].toLowerCase();
    const surah = parts[1];
    const ayah = parts[2];
    const tabName = (scholarKey.includes('ibn') || scholarKey.includes('kathir'))
      ? 'tafsir/ibn_kathir'
      : 'tafsir/tabari';
    return getQuranUrl({ surah, ayah, tab: tabName, base });
  }
  return null;
}

/**
 * Parses inline markdown: [link](url), **bold**, __bold__, *italics*, _italics_, and {quran brackets}.
 */
export function renderInlineFormatting(str) {
  if (!str) return null;
  const tokens = String(str).split(/(\[.+?\]\(https?:\/\/[^\s)]+\)|\*\*[\s\S]*?\*\*|__[\s\S]*?__|\*[^*]+?\*|_[^_]+?_|\{[^}]+\})/g);
  return tokens.map((token, idx) => {
    if (!token) return null;
    // Markdown link: [text](url)
    if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const match = token.match(/^\[([\s\S]+?)\]\((https?:\/\/[^\s)]+)\)$/);
      if (match) {
        return (
          <a
            key={idx}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="mm-md-link"
          >
            {renderInlineFormatting(match[1])}
          </a>
        );
      }
    }
    // Bold: **text** or __text__
    if ((token.startsWith('**') && token.endsWith('**') && token.length >= 4) ||
        (token.startsWith('__') && token.endsWith('__') && token.length >= 4)) {
      const inner = token.slice(2, -2);
      return (
        <strong key={idx} className="mm-bold">
          {renderInlineFormatting(inner)}
        </strong>
      );
    }
    // Italic: *text* or _text_
    if ((token.startsWith('*') && token.endsWith('*') && token.length >= 2) ||
        (token.startsWith('_') && token.endsWith('_') && token.length >= 2)) {
      const inner = token.slice(1, -1);
      return (
        <em key={idx} className="mm-em">
          {renderInlineFormatting(inner)}
        </em>
      );
    }
    // Quran bracket: {text}
    if (token.startsWith('{') && token.endsWith('}') && token.length >= 2) {
      return (
        <span key={idx} className="mm-quran-bracket">
          {token}
        </span>
      );
    }
    // Plain text: auto-link parenthetical Quran verse citations e.g. (109:6), (9:5, 9:29)
    return parseInlineVerseLinks(token, idx);
  });
}

/**
 * Auto-links parenthetical verse references like (109:6), (9:5, 9:29), (22:39–40).
 */
export function parseInlineVerseLinks(text, keyPrefix = 0, base = '') {
  if (!text || typeof text !== 'string') return text;
  const regex = /(\((?:(?:Surah\s+)?[1-9]\d{0,2}:[1-9]\d{0,2}(?:[–-]\d{1,3})?(?:,\s*|\s*•\s*)?)+\))/g;
  const parts = text.split(regex);
  if (parts.length === 1) return text;

  return parts.map((part, pIdx) => {
    if (part.startsWith('(') && part.endsWith(')')) {
      const inner = part.slice(1, -1);
      const subItems = inner.split(/,\s*/);
      return (
        <React.Fragment key={`${keyPrefix}-p-${pIdx}`}>
          (
          {subItems.map((item, iIdx) => {
            const match = item.match(/^(?:Surah\s+)?([1-9]\d{0,2}):([1-9]\d{0,2}(?:[–-]\d{1,3})?)$/);
            if (match) {
              const surah = match[1];
              const ayahRaw = match[2];
              const ayahStart = ayahRaw.split(/[–-]/)[0];
              const url = getQuranUrl({ surah, ayah: ayahStart, base });
              return (
                <React.Fragment key={iIdx}>
                  <a
                    href={url}
                    className="mm-inline-verse-link"
                    title={`Open Surah ${surah}:${ayahRaw} in Quran Reader`}
                  >
                    {item}
                  </a>
                  {iIdx < subItems.length - 1 && ', '}
                </React.Fragment>
              );
            }
            return item;
          })}
          )
        </React.Fragment>
      );
    }
    return part;
  });
}

/**
 * Parses full block-level markdown: blockquotes (>), lists, paragraphs, and inline markdown.
 */
export function renderFormattedMarkdown(text) {
  if (!text) return null;
  const blocks = String(text).trim().split(/\n\n+/);
  return blocks.map((block, bIdx) => {
    const trimmed = block.trim();
    // Blockquote
    if (trimmed.startsWith('> ') || trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s?/gm, '');
      return (
        <blockquote key={bIdx} className="mm-blockquote">
          <p>{renderInlineFormatting(quoteText)}</p>
        </blockquote>
      );
    }
    // List item (e.g. * item or - item or 1. item)
    if (/^([*\-•]|\d+\.)\s/.test(trimmed)) {
      const items = trimmed.split(/\n(?=[*\-•]|\d+\.)/);
      return (
        <ul key={bIdx} className="mm-md-list">
          {items.map((item, iIdx) => {
            const cleanItem = item.replace(/^([*\-•]|\d+\.)\s+/, '');
            return (
              <li key={iIdx} className="mm-md-list-item">
                {renderInlineFormatting(cleanItem)}
              </li>
            );
          })}
        </ul>
      );
    }
    // Multi-line paragraph
    const lines = trimmed.split(/\n/);
    if (lines.length > 1) {
      return (
        <p key={bIdx} className="mm-para">
          {lines.map((line, lIdx) => {
            if (line.startsWith('> ') || line.startsWith('>')) {
              return (
                <span key={lIdx} className="mm-inline-blockquote">
                  {renderInlineFormatting(line.replace(/^>\s?/, ''))}
                  {lIdx < lines.length - 1 && <br />}
                </span>
              );
            }
            return (
              <React.Fragment key={lIdx}>
                {renderInlineFormatting(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            );
          })}
        </p>
      );
    }
    return (
      <p key={bIdx} className="mm-para">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  });
}
