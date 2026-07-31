import React from 'react';
import { parseMarkdown } from '../../utils/markdown.js';

export default function AffirmationTable({ rows = [] }) {
  if (rows.length === 0) return null;

  return (
    <div className="affirmation-table-wrapper">
      <table className="affirmation-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Literal English Translation</th>
            <th>Apologetic Significance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td className="ref-cell" dangerouslySetInnerHTML={{ __html: parseMarkdown(row.Reference) }} />
              <td className="quote-cell">
                <span className="mobile-th-label">TRANSLATION</span>
                <span dangerouslySetInnerHTML={{ __html: parseMarkdown(row['Literal English Translation']) }} />
              </td>
              <td className="significance-cell">
                <span className="mobile-th-label">SIGNIFICANCE</span>
                <span dangerouslySetInnerHTML={{ __html: parseMarkdown(row['Apologetic Significance']) }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}