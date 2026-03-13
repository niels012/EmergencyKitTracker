// ============================================================
// SHARED APP LOGIC — app.js
// ============================================================

const CATEGORIES = [
  { id: "water",      label: "Water & Hydration",       color: "#2980b9" },
  { id: "food",       label: "Food & Cooking",           color: "#8b6914" },
  { id: "firstaid",   label: "First Aid & Medical",      color: "#c0392b" },
  { id: "lighting",   label: "Lighting & Communication", color: "#d4ac0d" },
  { id: "sanitation", label: "Sanitation & Hygiene",     color: "#1a7a4a" },
  { id: "clothing",   label: "Clothing",                 color: "#6c5ce7" },
  { id: "documents",  label: "Documents",                color: "#7f8c8d" },
];

function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || { id, label: id, color: "#8a9080" };
}

/**
 * getExpirationStatus
 * Returns: 'expired' | 'this-month' | 'next-month' | 'ok' | 'none'
 */
function getExpirationStatus(dateString) {
  if (!dateString) return 'none';

  const now = new Date();
  const exp = new Date(dateString + 'T00:00:00');

  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();
  const expYear = exp.getFullYear();
  const expMonth = exp.getMonth();

  // Last day of today
  const todayMidnight = new Date(nowYear, nowMonth, now.getDate() + 1);

  if (exp < todayMidnight && exp < now) {
    // Check if it's actually expired (before today)
    const today = new Date(nowYear, nowMonth, now.getDate());
    if (exp < today) return 'expired';
  }

  if (expYear === nowYear && expMonth === nowMonth) return 'this-month';

  const nextMonth = new Date(nowYear, nowMonth + 1, 1);
  const nextMonthEnd = new Date(nowYear, nowMonth + 2, 1);
  if (exp >= nextMonth && exp < nextMonthEnd) return 'next-month';

  const today = new Date(nowYear, nowMonth, now.getDate());
  if (exp < today) return 'expired';

  return 'ok';
}

function renderStatusBadge(status) {
  const map = {
    'expired':    { label: 'EXPIRED',    cls: 'badge-expired' },
    'this-month': { label: 'THIS MONTH', cls: 'badge-this-month' },
    'next-month': { label: 'NEXT MONTH', cls: 'badge-next-month' },
    'ok':         { label: 'OK',         cls: 'badge-ok' },
    'none':       { label: 'NO EXP',     cls: 'badge-none' },
  };
  const b = map[status] || map['none'];
  return `<span class="badge status-badge ${b.cls}">${b.label}</span>`;
}

function renderCategoryBadge(categoryId) {
  const cat = getCategoryById(categoryId);
  return `<span class="badge cat-badge" style="border-color:${cat.color};color:${cat.color}">${cat.label}</span>`;
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Nav hamburger toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
    });
  }
});
