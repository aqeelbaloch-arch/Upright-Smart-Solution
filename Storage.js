const Storage = {
  get(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  },
  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

if (!localStorage.getItem('renters')) Storage.set('renters', []);
if (!localStorage.getItem('installmentCustomers')) Storage.set('installmentCustomers', []);
