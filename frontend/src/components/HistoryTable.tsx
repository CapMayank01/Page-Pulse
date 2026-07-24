import React, { useState, useEffect } from 'react';
import { AuditReport } from '../api/auditClient';
import { Trash2, ExternalLink } from 'lucide-react';

interface HistoryTableProps {
  audits: AuditReport[];
  onDelete: (id: string) => void;
  onSelect: (audit: AuditReport) => void;
}

export default function HistoryTable({ audits, onDelete, onSelect }: HistoryTableProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmDeleteId) return;
    const timer = setTimeout(() => {
      setConfirmDeleteId(null);
    }, 2000);
    return () => clearTimeout(timer);
  }, [confirmDeleteId]);

  if (audits.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
        No audits yet. Run your first check above to start tracking trends.
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Target URL</th>
            <th>Score</th>
            <th>Grade</th>
            <th>Response Time</th>
            <th>H1 / Alt Issues</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {audits.map((audit) => (
            <tr key={audit.id || audit.url}>
              <td style={{ fontWeight: 600, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <a
                  href={audit.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent-pulse)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {audit.url} <ExternalLink size={14} />
                </a>
              </td>
              <td className="monospace-cell" style={{ fontWeight: 800 }}>{audit.score} / 90</td>
              <td>
                <span className={`grade-badge grade-${audit.grade}`} style={{ fontSize: '0.8rem', padding: '0.15rem 0.5rem' }}>
                  {audit.grade}
                </span>
              </td>
              <td className="monospace-cell">{audit.responseTime} ms</td>
              <td>
                H1: {audit.h1Count} | Missing Alt: {audit.missingAltImages}
              </td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {audit.id ? new Date().toLocaleDateString() : 'Recent'}
              </td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => onSelect(audit)}
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                  >
                    View
                  </button>
                  {audit.id && (
                    confirmDeleteId === audit.id ? (
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          onDelete(audit.id!);
                          setConfirmDeleteId(null);
                        }}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#fff', borderColor: 'var(--grade-f)', background: 'rgba(239, 68, 68, 0.15)' }}
                        title="Confirm permanent deletion"
                      >
                        Confirm?
                      </button>
                    ) : (
                      <button
                        className="btn-secondary"
                        onClick={() => setConfirmDeleteId(audit.id!)}
                        style={{ padding: '0.35rem 0.65rem', color: 'var(--grade-f)', borderColor: 'rgba(239, 68, 68, 0.25)' }}
                        title="Delete record"
                      >
                        <Trash2 size={14} />
                      </button>
                    )
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
