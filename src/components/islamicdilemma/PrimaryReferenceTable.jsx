import React from 'react';
import { parseMarkdown } from '../../utils/markdown.js';

export default function PrimaryReferenceTable({ rows = [] }) {
  if (rows.length === 0) return null;

  return (
    <div className="primary-reference-table-wrapper">
      <table className="primary-reference-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Reference</th>
            <th>Summary / Statement</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td className="category-cell" dangerouslySetInnerHTML={{ __html: parseMarkdown(row.Category) }} />
              <td className="ref-cell" dangerouslySetInnerHTML={{ __html: parseMarkdown(row.Reference) }} />
              <td className="summary-cell">
                <span className="mobile-th-label">SUMMARY</span>
                <span dangerouslySetInnerHTML={{ __html: parseMarkdown(row['Literal English Translation Summary / Statement']) }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}