import React, { useEffect, useState } from 'react';
import { fetchDashboard } from '../api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const mockTrend = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  backups: Math.floor(Math.random() * 80) + 20,
  size: Math.floor(Math.random() * 5000) + 1000,
}));

const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{ ...styles.statCard, borderTopColor: color }}>
    <div style={{ ...styles.statIcon, background: color + '18', color }}>{icon}</div>
    <div style={styles.statValue}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
    {sub && <div style={styles.statSub}>{sub}</div>}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await fetchDashboard();
      setStats(res.data.data);
    } catch {
      setError('Cannot connect to backend. Make sure the server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, []);

  if (loading) return <div style={styles.center}><div style={styles.spinner} /></div>;

  if (error) return (
    <div style={styles.errorBox}>
      <div style={styles.errorTitle}>⚠ Connection Error</div>
      <div style={styles.errorMsg}>{error}</div>
    </div>
  );

  const sizeMB = stats?.totalBackupSizeMB || 0;
  const sizeDisplay = sizeMB > 1000 ? `${(sizeMB / 1000).toFixed(1)} GB` : `${sizeMB} MB`;

  return (
    <div>
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.pageTag}>Overview</div>
          <h1 style={styles.pageTitle}>Dashboard</h1>
        </div>
        <button onClick={load} style={styles.refreshBtn}>↻ Refresh</button>
      </div>

      {/* Stat cards */}
      <div style={styles.statsGrid}>
        <StatCard label="Total Servers"     value={stats?.totalServers || 0}     icon="⬡"  color="#4f8eff" sub={`${stats?.onlineServers || 0} online`} />
        <StatCard label="Offline Servers"   value={stats?.offlineServers || 0}   icon="!"  color="#ef4743" />
        <StatCard label="Total Backups"     value={stats?.totalBackups || 0}     icon="◫"  color="#00e5c0" sub={`${stats?.completedBackups || 0} completed`} />
        <StatCard label="Backup Storage"    value={sizeDisplay}                  icon="☁"  color="#f89f1b" />
        <StatCard label="Active Policies"   value={stats?.activePolicies || 0}   icon="◉"  color="#a78bfa" />
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Backup Trend (12 months)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockTrend}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f8eff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4f8eff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#4a6080" fontSize={11} />
              <YAxis stroke="#4a6080" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(99,160,255,0.2)', borderRadius: 0 }} />
              <Area type="monotone" dataKey="backups" stroke="#4f8eff" fill="url(#grad1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Storage Used (MB)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockTrend}>
              <XAxis dataKey="month" stroke="#4a6080" fontSize={11} />
              <YAxis stroke="#4a6080" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(99,160,255,0.2)', borderRadius: 0 }} />
              <Bar dataKey="size" fill="#00e5c0" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent backups */}
      {stats?.recentBackups?.length > 0 && (
        <div style={styles.tableCard}>
          <div style={styles.chartTitle}>Recent Backups</div>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Server', 'Type', 'Size', 'Duration', 'Completed'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentBackups.map(b => (
                <tr key={b._id} style={styles.tr}>
                  <td style={styles.td}>{b.serverName}</td>
                  <td style={styles.td}><span style={styles.badge}>{b.type}</span></td>
                  <td style={styles.td}>{b.size > 1000 ? `${(b.size/1000).toFixed(1)} GB` : `${b.size} MB`}</td>
                  <td style={styles.td}>{b.duration}s</td>
                  <td style={styles.td}>{new Date(b.completedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' },
  spinner: { width: '36px', height: '36px', border: '3px solid rgba(79,142,255,0.2)', borderTopColor: '#4f8eff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' },
  pageTag: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#00e5c0', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' },
  pageTitle: { fontWeight: '700', fontSize: '1.8rem', color: '#e8eeff', margin: 0 },
  refreshBtn: { background: 'rgba(79,142,255,0.1)', border: '1px solid rgba(79,142,255,0.2)', color: '#4f8eff', padding: '8px 18px', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', letterSpacing: '0.05em' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '28px' },
  statCard: { background: '#0d1526', border: '1px solid rgba(99,160,255,0.1)', borderTop: '2px solid', padding: '20px', position: 'relative' },
  statIcon: { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', marginBottom: '12px' },
  statValue: { fontWeight: '700', fontSize: '1.8rem', color: '#e8eeff', lineHeight: 1, marginBottom: '6px' },
  statLabel: { fontSize: '0.75rem', color: '#4a6080', letterSpacing: '0.05em' },
  statSub: { fontSize: '0.68rem', color: '#8da3c9', marginTop: '4px', fontFamily: "'JetBrains Mono', monospace" },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' },
  chartCard: { background: '#0d1526', border: '1px solid rgba(99,160,255,0.1)', padding: '24px' },
  chartTitle: { fontSize: '0.8rem', color: '#8da3c9', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px', fontFamily: "'JetBrains Mono', monospace" },
  tableCard: { background: '#0d1526', border: '1px solid rgba(99,160,255,0.1)', padding: '24px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: '0.68rem', color: '#4a6080', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(99,160,255,0.08)', fontFamily: "'JetBrains Mono', monospace" },
  tr: { borderBottom: '1px solid rgba(99,160,255,0.05)' },
  td: { padding: '12px', fontSize: '0.85rem', color: '#8da3c9' },
  badge: { background: 'rgba(79,142,255,0.1)', color: '#4f8eff', padding: '3px 10px', fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' },
  errorBox: { background: 'rgba(239,71,67,0.08)', border: '1px solid rgba(239,71,67,0.25)', padding: '32px', maxWidth: '560px', margin: '80px auto' },
  errorTitle: { color: '#ef4743', fontWeight: '600', fontSize: '1rem', marginBottom: '12px' },
  errorMsg: { color: '#8da3c9', fontSize: '0.85rem', lineHeight: 1.6 },
};

export default Dashboard;