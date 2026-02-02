function loadDashboard() {
  const renters = Storage.get('renters');
  const customers = Storage.get('installmentCustomers');

  document.getElementById('content').innerHTML = `
    <h2>Dashboard</h2>
    <div class="cards">
      <div class="card">
        <h3>Total Renters</h3>
        <p>${renters.length}</p>
      </div>
      <div class="card">
        <h3>Installment Customers</h3>
        <p>${customers.length}</p>
      </div>
    </div>
  `;
}

loadDashboard();
