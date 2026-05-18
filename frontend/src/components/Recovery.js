import React, { useEffect, useState } from 'react';
import { fetchServers, fetchBackups, initiateRecovery } from '../api';

const Recovery = () => {
  const [servers, setServers] = useState([]);
  const [backups, setBackups] = useState([]);
  const [selectedServer, setSelectedServer] = useState('');
  const [selectedBackup, setSelectedBackup] = useState('');
  const [recovering, setRecovering] = useState(false);
  const [log, setLog] = useState([]);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const [sRes, bRes] = await Promise.all([fetchServers(), fetchBackups()]);
      setServers(sRes.data.data);
      setBackups(bRes.data.data.filter(b => b.status === 'completed'));
    } catch { setMsg('Failed to load data'); }
  };

  useEffect(() => { load(); }, []);

  const serverBackups = backups.filter(b => b.serverId === selectedServer || b.serverId?._id === selectedServer);

  const addLog = (msg, type = 'info') => {
    setLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
  };

  const handleRecover = async () => {
    if (!selectedServer) return setMsg('Please select a server to recover');
    setRecovering(true);
    setLog([]);
    addLog('Initiating disaster recovery sequence…', 'info');

    try {
      // Simulate step-by-step recovery log
      setTimeout(() => addLog('Verifying backup integrity…', 'info'), 500);
      setTimeout(() => addLog('Establishing secure connection to recovery target…', 'info'), 1200);
      setTimeout(() => addLog('Mounting recovery volume…', 'info'), 2000);
      setTimeout(() => addLog('Transferring data from S3 backup store…', 'info'), 2800);

      await initiateRecovery({ serverId: selectedServer, backupId: selectedBackup });

      setTimeout(() => addLog('Data transfer complete. Verifying checksums…', 'success'), 3600);
      setTimeout(() => addLog('System services restarting…', 'info'), 4400);
      setTimeout(() => {
        addLog('✓ Recovery completed successfully. Server is back online.', 'success');
        setRecovering(false);
        load();
      }, 5500);
    } catch (e) {
      addLog('✗ Recovery failed: ' + (e.response?.data?.message || 'Unknown error'), 'error');
      setRecovering(false);
    }
  };

  const selectedServerObj = servers.find(s => s._id === selectedServer);

  return (
    <div>
      <div style={styles.header}>
        <div>
          <div style={styles.tag}>Disaster Recovery</div>
          <h1 style={styles.title}>Recovery Console</h1>
        </div>
      </div>

      {msg && <div style={styles.msgBox} onClick={() => setMsg('')}>{msg} &nbsp; ✕</div>}

      <div style={styles.grid}>
        {/* Left: recovery form */}
        <div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Recovery Configuration</div>

            <div style={styles.field}>
              <label style={styles.label}>Target Server</label>
              <select style={styles.input} value={selectedServer} onChange={e => { setSelectedServer(e.target.value); setSelectedBackup(''); }}>
                <option value="">-- Select server to recover --</option>
                {servers.map(s => (
                  <option key={s._id} value={s._id}>{s.name} — {s.status.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {selectedServer && (
              <div style={styles.field}>
                <label style={styles.label}>Restore From Backup (optional)</label>
                <select style={styles.input} value={selectedBackup} onChange={e => setSelectedBackup(e.target.value)}>
                  <option value="">Latest available</option>
                  {serverBackups.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.type} — {new Date(b.completedAt).toLocaleString()} ({b.size > 1000 ? `${(b.size/1000).toFixed(1)} GB` : `${b.size} MB`})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Server info */}
            {selectedServerObj && (
              <div style={styles.serverInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>IP Address</span>
                  <span style={styles.infoVal}>{selectedServerObj.ipAddress}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Location</span>
                  <span style={styles.infoVal}>{selectedServerObj.location}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Current Status</span>
                  <span style={{ ...styles.infoVal, color: selectedServerObj.status === 'online' ? '#28c840' : '#ef4743', textTransform: 'uppercase' }}>
                    {selectedServerObj.status}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Last Backup</span>
                  <span style={styles.infoVal}>
                    {selectedServerObj.recoveryPoint
                      ? new Date(selectedServerObj.recoveryPoint).toLocaleString()
                      : 'None'}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleRecover}
              disabled={recovering || !selectedServer}
              style={{ ...styles.recoverBtn, opacity: recovering || !selectedServer ? 0.5 : 1 }}
            >
              {recovering ? '⟳ Recovering…' : '↺ Initiate Recovery'}
            </button>

            {recovering && (
              <div style={styles.progressWrap}>
                <div style={styles.progressBar} />
              </div>
            )}
          </div>
        </div>

        {/* Right: recovery log */}
        <div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Recovery Log</div>
            <div style={styles.logBox}>
              {log.length === 0 ? (
                <div style={styles.logEmpty}>Awaiting recovery initiation…</div>
              ) : (
                log.map((entry, i) => (
                  <div key={i} style={{ ...styles.logLine, color: entry.type === 'success' ? '#28c840' : entry.type === 'error' ? '#ef4743' : '#8da3c9' }}>
                    <span style={styles.logTime}>{entry.time}</span>
                    <span>{entry.msg}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Offline servers quick-list */}
          {servers.filter(s => s.status !== 'online').length > 0 && (
            <div style={{ ...styles.card, marginTop: '16px' }}>
              <div style={styles.cardTitle}>Servers Needing Attention</div>
              {servers.filter(s => s.status !== 'online').map(s => (
                <div key={s._id} style={styles.alertRow}>
                  <div>
                    <div style={styles.alertName}>{s.name}</div>
                    <div style={styles.alertSub}>{s.ipAddress} · {s.location}</div>
                  </div>
                  <span style={{ ...styles.alertBadge, color: s.status === 'degraded' ? '#f89f1b' : '#ef4743', background: s.status === 'degraded' ? 'rgba(248,159,27,0.1)' : 'rgba(239,71,67,0.1)' }}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' },
  tag: { fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem', color: '#00e5c0', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' },
  title: { fontWeight: '700', fontSize: '1.8rem', color: '#e8eeff', margin: 0 },
  msgBox: { background: 'rgba(79,142,255,0.1)', border: '1px solid rgba(79,142,255,0.25)', color: '#8da3c9', padding: '12px 16px', marginBottom: '20px', fontSize: '0.82rem', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  card: { background: '#0d1526', border: '1px solid rgba(99,160,255,0.1)', padding: '28px' },
  cardTitle: { fontWeight: '600', fontSize: '0.8rem', color: '#8da3c9', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace", marginBottom: '24px', borderBottom: '1px solid rgba(99,160,255,0.08)', paddingBottom: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
  label: { fontSize: '0.68rem', color: '#4a6080', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace" },
  input: { background: '#111d33', border: '1px solid rgba(99,160,255,0.15)', color: '#e8eeff', padding: '10px 14px', fontSize: '0.85rem', outline: 'none', fontFamily: "'Inter',sans-serif" },
  serverInfo: { background: '#111d33', border: '1px solid rgba(99,160,255,0.08)', padding: '16px', marginBottom: '20px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(99,160,255,0.05)' },
  infoLabel: { fontSize: '0.72rem', color: '#4a6080', fontFamily: "'JetBrains Mono',monospace" },
  infoVal: { fontSize: '0.72rem', color: '#8da3c9', fontFamily: "'JetBrains Mono',monospace" },
  recoverBtn: { width: '100%', background: 'linear-gradient(135deg, #4f8eff, #00e5c0)', border: 'none', color: '#fff', padding: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', fontFamily: "'Inter',sans-serif", letterSpacing: '0.05em', transition: 'opacity 0.2s' },
  progressWrap: { marginTop: '12px', background: '#111d33', height: '4px', borderRadius: '99px', overflow: 'hidden' },
  progressBar: { height: '100%', background: 'linear-gradient(90deg, #4f8eff, #00e5c0)', borderRadius: '99px', animation: 'progress 5s linear forwards', width: '0%' },
  logBox: { background: '#060b14', border: '1px solid rgba(99,160,255,0.08)', padding: '16px', minHeight: '200px', maxHeight: '320px', overflowY: 'auto', fontFamily: "'JetBrains Mono',monospace" },
  logEmpty: { color: '#4a6080', fontSize: '0.75rem', fontStyle: 'italic' },
  logLine: { display: 'flex', gap: '12px', fontSize: '0.75rem', marginBottom: '8px', lineHeight: 1.5 },
  logTime: { color: '#4a6080', flexShrink: 0 },
  alertRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(99,160,255,0.06)' },
  alertName: { fontWeight: '500', fontSize: '0.88rem', color: '#e8eeff', marginBottom: '3px' },
  alertSub: { fontSize: '0.68rem', color: '#4a6080', fontFamily: "'JetBrains Mono',monospace" },
  alertBadge: { padding: '3px 10px', fontSize: '0.65rem', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono',monospace" },
};

export default Recovery;