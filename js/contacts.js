/* ==========================================
   PERSONAL JOB APPLICATION TRACKER - CONTACTS DIRECTORY
   ========================================== */

const Contacts = {
  searchQuery: '',

  /**
   * Render standalone contacts directory view
   */
  render() {
    const container = document.getElementById('contacts-grid-container');
    if (!container) return;

    let contactsList = Storage.getContacts();

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      contactsList = contactsList.filter(c => {
        return (c.name || '').toLowerCase().includes(q) ||
               (c.company || '').toLowerCase().includes(q) ||
               (c.role || '').toLowerCase().includes(q) ||
               (c.notes || '').toLowerCase().includes(q);
      });
    }

    if (contactsList.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          <h3>No contacts stored yet</h3>
          <p>Keep track of recruiters, alumni, hiring managers, and referral employees.</p>
          <button class="btn btn-primary" onclick="Contacts.openAddModal()">+ Add New Contact</button>
        </div>
      `;
      return;
    }

    let html = '';
    contactsList.forEach(c => {
      html += `
        <div class="stat-card" style="align-items: flex-start; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; width: 100%; align-items: flex-start;">
            <div>
              <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-primary);">${this.escape(c.name)}</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">${this.escape(c.role)} ${c.company ? 'at ' + this.escape(c.company) : ''}</div>
            </div>
            <span class="badge badge-applied">${this.escape(c.type || 'Contact')}</span>
          </div>

          <div style="margin-top: 0.75rem; font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.25rem; width: 100%;">
            ${c.email ? `<div>📧 <strong>Email:</strong> <a href="mailto:${this.escape(c.email)}" style="color: var(--primary);">${this.escape(c.email)}</a></div>` : ''}
            ${c.linkedIn ? `<div>🔗 <strong>LinkedIn:</strong> <a href="${this.escape(c.linkedIn)}" target="_blank" rel="noopener" style="color: var(--primary);">Profile Link ↗</a></div>` : ''}
            ${c.notes ? `<div style="background: var(--bg-primary); padding: 0.4rem 0.6rem; border-radius: 4px; margin-top: 0.3rem;">${this.escape(c.notes)}</div>` : ''}
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; width: 100%; margin-top: 0.85rem; border-top: 1px solid var(--border-color); padding-top: 0.6rem;">
            <button class="btn btn-sm btn-secondary" onclick="Contacts.openEditModal('${c.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="Contacts.confirmDelete('${c.id}')">Delete</button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  setSearch(q) {
    this.searchQuery = q;
    this.render();
  },

  openAddModal() {
    const modal = document.getElementById('contact-form-modal');
    if (!modal) return;
    document.getElementById('contact-form-id').value = '';
    document.getElementById('contact-form-name').value = '';
    document.getElementById('contact-form-company').value = '';
    document.getElementById('contact-form-role').value = '';
    document.getElementById('contact-form-email').value = '';
    document.getElementById('contact-form-linkedin').value = '';
    document.getElementById('contact-form-type').value = 'Recruiter';
    document.getElementById('contact-form-notes').value = '';
    modal.classList.add('active');
  },

  openEditModal(id) {
    const contacts = Storage.getContacts();
    const c = contacts.find(item => item.id === id);
    if (!c) return;

    const modal = document.getElementById('contact-form-modal');
    if (!modal) return;

    document.getElementById('contact-form-id').value = c.id;
    document.getElementById('contact-form-name').value = c.name || '';
    document.getElementById('contact-form-company').value = c.company || '';
    document.getElementById('contact-form-role').value = c.role || '';
    document.getElementById('contact-form-email').value = c.email || '';
    document.getElementById('contact-form-linkedin').value = c.linkedIn || '';
    document.getElementById('contact-form-type').value = c.type || 'Recruiter';
    document.getElementById('contact-form-notes').value = c.notes || '';
    modal.classList.add('active');
  },

  saveModal() {
    const name = document.getElementById('contact-form-name').value;
    if (!name || !name.trim()) {
      alert('Contact Name is required');
      return;
    }

    const contactData = {
      id: document.getElementById('contact-form-id').value,
      name: name.trim(),
      company: document.getElementById('contact-form-company').value.trim(),
      role: document.getElementById('contact-form-role').value.trim(),
      email: document.getElementById('contact-form-email').value.trim(),
      linkedIn: document.getElementById('contact-form-linkedin').value.trim(),
      type: document.getElementById('contact-form-type').value,
      notes: document.getElementById('contact-form-notes').value.trim()
    };

    Storage.saveContact(contactData);
    document.getElementById('contact-form-modal').classList.remove('active');
    App.showToast('Contact saved!');
    this.render();
  },

  confirmDelete(id) {
    if (confirm('Are you sure you want to delete this contact?')) {
      Storage.deleteContact(id);
      App.showToast('Contact deleted');
      this.render();
    }
  },

  escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};
