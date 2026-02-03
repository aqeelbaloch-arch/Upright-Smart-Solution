// Upright Smart Solution - basic app logic (vanilla JS + LocalStorage)
// Keep this file modular & small — expand as needed.

(() => {
  // Helpers
  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);
  const uid = (prefix='id') => prefix + Math.random().toString(36).slice(2,9);

  // Storage keys
  const KEY_RENTERS = 'uss_renters_v1';
  const KEY_INSTALL = 'uss_install_v1';
  const KEY_EXPENSES = 'uss_expenses_v1';

  // Load sample data if first time
  const loadInitialData = () => {
    if (!localStorage.getItem(KEY_RENTERS)) {
      localStorage.setItem(KEY_RENTERS, JSON.stringify(SAMPLE_RENTERS));
    }
    if (!localStorage.getItem(KEY_INSTALL)) {
      localStorage.setItem(KEY_INSTALL, JSON.stringify(SAMPLE_INSTALLMENTS));
    }
    if (!localStorage.getItem(KEY_EXPENSES)) {
      localStorage.setItem(KEY_EXPENSES, JSON.stringify([]));
    }
  };

  // CRUD
  const getRenters = () => JSON.parse(localStorage.getItem(KEY_RENTERS) || '[]');
  const saveRenters = arr => localStorage.setItem(KEY_RENTERS, JSON.stringify(arr));
  const getInst = () => JSON.parse(localStorage.getItem(KEY_INSTALL) || '[]');
  const saveInst = arr => localStorage.setItem(KEY_INSTALL, JSON.stringify(arr));
  const getExpenses = () => JSON.parse(localStorage.getItem(KEY_EXPENSES) || '[]');
  const saveExpenses = arr => localStorage.setItem(KEY_EXPENSES, JSON.stringify(arr));

  // UI Elements
  const views = $$('.view');
  const navItems = $$('.sidebar nav li');
  const addRenterBtn = $('#addRenterBtn');
  const modal = $('#modal');
  const closeModal = $('#closeModal');
  const renterForm = $('#renterForm');
  const rentersList = $('#rentersList');
  const installmentList = $('#installmentList');
  const globalSearch = $('#globalSearch');
  const filterStatus = $('#filterStatus');
  const cardIncome = $('#card-income');
  const cardPending = $('#card-pending');
  const cardOverdue = $('#card-overdue');
  const cardNet = $('#card-net');
  const topDefaulters = $('#topDefaulters');

  // View switching
  navItems.forEach(li => {
    li.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      li.classList.add('active');
      const view = li.dataset.view;
      views.forEach(v => v.classList.remove('active'));
      const target = document.getElementById('view-' + view);
      if (target) target.classList.add('active');
      renderAll();
    });
  });

  // Modal controls
  addRenterBtn.addEventListener('click', () => openModalForNew());
  closeModal.addEventListener('click', () => closeModalFunc());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModalFunc();
  });

  function openModalForNew() {
    renterForm.reset();
    $('#modalTitle').textContent = 'Add Renter';
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeModalFunc() {
    modal.setAttribute('aria-hidden', 'true');
  }

  // Save renter
  renterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData(renterForm);
    const renter = {
      id: uid('r'),
      name: form.get('name').trim(),
      contact: form.get('contact').trim(),
      property: form.get('property').trim(),
      monthlyRent: Number(form.get('monthlyRent') || 0),
      advance: Number(form.get('advance') || 0),
      dueDay: Number(form.get('dueDay') || 1),
      notes: form.get('notes') || '',
      payments: []
    };
    const arr = getRenters();
    arr.unshift(renter);
    saveRenters(arr);
    closeModalFunc();
    renderRenters();
    renderDashboard();
  });

  // Render renters cards
  function computeStatusForRenter(r) {
    // Determine pending/overdue: naive monthly due logic
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), r.dueDay || 1);
    const paymentsThisMonth = (r.payments || []).filter(p => {
      const d = new Date(p.date);
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
    }).reduce((s, p) => s + Number(p.amount || 0), 0);

    const expected = r.monthlyRent || 0;
    const pending = Math.max(0, expected - paymentsThisMonth);
    const overdue = today > thisMonth && pending > 0;
    return { pending, overdue, paymentsThisMonth };
  }

  function renderRenters(filterText = '', filterStatusVal = 'all') {
    const arr = getRenters();
    const list = arr.filter(r => {
      const text = (r.name + ' ' + r.property + ' ' + r.contact).toLowerCase();
      return text.includes(filterText.toLowerCase());
    }).filter(r => {
      if (filterStatusVal === 'all') return true;
      const s = computeStatusForRenter(r);
      if (filterStatusVal === 'paid') return s.pending === 0;
      if (filterStatusVal === 'due') return s.pending > 0 && !s.overdue;
      if (filterStatusVal === 'overdue') return s.overdue;
    });

    rentersList.innerHTML = '';
    list.forEach(r => {
      const s = computeStatusForRenter(r);
      const el = document.createElement('div');
      el.className = 'renter-card';
      el.innerHTML = `
        <div style="font-weight:700">${r.name}</div>
        <div style="color:var(--muted);font-size:13px">${r.property} • ${r.contact}</div>
        <div style="margin-top:8px">Rent: ₹${r.monthlyRent} • Advance ₹${r.advance}</div>
        <div style="margin-top:8px">Received (this month): ₹${s.paymentsThisMonth}</div>
        <div style="margin-top:8px">Pending: <strong>₹${s.pending}</strong></div>
        <div style="margin-top:8px">${r.notes ? `<small>${r.notes}</small>` : ''}</div>
        <div style="margin-top:10px;display:flex;gap:8px">
          <button class="btn payBtn" data-id="${r.id}">Add Payment</button>
          <button class="btn" data-id="${r.id}" data-action="view">View</button>
          <button class="btn" data-id="${r.id}" data-action="invoice">Invoice (PDF)</button>
        </div>
        <div class="status ${s.overdue ? 'overdue' : s.pending ? 'due' : 'paid'}">${s.overdue ? 'Overdue' : s.pending ? 'Due' : 'Paid'}</div>
      `;
      rentersList.appendChild(el);
    });

    // Attach events for pay buttons
    document.querySelectorAll('.payBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const amount = prompt('Enter payment amount');
        if (!amount) return;
        addPaymentToRenter(id, Number(amount));
      });
    });

    document.querySelectorAll('[data-action="invoice"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        generateRenterInvoicePDF(id);
      });
    });

    document.querySelectorAll('[data-action="view"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        viewRenterDetail(id);
      });
    });

  }

  function addPaymentToRenter(rid, amount) {
    const arr = getRenters();
    const r = arr.find(x => x.id === rid);
    if (!r) return alert('Renter not found');
    r.payments = r.payments || [];
    r.payments.push({ id: uid('p'), amount: amount, date: (new Date()).toISOString().split('T')[0], type: 'rent' });
    saveRenters(arr);
    renderRenters(globalSearch.value, filterStatus.value);
    renderDashboard();
  }

  function viewRenterDetail(id) {
    const r = getRenters().find(x => x.id === id);
    if (!r) return alert('not found');
    const details = [
      `Name: ${r.name}`,
      `Property: ${r.property}`,
      `Contact: ${r.contact}`,
      `Monthly Rent: ₹${r.monthlyRent}`,
      `Advance: ₹${r.advance}`,
      `Notes: ${r.notes}`,
      `Payments:`,
      ...(r.payments || []).map(p => `  - ${p.date} : ₹${p.amount}`)
    ].join('\n');
    alert(details);
  }

  // Simple PDF invoice (jsPDF)
  async function generateRenterInvoicePDF(id) {
    const r = getRenters().find(x => x.id === id);
    if (!r) return alert('Renter not found');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text('Monthly Rent Invoice', 14, 20);
    doc.setFontSize(11);
    doc.text(`Name: ${r.name}`, 14, 32);
    doc.text(`Property: ${r.property}`, 14, 40);
    doc.text(`Contact: ${r.contact}`, 14, 48);
    const today = new Date().toISOString().split('T')[0];
    doc.text(`Date: ${today}`, 140, 32);

    doc.text(`Monthly Rent: ₹${r.monthlyRent}`, 14, 64);
    doc.text(`Paid (this month): ₹${computeStatusForRenter(r).paymentsThisMonth}`, 14, 72);
    doc.text(`Pending: ₹${computeStatusForRenter(r).pending}`, 14, 80);

    doc.save(`${r.name.replace(/\s+/g,'_')}_invoice_${today}.pdf`);
  }

  // Simple dashboard calculations & chart
  let incomeChart = null;
  function renderDashboard() {
    const renters = getRenters();
    const insts = getInst();

    const monthlyIncome = renters.reduce((s, r) => {
      // sum payments in current month
      const t = (r.payments || []).reduce((ss, p) => {
        const d = new Date(p.date);
        const now = new Date();
        if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) return ss + Number(p.amount || 0);
        return ss;
      }, 0);
      return s + t;
    }, 0);

    const pendingTotal = renters.reduce((s, r) => s + computeStatusForRenter(r).pending, 0);
    const overdueCount = renters.filter(r => computeStatusForRenter(r).overdue).length;

    // net = income - expenses
    const expenses = getExpenses().reduce((s, e) => s + Number(e.amount || 0), 0);
    const net = monthlyIncome - expenses;

    cardIncome.textContent = `₹${monthlyIncome}`;
    cardPending.textContent = `₹${pendingTotal}`;
    cardOverdue.textContent = `${overdueCount}`;
    cardNet.textContent = `₹${net}`;

    // Top defaulters: by pending desc
    const top = [...renters].map(r => ({ name: r.name, pending: computeStatusForRenter(r).pending }))
      .sort((a,b) => b.pending - a.pending).slice(0,6);
    topDefaulters.innerHTML = top.map(t => `<li>${t.name} — ₹${t.pending}</li>`).join('');

    // Chart: rent vs installment (monthly estimate)
    const rentEstimate = renters.reduce((s, r) => s + Number(r.monthlyRent || 0), 0);
    const instEstimate = insts.reduce((s, i) => {
      const monthly = ((i.totalPrice || 0) - (i.advance || 0)) / (i.durationMonths || 1);
      return s + monthly;
    }, 0);

    const ctx = document.getElementById('incomeChart').getContext('2d');
    if (incomeChart) incomeChart.destroy();
    incomeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Rent (est/month)', 'Installments (est/month)'],
        datasets: [{
          label: 'Estimated monthly inflow',
          data: [rentEstimate, instEstimate],
          backgroundColor: [ 'rgba(30,136,229,0.8)', 'rgba(67,160,71,0.8)' ]
        }]
      },
      options: { responsive:true, maintainAspectRatio:false }
    });
  }

  // Render installments (simple cards)
  function renderInstallments() {
    const arr = getInst();
    installmentList.innerHTML = '';
    arr.forEach(i => {
      const paid = (i.payments || []).reduce((s,p) => s + Number(p.amount || 0), 0);
      const monthly = ((i.totalPrice || 0) - (i.advance || 0)) / (i.durationMonths || 1);
      const pending = Math.max(0, (i.totalPrice || 0) - (i.advance || 0) - paid);
      const el = document.createElement('div');
      el.className = 'renter-card';
      el.innerHTML = `
        <div style="font-weight:700">${i.name}</div>
        <div style="color:var(--muted);font-size:13px">${i.item}</div>
        <div style="margin-top:8px">Total: ₹${i.totalPrice} • Advance ₹${i.advance}</div>
        <div style="margin-top:8px">Monthly (est): ₹${Math.round(monthly)}</div>
        <div style="margin-top:8px">Pending: ₹${Math.round(pending)}</div>
        <div style="margin-top:10px;display:flex;gap:8px">
          <button class="btn instPayBtn" data-id="${i.id}">Add Installment Payment</button>
        </div>
      `;
      installmentList.appendChild(el);
    });

    document.querySelectorAll('.instPayBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const amount = prompt('Enter installment amount');
        if (!amount) return;
        addPaymentToInstallment(id, Number(amount));
      });
    });
  }

  function addPaymentToInstallment(id, amount) {
    const arr = getInst();
    const it = arr.find(x => x.id === id);
    if (!it) return alert('not found');
    it.payments = it.payments || [];
    it.payments.push({ id: uid('ip'), amount, date: (new Date()).toISOString().split('T')[0] });
    saveInst(arr);
    renderInstallments();
    renderDashboard();
  }

  // Search & filters
  globalSearch.addEventListener('input', () => renderRenters(globalSearch.value, filterStatus.value));
  filterStatus.addEventListener('change', () => renderRenters(globalSearch.value, filterStatus.value));

  // PDF exports (simple)
  $('#exportPdfRenters').addEventListener('click', async () => {
    const renters = getRenters();
    if (!renters.length) return alert('No renters to export');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Renters List', 14, 20);
    let y = 30;
    renters.forEach(r => {
      doc.text(`${r.name} | ${r.property} | Rent ₹${r.monthlyRent}`, 14, y);
      y += 8;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save('renters_list.pdf');
  });

  $('#downloadMonthlyReport').addEventListener('click', () => {
    // placeholder: you can create a detailed report here
    alert('Monthly report generation placeholder — implement summary content as needed.');
  });

  // Init
  function renderAll() {
    renderRenters(globalSearch.value, filterStatus.value);
    renderInstallments();
    renderDashboard();
  }

  loadInitialData();
  renderAll();

  // expose some helpers to console for quick testing
  window.uss = {
    getRenters, saveRenters, getInst, saveInst, getExpenses, saveExpenses,
    addPaymentToRenter, generateRenterInvoicePDF
  };

})();