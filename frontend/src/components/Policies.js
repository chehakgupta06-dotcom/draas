import React, { useEffect, useState } from 'react';
import { fetchPolicies, createPolicy, deletePolicy, updatePolicy } from '../api';

const defaultForm = {
  name: '', description: '', rto: 60, rpo: 30,
  backupFrequency: 'daily', retentionDays: 30,
  backupType: 'incremental', replicationEnabled: true,
  replicationRegions: [], encryptionEnabled: true, isActive: true,
};

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try { const r = await fetchPolicies(); setPolicies(r.data.data); }
    catch { setMsg('Failed to load policies'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.rto || !form.rpo) return setMsg('Name, RTO and RPO are required');
    setSaving(true);
    try {
      await createPolicy(form);
      setMsg('Policy created');
      setForm(defaultForm);
      setShowForm(false);
      load();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to create policy');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this policy?')) return;
    try { await deletePolicy(id); setMsg('Policy deleted'); load(); }
    catch { setMsg('Failed to delete'); }
  };

  const handleToggle = async (policy) => {
    try { await updatePolicy(policy._id, { isActive: !policy.isActive }); load(); }
    catch { setMsg('Failed to update'); }
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <div style={styles.tag}>Governance</div>
          <h1 style={styles.title}>Recovery Policies</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? '✕ Cancel' : '+ New Policy'}
        </button>
      </div>

      {msg && <div style={styles.msgBox} onClick={() => setMsg('')}>{msg} &nbsp; ✕</div>}

      {/* Form */}
      {showForm && (
        <div style={styles.formCard}>
          <div style={styles.formTitle}>Create Recovery Policy</div>
          <div style={styles.formGrid}>
            <div style={styles.formField}>
              <label style={styles.label}>Policy Name *</label>
              <input style={styles.input} placeholder="e.g. Critical Systems Policy" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Description</label>
              <input style={styles.input} placeholder="Brief description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>RTO (minutes) *</label>
              <input style={styles.input} type="number" value={form.rto} onChange={e => setForm({ ...form, rto: +e.target.value })} />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>RPO (minutes) *</label>
              <input style={styles.input} type="number" value={form.rpo} onChange={e => setForm({ ...form, rpo: +e.target.value })} />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Backup Frequency</label>
              <select style={styles.input} value={form.backupFrequency} onChange={e => setForm({ ...form, backupFrequency: e.target.value })}>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Retention (days)</label>
              <input style={styles.input} type="number" value={form.retentionDays} onChange={e => setForm({ ...form, retentionDays: +e.target.value })} />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Backup Type</label>
              <select style={styles.input} value={form.backupType} onChange={e => setForm({ ...form, backupType: e.target.value })}>
                <option value="full">Full</option>
                <option value="incremental">Incremental</option>
                <option value="differential">Differential</option>
              </select>
            </div>
          </div>
          <div style={styles.checkRow}>
            <label style={styles.checkLabel}>
              <input type="checkbox" checked={form.replicationEnabled} onChange={e => setForm({ ...form, replicationEnabled: e.target.checked })} />
              &nbsp; Enable Replication
            </label>
            <label style={styles.checkLabel}>
              <input type="checkbox" checked={form.encryptionEnabled} onChange={e => setForm({ ...form, encryptionEnabled: e.target.checked })} />
              &nbsp; Enable Encryption
            </label>
          </div>
          <button onClick={handleSubmit} disabled={saving} style={styles.submitBtn}>
            {saving ? 'Creating…' : 'Create Policy'}
          </button>
        </div>
      )}

      {/* Policy cards */}
      {loading ? <div style={styles.loading}>Loading policies…</div> : (
        policies.length === 0
          ? <div style={styles.empty}>No policies defined yet. Create your first policy above.</div>
          : <div style={styles.grid}>
              {policies.map(p => (
                <div key={p._id} style={{ ...styles.card, opacity: p.isActive ? 1 : 0.6 }}>
                  <div style={styles.cardHeader}>
                    <div style={styles.policyName}>{p.name}</div>
                    <span style={{ ...styles.activeBadge, background: p.isActive ? 'rgba(40,200,64,0.12)' : 'rgba(239,71,67,0.12)', color: p.isActive ? '#28c840' : '#ef4743' }}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {p.description && <div style={styles.policyDesc}>{p.description}</div>}

                  <div style={styles.metricsGrid}>
                    <div style={styles.metricBox}>
                      <div style={styles.metricVal}>{p.rto}m</div>
                      <div style={styles.metricLabel}>RTO</div>
                    </div>
                    <div style={styles.metricBox}>
                      <div style={styles.metricVal}>{p.rpo}m</div>
                      <div style={styles.metricLabel}>RPO</div>
                    </div>
                    <div style={styles.metricBox}>
                      <div style={styles.metricVal}>{p.retentionDays}d</div>
                      <div style={styles.metricLabel}>Retention</div>
                    </div>
                  </div>

                  <div style={styles.tags}>
                    {[p.backupFrequency, p.backupType, p.replicationEnabled && 'replicated', p.encryptionEnabled && 'encrypted'].filter(Boolean).map(t => (
                      <span key={t} style={styles.tag2}>{t}</span>
                    ))}
                  </div>

                  <div style={styles.actions}>
                    <button onClick={() => handleToggle(p)} style={styles.actionBtn}>
                      {p.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(p._id)} style={{ ...styles.actionBtn, color: '#ef4743' }}>Delete</button>
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
  formTitle: { fontWeight: '600', fontSize: '0.9rem', color: '#e8eeff', marginBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  formField: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.68rem', color: '#4a6080', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace" },
  input: { background: '#111d33', border: '1px solid rgba(99,160,255,0.15)', color: '#e8eeff', padding: '10px 14px', fontSize: '0.85rem', outline: 'none', fontFamily: "'Inter',sans-serif" },
  checkRow: { display: 'flex', gap: '24px', marginBottom: '20px' },
  checkLabel: { fontSize: '0.85rem', color: '#8da3c9', cursor: 'pointer' },
  submitBtn: { background: '#4f8eff', border: 'none', color: '#fff', padding: '10px 24px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem', fontFamily: "'Inter',sans-serif" },
  loading: { color: '#4a6080', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.82rem', padding: '40px 0' },
  empty: { color: '#4a6080', fontSize: '0.9rem', padding: '60px 0', textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { background: '#0d1526', border: '1px solid rgba(99,160,255,0.1)', padding: '24px', transition: 'opacity 0.2s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  policyName: { fontWeight: '600', fontSize: '1rem', color: '#e8eeff' },
  activeBadge: { padding: '3px 10px', fontSize: '0.65rem', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono',monospace" },
  policyDesc: { fontSize: '0.82rem', color: '#4a6080', marginBottom: '16px', lineHeight: 1.5 },
  metricsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' },
  metricBox: { background: '#111d33', padding: '12px', textAlign: 'center' },
  metricVal: { fontWeight: '700', fontSize: '1.1rem', color: '#4f8eff', fontFamily: "'JetBrains Mono',monospace" },
  metricLabel: { fontSize: '0.62rem', color: '#4a6080', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' },
  tag2: { background: 'rgba(79,142,255,0.08)', color: '#4f8eff', padding: '3px 10px', fontSize: '0.65rem', fontFamily: "'JetBrains Mono',monospace", border: '1px solid rgba(79,142,255,0.15)' },
  actions: { display: 'flex', gap: '8px', borderTop: '1px solid rgba(99,160,255,0.08)', paddingTop: '14px' },
  actionBtn: { background: 'rgba(79,142,255,0.08)', border: '1px solid rgba(79,142,255,0.15)', color: '#4f8eff', padding: '7px 14px', cursor: 'pointer', fontSize: '0.72rem', fontFamily: "'JetBrains Mono',monospace" },
};

export default Policies;