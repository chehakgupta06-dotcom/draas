import React from 'react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'servers',   label: 'Servers',   icon: '⬡' },
  { id: 'backups',   label: 'Backups',   icon: '◫' },
  { id: 'policies',  label: 'Policies',  icon: '◉' },
  { id: 'recovery',  label: 'Recovery',  icon: '↺' },
];

const Navigation = ({ activePage, setActivePage }) => (
  <nav style={s.nav}>
    <div style={s.logo}>
      <div style={s.logoIcon}>DR</div>
      <div>
        <div style={s.logoText}>DRaaS</div>
        <div style={s.logoSub}>Recovery Platform</div>
      </div>
    </div>
    <div style={s.statusRow}>
      <div style={s.statusDot} />
      <span style={s.statusText}>System Operational</span>
    </div>
    <ul style={s.list}>
      {navItems.map(item => {
        const active = activePage === item.id;
        return (
          <li key={item.id}>
            <button onClick={() => setActivePage(item.id)} style={{ ...s.btn, ...(active ? s.btnActive : {}) }}>
              {active && <div style={s.activeLine} />}
              <span style={s.icon}>{item.icon}</span>
              {item.label}
            </button>
          </li>
        );
      })}
    </ul>
    <div style={s.footer}>
      <div style={s.footerTag}>v1.0.0</div>
      <div style={s.footerName}>Chehak Gupta</div>
    </div>
  </nav>
);

const s = {
  nav: { position: 'fixed', top: 0, left: 0, bottom: 0, width: '240px', background: '#080d1a', borderRight: '1px solid rgba(99,160,255,0.1)', display: 'flex', flexDirection: 'column', padding: '28px 0', zIndex: 100 },
  logo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px 28px', borderBottom: '1px solid rgba(99,160,255,0.08)' },
  logoIcon: { width: '38px', height: '38px', background: 'linear-gradient(135deg,#4f8eff,#00e5c0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.75rem', color: '#fff', clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))' },
  logoText: { fontWeight: '700', fontSize: '1rem', color: '#e8eeff', letterSpacing: '0.05em' },
  logoSub: { fontSize: '0.62rem', color: '#4a6080', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono',monospace" },
  statusRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', margin: '12px 16px', background: 'rgba(40,200,64,0.06)', border: '1px solid rgba(40,200,64,0.15)' },
  statusDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#28c840', boxShadow: '0 0 8px rgba(40,200,64,0.6)', flexShrink: 0 },
  statusText: { fontSize: '0.68rem', color: '#28c840', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.05em' },
  list: { listStyle: 'none', padding: '8px 0', margin: 0, flex: 1 },
  btn: { width: '100%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#4a6080', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', position: 'relative', textAlign: 'left', fontFamily: "'Inter',sans-serif" },
  btnActive: { color: '#e8eeff', background: 'rgba(79,142,255,0.08)' },
  activeLine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'linear-gradient(to bottom,#4f8eff,#00e5c0)' },
  icon: { fontSize: '1rem', width: '20px', textAlign: 'center' },
  footer: { padding: '16px 24px', borderTop: '1px solid rgba(99,160,255,0.08)' },
  footerTag: { fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: '#4a6080', letterSpacing: '0.1em', marginBottom: '4px' },
  footerName: { fontSize: '0.75rem', color: '#8da3c9', fontWeight: '500' },
};

export default Navigation;