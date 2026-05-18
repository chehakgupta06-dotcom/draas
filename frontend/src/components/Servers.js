import React, { useEffect, useState } from 'react';
import { fetchServers, createServer, deleteServer, updateServer, triggerBackup } from '../api';

const STATUS_COLOR = { online: '#28c840', offline: '#ef4743', degraded: '#f89f1b', recovering: '#4f8eff' };

const MetricBar = ({ value, color }) => (
  <div style={{ background: '#111d33', height: '4px', borderRadius: '99px', overflow: 'hidden', marginTop: '4px' }}>
    <div style={{ width: `${value}%`, height: '100%', background: value > 85 ? '#ef4743' : value > 70 ? '#f89f1b' : color, borderRadius: '99px', transition: 'width 0.5s' }} />
  </div>
);

const defaultForm = { name: '', ipAddress: '', location: '', type: 'primary', cpu: 20, memory: 30, disk: 15 };

const Servers = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try { const r = await fetchServers(); setServers(r.data.data); }
    catch { setMsg('Failed to load servers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.ipAddress || !form.location) return setMsg('Please fill all required fields');
    setSaving(true);
    try {
      await createServer(form);
      setMsg('Server added successfully');
      setForm(defaultForm);
      setShowForm(false);
      load();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to add server');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this server and all its backups?')) return;
    try { await deleteServer(id); setMsg('Server deleted'); load(); }
    catch { setMsg('Failed to delete'); }
  };

  const handleBackup = async (serverId) => {
    try { await triggerBackup({ serverId, type: 'full' }); setMsg('Backup initiated!'); }
    catch { setMsg('Failed to trigger backup'); }
  };

  const handleToggle = async (server) => {
    const newStatus = server.status === 'online' ? 'offline' : 'online';
    try { await updateServer(server._id, { status: newStatus }); load(); }
    catch { setMsg('Failed to update'); }
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <div style={styles.tag}>Infrastructure</div>
          <h1 style={styles.title}>Servers</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? '✕ Cancel' : '+ Add Server'}
        </button>
      </div>

      {msg && <div style={styles.msgBox} onClick={() => setMsg('')}>{msg} &nbsp; ✕</div>}

      {/* Add Server Form */}
      {showForm && (
        <div style={styles.formCard}>
          <div style={styles.formTitle}>Register New Server</div>
          <div style={styles.formGrid}>
            {[
              { key: 'name', label: 'Server Name *', placeholder: 'e.g. Production DB' },
              { key: 'ipAddress', label: 'IP Address *', placeholder: 'e.g. 192.168.1.10' },
              { key: 'location', label: 'Location *', placeholder: 'e.g. us-east-1' },
            ].map(f => (
              <div key={f.key} style={styles.formField}>
                <label style={styles.label}>{f.label}</label>
                <input
                  style={styles.input}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <div style={styles.formField}>
              <label style={styles.label}>Type</label>
              <select style={styles.input} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="backup">Backup</option>
              </select>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={saving} style={styles.submitBtn}>
            {saving ? 'Adding...' : 'Add Server'}
          </button>
        </div>
      )}

      {/* Server cards */}
      {loading ? <div style={styles.loading}>Loading servers…</div> : (
        servers.length === 0
          ? <div style={styles.empty}>No servers registered yet. Add your first server above.</div>
          : <div style={styles.grid}>
              {servers.map(server => (
                <div key={server._id} style={{ ...styles.card, borderTopColor: STATUS_COLOR[server.status] }}>
                  <div style={styles.cardHeader}>
                    <div>
                      <div style={styles.serverName}>{server.name}</div>
                      <div style={styles.serverIp}>{server.ipAddress} · {server.location}</div>
                    </div>
                    <div style={{ ...styles.statusBadge, background: STATUS_COLOR[server.status] + '20', color: STATUS_COLOR[server.status] }}>
                      {server.status}
                    </div>
                  </div>

                  <div style={styles.metricsGrid}>
                    {[
                      { label: 'CPU', value: server.cpu },
                      { label: 'RAM', value: server.memory },
                      { label: 'Disk', value: server.disk },
                    ].map(m => (
                      <div key={m.label}>
                        <div style={styles.metricLabel}>
                          {m.label} <span style={styles.metricVal}>{m.value?.toFixed(1)}%</span>
                        </div>
                        <MetricBar value={m.value} color="#4f8eff" />
                      </div>
                    ))}
                  </div>

                  <div style={styles.cardMeta}>
                    <span>Type: {server.type}</span>
                    {server.recoveryPoint && (
                      <span>Last backup: {new Date(server.recoveryPoint).toLocaleDateString()}</span>
                    )}
                  </div>

                  <div style={styles.cardActions}>
                    <button onClick={() => handleBackup(server._id)} style={styles.actionBtn}>Backup</button>
                    <button onClick={() => handleToggle(server)} style={{ ...styles.actionBtn, color: server.status === 'online' ? '#ef4743' : '#28c840' }}>
                      {server.status === 'online' ? 'Take Offline' : 'Bring Online'}
                    </button>
                    <button onClick={() => handleDelete(server._id)} style={{ ...styles.actionBtn, color: '#ef4743' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
      )}
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' },
  tag: { fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem', color: '#00e5c0', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' },
  title: { fontWeight: '700', fontSize: '1.8rem', color: '#e8eeff', margin: 0 },
  addBtn: { background: '#4f8eff', border: 'none', color: '#fff', padding: '10px 22px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem', fontFamily: "'Inter',sans-serif" },
  msgBox: { background: 'rgba(79,142,255,0.1)', border: '1px solid rgba(79,142,255,0.25)', color: '#8da3c9', padding: '12px 16px', marginBottom: '20px', fontSize: '0.82rem', cursor: 'pointer' },
  formCard: { background: '#0d1526', border: '1px solid rgba(99,160,255,0.15)', padding: '28px', marginBottom: '28px' },
  formTitle: { fontWeight: '600', fontSize: '0.9rem', color: '#e8eeff', marginBottom: '20px', letterSpacing: '0.03em' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  formField: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.72rem', color: '#4a6080', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace" },
  input: { background: '#111d33', border: '1px solid rgba(99,160,255,0.15)', color: '#e8eeff', padding: '10px 14px', fontSize: '0.85rem', outline: 'none', fontFamily: "'Inter',sans-serif" },
  submitBtn: { background: '#4f8eff', border: 'none', color: '#fff', padding: '10px 24px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem', fontFamily: "'Inter',sans-serif" },
  loading: { color: '#4a6080', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.82rem', padding: '40px 0' },
  empty: { color: '#4a6080', fontSize: '0.9rem', padding: '60px 0', textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  card: { background: '#0d1526', border: '1px solid rgba(99,160,255,0.1)', borderTop: '2px solid', padding: '24px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  serverName: { fontWeight: '600', fontSize: '1rem', color: '#e8eeff', marginBottom: '4px' },
  serverIp: { fontSize: '0.72rem', color: '#4a6080', fontFamily: "'JetBrains Mono',monospace" },
  statusBadge: { padding: '4px 10px', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace" },
  metricsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' },
  metricLabel: { fontSize: '0.68rem', color: '#4a6080', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace" },
  metricVal: { color: '#8da3c9', fontWeight: '500' },
  cardMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#4a6080', fontFamily: "'JetBrains Mono',monospace", marginBottom: '16px', borderTop: '1px solid rgba(99,160,255,0.06)', paddingTop: '12px' },
  cardActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  actionBtn: { background: 'rgba(79,142,255,0.08)', border: '1px solid rgba(79,142,255,0.15)', color: '#4f8eff', padding: '7px 14px', cursor: 'pointer', fontSize: '0.72rem', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.05em' },
};

export default Servers;