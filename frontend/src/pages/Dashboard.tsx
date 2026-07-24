import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchHistory, deleteAuditRecord } from '../api/historyClient';
import { AuditReport } from '../api/auditClient';
import HistoryTable from '../components/HistoryTable';
import TrendChart from '../components/TrendChart';
import ReportCard from '../components/ReportCard';
import ErrorBanner from '../components/ErrorBanner';
import Loader from '../components/Loader';
import { History, LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<AuditReport | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchHistory(1, 50);
      setAudits(response.data);
    } catch (err: any) {
      setError({
        code: err.code || 'ERROR',
        message: err.message || 'Failed to load audit history.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await deleteAuditRecord(id);
      setAudits((prev) => prev.filter((item) => item.id !== id));
      if (selectedAudit && selectedAudit.id === id) {
        setSelectedAudit(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete record.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LayoutDashboard style={{ color: '#6366f1' }} /> Audit Dashboard
          </h1>
          <p style={{ color: '#9ca3af', marginTop: '0.25rem' }}>
            Welcome back, <strong style={{ color: '#fff' }}>{user?.email}</strong>. Track your saved website health scans.
          </p>
        </div>
      </div>

      {error && <ErrorBanner code={error.code} message={error.message} />}

      {loading ? (
        <Loader label="Fetching saved audit logs..." />
      ) : (
        <>
          <TrendChart audits={audits} />

          <div className="glass-card" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={20} style={{ color: '#06b6d4' }} /> Saved Scan History ({audits.length})
            </h3>
            <HistoryTable
              audits={audits}
              onDelete={handleDelete}
              onSelect={(audit) => setSelectedAudit(audit)}
            />
          </div>

          {selectedAudit && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Inspecting Saved Audit Report</h3>
                <button className="btn-secondary" onClick={() => setSelectedAudit(null)}>Close Inspection</button>
              </div>
              <ReportCard report={selectedAudit} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
