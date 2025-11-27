import React from 'react';
export default function SimpleTable({ title, headers=[], rows=[] }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <table className="nice-table">
        <thead><tr>{headers.map(h=> <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r,i)=> <tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

