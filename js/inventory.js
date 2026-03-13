// ============================================================
// INVENTORY LOGIC — inventory.js
// ============================================================

const N8N_WEBHOOK_URL = 'https://contentworksheet.app.n8n.cloud/webhook/1df03a52-5998-4eb0-9807-a5ab2a11c3b6';

document.addEventListener('DOMContentLoaded', () => {
  let allItems = [];
  let activeCategory = 'all';

  const itemGrid        = document.getElementById('item-grid');
  const addItemBtn      = document.getElementById('add-item-btn');
  const modal           = document.getElementById('add-item-modal');
  const modalClose      = document.getElementById('modal-cancel');
  const addItemForm     = document.getElementById('add-item-form');
  const hasExpYes       = document.getElementById('has-exp-yes');
  const hasExpNo        = document.getElementById('has-exp-no');
  const expDateWrapper  = document.getElementById('exp-date-wrapper');
  const categoryTabs    = document.getElementById('category-tabs');

  // Build category tabs
  const tabsHtml = `
    <button class="cat-tab active" data-cat="all">All Items</button>
    ${CATEGORIES.map(c => `<button class="cat-tab" data-cat="${c.id}">${c.label}</button>`).join('')}
  `;
  categoryTabs.innerHTML = tabsHtml;

  categoryTabs.addEventListener('click', e => {
    if (!e.target.classList.contains('cat-tab')) return;
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    activeCategory = e.target.dataset.cat;
    renderGrid();
  });

  // Firestore realtime listener
  db.collection('items').onSnapshot(snapshot => {
    allItems = [];
    snapshot.forEach(doc => allItems.push({ id: doc.id, ...doc.data() }));
    renderGrid();
  });

  function renderGrid() {
    const filtered = activeCategory === 'all'
      ? allItems
      : allItems.filter(i => i.category === activeCategory);

    if (filtered.length === 0) {
      itemGrid.innerHTML = `<div class="empty-grid-state">// NO ITEMS IN THIS CATEGORY</div>`;
      return;
    }

    // Sort by expiration status
    const statusOrder = { 'expired': 0, 'this-month': 1, 'next-month': 2, 'ok': 3, 'none': 4 };
    const sorted = [...filtered].sort((a, b) => {
      const sa = statusOrder[getExpirationStatus(a.expirationDate)] ?? 5;
      const sb = statusOrder[getExpirationStatus(b.expirationDate)] ?? 5;
      return sa - sb;
    });

    itemGrid.innerHTML = sorted.map(item => buildItemCard(item)).join('');

    // Attach delete handlers
    itemGrid.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.item-card');
        const confirmDiv = card.querySelector('.confirm-delete');
        confirmDiv.style.display = 'flex';
        btn.style.display = 'none';
      });
    });

    itemGrid.querySelectorAll('.confirm-yes').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        try {
          await db.collection('items').doc(id).delete();
        } catch (err) {
          console.error('Delete error:', err);
        }
      });
    });

    itemGrid.querySelectorAll('.confirm-no').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.item-card');
        card.querySelector('.confirm-delete').style.display = 'none';
        card.querySelector('.delete-btn').style.display = 'inline-block';
      });
    });
  }

  function buildItemCard(item) {
    const status = getExpirationStatus(item.expirationDate);
    const cat = getCategoryById(item.category);
    return `
      <div class="item-card status-card-${status}">
        <div class="card-top">
          ${renderCategoryBadge(item.category)}
          ${renderStatusBadge(status)}
        </div>
        <div class="card-name">${escHtml(item.name)}</div>
        <div class="card-meta">
          <span class="meta-label">QTY</span>
          <span class="meta-value">${item.quantity ?? 1}</span>
        </div>
        <div class="card-meta">
          <span class="meta-label">EXPIRES</span>
          <span class="meta-value">${item.hasExpiration ? formatDate(item.expirationDate) : '<span class="muted">NO EXPIRATION</span>'}</span>
        </div>
        <div class="card-footer">
          <button class="delete-btn" data-id="${item.id}">[ DELETE ]</button>
          <div class="confirm-delete" style="display:none;">
            <span class="confirm-label">CONFIRM DELETE?</span>
            <button class="confirm-yes" data-id="${item.id}">[ YES ]</button>
            <button class="confirm-no">[ NO ]</button>
          </div>
        </div>
      </div>`;
  }

  // Modal open/close
  addItemBtn.addEventListener('click', () => {
    modal.classList.add('open');
    addItemForm.reset();
    expDateWrapper.classList.remove('visible');
    clearErrors();
  });

  function closeModal() {
    modal.classList.remove('open');
    addItemForm.reset();
    expDateWrapper.classList.remove('visible');
    clearErrors();
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Expiration toggle
  hasExpYes.addEventListener('change', () => {
    if (hasExpYes.checked) expDateWrapper.classList.add('visible');
  });
  hasExpNo.addEventListener('change', () => {
    if (hasExpNo.checked) expDateWrapper.classList.remove('visible');
  });

  // Form submit
  addItemForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();

    const name     = document.getElementById('item-name').value.trim();
    const category = document.getElementById('item-category').value;
    const quantity = parseInt(document.getElementById('item-quantity').value) || 1;
    const hasExp   = hasExpYes.checked;
    const expDate  = document.getElementById('exp-date').value;

    let valid = true;

    if (!name) {
      showError('name-error', 'ITEM NAME IS REQUIRED');
      valid = false;
    }
    if (!category) {
      showError('category-error', 'SELECT A CATEGORY');
      valid = false;
    }
    if (hasExp && !expDate) {
      showError('date-error', 'EXPIRATION DATE IS REQUIRED');
      valid = false;
    }

    if (!valid) return;

    const saveBtn = addItemForm.querySelector('.save-btn');
    saveBtn.textContent = '[ SAVING... ]';
    saveBtn.disabled = true;

    try {
      await db.collection('items').add({
        name,
        category,
        quantity,
        hasExpiration: hasExp,
        expirationDate: hasExp ? expDate : null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      closeModal();
    } catch (err) {
      console.error('Save error:', err);
      showError('name-error', 'ERROR SAVING — CHECK FIREBASE CONFIG');
    } finally {
      saveBtn.textContent = '[ SAVE ITEM ]';
      saveBtn.disabled = false;
    }
  });

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
  }

  function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
});
