let renters = JSON.parse(localStorage.getItem("renters")) || [];
let invoices = JSON.parse(localStorage.getItem("invoices")) || [];

// LOAD RENTERS
function loadRenters() {
renterSelect.innerHTML = "";
renters.forEach((r, i) => {
renterSelect.innerHTML += `<option value="${i}">${r.name} (${r.unit})</option>`;
});
}
loadRenters();

// ADD RENTER
function addRenter() {
const name = renterName.value;
const unit = renterUnit.value;
const phone = renterPhone.value;

if (!name || !phone) return alert("Enter renter details");

renters.push({ name, unit, phone });
localStorage.setItem("renters", JSON.stringify(renters));
loadRenters();

renterName.value = renterUnit.value = renterPhone.value = "";
}

// GENERATE PDF + SAVE
function generateInvoice() {
const renter = renters[renterSelect.value];
const month = invoiceMonth.value;

const total =
+rent.value + +electricity.value + +gas.value + +water.value + +maintenance.value;

const invoice = {
id: Date.now(),
renter,
month,
items: { rent, electricity, gas, water, maintenance },
total
};

invoices.push(invoice);
localStorage.setItem("invoices", JSON.stringify(invoices));

createPDF(invoice);
renderInvoices();
}

// PDF CREATION
function createPDF(inv) {
const { jsPDF } = window.jspdf;
const doc = new jsPDF();

doc.text("Monthly Rent Invoice", 14, 15);
doc.text(`Name: ${inv.renter.name}`, 14, 25);
doc.text(`Unit: ${inv.renter.unit}`, 14, 32);
doc.text(`Month: ${inv.month}`, 14, 39);

doc.autoTable({
startY: 45,
head: [["Description", "Amount"]],
body: [
["Rent", inv.items.rent.value],
["Electricity", inv.items.electricity.value],
["Gas", inv.items.gas.value],
["Water", inv.items.water.value],
["Maintenance", inv.items.maintenance.value],
["Total", inv.total]
]
});

doc.save(`${inv.renter.name}-${inv.month}.pdf`);
}

// RENDER INVOICES
function renderInvoices() {
invoiceTable.innerHTML = "";

const nameFilter = searchName.value.toLowerCase();
const monthFilter = filterMonth.value;

invoices
.filter(i =>
i.renter.name.toLowerCase().includes(nameFilter) &&
(monthFilter === "" || i.month === monthFilter)
)
.forEach(inv => {
invoiceTable.innerHTML += `
<tr>
<td>${inv.renter.name}</td>
<td>${inv.month}</td>
<td>Rs ${inv.total}</td>
<td>
<button class="action-btn whatsapp"
onclick="sendWhatsApp(${inv.id})">WhatsApp</button>
<button class="action-btn delete"
onclick="deleteInvoice(${inv.id})">Delete</button>
</td>
</tr>`;
});
}
renderInvoices();

// WHATSAPP SEND
function sendWhatsApp(id) {
const inv = invoices.find(i => i.id === id);
const msg = `Rent Invoice
Name: ${inv.renter.name}
Month: ${inv.month}
Total: Rs ${inv.total}`;
window.open(`https://wa.me/${inv.renter.phone}?text=${encodeURIComponent(msg)}`);
}

// DELETE
function deleteInvoice(id) {
invoices = invoices.filter(i => i.id !== id);
localStorage.setItem("invoices", JSON.stringify(invoices));
renderInvoices();
  }

function loadPage(page) {

  if (page === 'dashboard') loadDashboard();

  /* RENTERS PAGE */
  if (page === 'renters') {
    document.getElementById('content').innerHTML = `
      <h2>Manage Renters</h2>

      <form onsubmit="addRenter(event)">
        <input type="text" id="renterName" placeholder="Renter Name" required>
        <input type="number" id="monthlyRent" placeholder="Monthly Rent" required>
        <input type="number" id="advance" placeholder="Advance Amount">
        <input type="number" id="surety" placeholder="Surety Deposit">
        <button>Add Renter</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Rent</th>
            <th>Advance</th>
            <th>Surety</th>
          </tr>
        </thead>
        <tbody id="rentersList"></tbody>
      </table>
    `;
    renderRenters();
  }

  /* INSTALLMENT CUSTOMERS PAGE */
  if (page === 'installments') {
    document.getElementById('content').innerHTML = `
      <h2>Installment Customers</h2>

      <form onsubmit="addInstallmentCustomer(event)">
        <input type="text" id="custName" placeholder="Customer Name" required>
        <input type="text" id="item" placeholder="Item Name" required>
        <input type="number" id="totalPrice" placeholder="Total Price" required>
        <input type="number" id="advancePaid" placeholder="Advance Paid">
        <button>Add Customer</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Item</th>
            <th>Total</th>
            <th>Advance</th>
          </tr>
        </thead>
        <tbody id="installmentList"></tbody>
      </table>
    `;
    renderInstallmentCustomers();
  }

      }
