// ============================================================
// DASHBOARD LOGIC — dashboard.js
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const expiringThisMonthList  = document.getElementById('expiring-this-month-list');
  const expiringNextMonthList  = document.getElementById('expiring-next-month-list');
  const expiringThisMonthCount = document.getElementById('expiring-this-month-count');
  const expiringNextMonthCount = document.getElementById('expiring-next-month-count');
  const inventoryTableBody     = document.getElementById('inventory-table-body');

  db.collection('items').orderBy('expirationDate', 'asc').onSnapshot(snapshot => {
    const items = [];
    snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));

    renderAlertCards(items);
    renderSummaryTable(items);
  }, err => {
    console.error('Firestore error:', err);
  });

  function renderAlertCards(items) {
    const thisMonth = items.filter(i => getExpirationStatus(i.expirationDate) === 'this-month');
    const nextMonth = items.filter(i => getExpirationStatus(i.expirationDate) === 'next-month');

    expiringThisMonthCount.textContent = thisMonth.length;
    expiringNextMonthCount.textContent = nextMonth.length;

    if (thisMonth.length === 0) {
      expiringThisMonthList.innerHTML = '<p class="empty-state">// NO ITEMS EXPIRING THIS MONTH</p>';
    } else {
      expiringThisMonthList.innerHTML = thisMonth.map(item => `
        <div class="alert-row pulse-border">
          ${renderCategoryBadge(item.category)}
          <span class="item-name">${escHtml(item.name)}</span>
          <span class="item-date">${formatDate(item.expirationDate)}</span>
        </div>
      `).join('');
    }

    if (nextMonth.length === 0) {
      expiringNextMonthList.innerHTML = '<p class="empty-state">// NO ITEMS EXPIRING NEXT MONTH</p>';
    } else {
      expiringNextMonthList.innerHTML = nextMonth.map(item => `
        <div class="alert-row">
          ${renderCategoryBadge(item.category)}
          <span class="item-name">${escHtml(item.name)}</span>
          <span class="item-date">${formatDate(item.expirationDate)}</span>
        </div>
      `).join('');
    }
  }

  function renderSummaryTable(items) {
    // Sort: expired first, then this-month, next-month, ok, none
    const statusOrder = { 'expired': 0, 'this-month': 1, 'next-month': 2, 'ok': 3, 'none': 4 };
    const sorted = [...items].sort((a, b) => {
      const sa = statusOrder[getExpirationStatus(a.expirationDate)] ?? 5;
      const sb = statusOrder[getExpirationStatus(b.expirationDate)] ?? 5;
      if (sa !== sb) return sa - sb;
      if (a.expirationDate && b.expirationDate) return a.expirationDate.localeCompare(b.expirationDate);
      return 0;
    });

    if (sorted.length === 0) {
      inventoryTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state">// STOCKPILE CLEAR — NO ITEMS IN DATABASE</td>
        </tr>`;
      return;
    }

    inventoryTableBody.innerHTML = sorted.map((item, i) => {
      const status = getExpirationStatus(item.expirationDate);
      return `
        <tr class="table-row status-row-${status}">
          <td class="mono muted">${String(i + 1).padStart(2, '0')}</td>
          <td class="item-name-cell">${escHtml(item.name)}</td>
          <td>${renderCategoryBadge(item.category)}</td>
          <td class="mono">${item.quantity ?? 1}</td>
          <td class="mono">${formatDate(item.expirationDate)}</td>
          <td>${renderStatusBadge(status)}</td>
        </tr>`;
    }).join('');
  }

  function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
});
