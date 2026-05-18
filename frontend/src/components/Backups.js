import React, { useEffect, useState } from 'react';
import { fetchBackups, fetchServers, triggerBackup, deleteBackup } from '../api';

const STATUS_COLOR = { completed: '#28c840', failed: '#ef4743', 'in-progress': '#4f8eff', pending: '#f89f1b' };

const Backups = () => {
  const [backups, setBackups] = useState([]);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState('');
  const [backupType, setBackupType] = useState('full');
  const [triggering, setTriggering] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const [bRes, sRes] = await Promise.all([fetchBackups(), fetchServers()]);
      setBackups(bRes.data.data);
      setServers(sRes.data.data);
    } catch { setMsg('Failed to load backups'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t); }, []);

  const handleTrigger = async () => {
    if (!selectedServer) return setMsg('Please select a server');
    setTriggering(true);
    try {
      await triggerBackup({ serverId: selectedServer, type: backupType });
      setMsg('Backup initiated! It will complete in a few seconds.');
      setTimeout(load, 3500);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to trigger backup');
    } finally { setTriggering(false); }
  };

  const handleDelete = async (id) => {
    try { await deleteBackup(id); setMsg('Backup record deleted'); load(); }
    catch { setMsg('Failed to delete'); }
  };

  const formatSize = (mb) => mb > 1000 ? `${(mb / 1000).toFixed(2)} GB` : `${mb} MB`;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <div style={styles.tag}>Data Protection</div>
          <h1 style={styles.title}>Backups</h1>
        </div>
      </div>

      {msg && <div style={styles.msgBox} onClick={() => setMsg('')}>{msg} &nbsp; ✕</div>}

      {/* Trigger backup */}
      <div style={styles.triggerCard}>
        <div style={styles.cardTitle}>Trigger Manual Backup</div>
        <div style={styles.triggerRow}>
          <div style={styles.field}>
            <label style={styles.label}>Select Server</label>
            <select style={styles.input} value={selectedServer} onChange={e => setSelectedServer(e.target.value)}>
              <option value="">-- Choose a server --</option>
              {servers.map(s => <option key={s._id} value={s._id}>{s.name} ({s.ipAddress})</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Backup Type</label>
            <select style={styles.input} value={backupType} onChange={e => setBackupType(e.target.value)}>
              <option value="full">Full</option>
              <option value="incremental">Incremental</option>
              <option value="differential">Differential</option>
            </select>
          </div>
          <button onClick={handleTrigger} disabled={triggering} style={styles.triggerBtn}>
            {triggering ? 'Triggering…' : '▶ Run Backup'}
          </button>
        </div>
      </div>

      {/* Backups table */}
      {loading ? <div style={styles.loading}>Loading backups…</div> : (
        backups.length === 0
          ? <div style={styles.empty}>No backups yet. Trigger a backup above to get started.</div>
          : (
            <div style={styles.tableCard}>
              <div style={styles.cardTitle}>Backup History ({backups.length})</div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Server', 'Type', 'Status', 'Size', 'Duration', 'Location', 'Created', ''].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {backups.map(b => (
                    <tr key={b._id} style={styles.tr}>
                      <td style={styles.td}>{b.serverName}</td>
                      <td style={styles.td}><span style={styles.typeBadge}>{b.type}</span></td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusBadge, background: STATUS_COLOR[b.status] + '18', color: STATUS_COLOR[b.status] }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={styles.td}>{b.size ? formatSize(b.size) : '—'}</td>
                      <td style={styles.td}>{b.duration ? `${b.duration}s` : '—'}</td>
                      <td style={{ ...styles.td, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.location}</td>
                      <td style={styles.td}>{new Date(b.createdAt).toLocaleString()}</td>
                      <td style={styles.td}>
                        <button onClick={() => handleDelete(b._id)} style={styles.deleteBtn}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' },
  tag: { fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem', color: '#00e5c0', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' },
  title: { fontWeight: '700', fontSize: '1.8rem', color: '#e8eeff', margin: 0 },
  msgBox: { background: 'rgba(79,142,255,0.1)', border: '1px solid rgba(79,142,255,0.25)', color: '#8da3c9', padding: '12px 16px', marginBottom: '20px', fontSize: '0.82rem', cursor: 'pointer' },
  triggerCard: { background: '#0d1526', border: '1px solid rgba(99,160,255,0.15)', padding: '28px', marginBottom: '24px' },
  cardTitle: { fontWeight: '600', fontSize: '0.82rem', color: '#8da3c9', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace", marginBottom: '20px' },
  triggerRow: { display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '220px' },
  label: { fontSize: '0.68rem', color: '#4a6080', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace" },
  input: { background: '#111d33', border: '1px solid rgba(99,160,255,0.15)', color: '#e8eeff', padding: '10px 14px', fontSize: '0.85rem', outline: 'none', fontFamily: "'Inter',sans-serif" },
  triggerBtn: { background: '#4f8eff', border: 'none', color: '#fff', padding: '10px 24px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem', whiteSpace: 'nowrap', fontFamily: "'Inter',sans-serif", alignSelf: 'flex-end' },
  loading: { color: '#4a6080', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.82rem', padding: '40px 0' },
  empty: { color: '#4a6080', fontSize: '0.9rem', padding: '60px 0', textAlign: 'center' },
  tableCard: { background: '#0d1526', border: '1px solid rgba(99,160,255,0.1)', padding: '24px', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: '0.65rem', color: '#4a6080', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(99,160,255,0.08)', fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid rgba(99,160,255,0.05)' },
  td: { padding: '12px', fontSize: '0.82rem', color: '#8da3c9', whiteSpace: 'nowrap' },
  typeBadge: { background: 'rgba(79,142,255,0.1)', color: '#4f8eff', padding: '3px 8px', fontSize: '0.65rem', fontFamily: "'JetBrains Mono',monospace" },
  statusBadge: { padding: '3px 10px', fontSize: '0.65rem', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono',monospace" },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4743', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.6, padding: '4px 8px' },
};

export default Backups;