// Elemen DOM
const expenseForm = document.getElementById('expense-form');
const expensesList = document.getElementById('expenses-list');
const totalAmount = document.getElementById('total-amount');

// Setup event listener pengeluaran
document.addEventListener('DOMContentLoaded', () => {
    setupExpensesListeners();
});

// Setup event listener terkait pengeluaran
function setupExpensesListeners() {
    // Pengiriman form pengeluaran baru
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isAuthenticated()) {
            addExpense();
        } else {
            showNotification('Silakan masuk untuk menyimpan pengeluaran', 'warning');
        }
    });
}

// Tambah pengeluaran baru
function addExpense() {
    const expenseName = document.getElementById('expense-name').value.trim();
    const expenseAmount = parseFloat(document.getElementById('expense-amount').value);
    const expenseCategory = document.getElementById('expense-category').value;
    const expenseDate = document.getElementById('expense-date').value;
    const expenseNotes = document.getElementById('expense-notes').value.trim();
    
    if (!expenseName || isNaN(expenseAmount) || expenseAmount <= 0 || !expenseCategory || !expenseDate) {
        showNotification('Silakan isi semua kolom yang diperlukan dengan benar', 'danger');
        return;
    }
    
    // Membuat objek pengeluaran
    const newExpense = {
        name: expenseName,
        amount: expenseAmount,
        category: expenseCategory,
        date: expenseDate,
        notes: expenseNotes,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userId: appState.currentUser.uid
    };
    
    // Tambahkan ke Firestore
    db.collection('expenses').add(newExpense)
        .then((docRef) => {
            console.log('Pengeluaran ditambahkan dengan ID:', docRef.id);
            showNotification('Pengeluaran berhasil ditambahkan');
            
            // Reset form
            expenseForm.reset();
            
            // Set tanggal hari ini sebagai default lagi
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('expense-date').value = today;
            
            // Muat ulang daftar pengeluaran
            loadUserExpenses();
        })
        .catch((error) => {
            console.error('Error menambahkan pengeluaran:', error);
            showNotification('Gagal menambahkan pengeluaran. Silakan coba lagi.', 'danger');
        });
}

// Muat pengeluaran pengguna dari Firestore
function loadUserExpenses() {
    if (!isAuthenticated()) {
        return;
    }
    
    // Tampilkan status loading
    expensesList.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Memuat...</span>
            </div>
            <p class="mt-2 text-muted">Memuat pengeluaran...</p>
        </div>
    `;
    
    // Query Firestore untuk pengeluaran pengguna
    db.collection('expenses')
        .where('userId', '==', appState.currentUser.uid)
        .orderBy('date', 'desc')
        .orderBy('timestamp', 'desc')
        .get()
        .then((querySnapshot) => {
            appState.expenses = [];
            
            querySnapshot.forEach((doc) => {
                const expense = {
                    id: doc.id,
                    ...doc.data()
                };
                appState.expenses.push(expense);
            });
            
            // Muat ulang daftar pengeluaran dengan data baru
            refreshExpensesList();
            
            // Perbarui grafik
            updateCharts();
        })
        .catch((error) => {
            console.error('Error memuat pengeluaran:', error);
            expensesList.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
                    <p>Gagal memuat pengeluaran. Silakan coba lagi.</p>
                </div>
            `;
        });('expenses')
        .where('userId', '==', appState.currentUser.uid)
        .orderBy('date', 'desc')
        .orderBy('timestamp', 'desc')
        .get()
        .then((querySnapshot) => {
            appState.expenses = [];
            
            querySnapshot.forEach((doc) => {
                const expense = {
                    id: doc.id,
                    ...doc.data()
                };
                appState.expenses.push(expense);
            });
            
            // Refresh the expenses list with the new data
            refreshExpensesList();
            
            // Update charts
            updateCharts();
        })
        .catch((error) => {
            console.error('Error loading expenses:', error);
            expensesList.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
                    <p>Gagal memuat pengeluaran. Silakan coba lagi.</p>
                </div>
            `;
        });
}

// Refresh the expenses list based on current filter
function refreshExpensesList() {
    if (!isAuthenticated() || appState.expenses.length === 0) {
        expensesList.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-receipt fa-3x text-muted mb-3"></i>
                <p>Tidak ada pengeluaran ditemukan</p>
                <button class="btn btn-sm btn-primary mt-2" data-bs-toggle="collapse" data-bs-target="#addExpenseCollapse">
                    <i class="fas fa-plus-circle me-2"></i>Tambah Pengeluaran Pertama Anda
                </button>
            </div>
        `;
        totalAmount.textContent = formatCurrency(0);
        return;
    }
    
    // Filter expenses based on current filter
    let filteredExpenses = [...appState.expenses];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    switch (appState.filter) {
        case 'today':
            filteredExpenses = filteredExpenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getTime() >= today.getTime() && 
                       expenseDate.getTime() < today.getTime() + 86400000;
            });
            break;
        case 'week':
            filteredExpenses = filteredExpenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getTime() >= thisWeekStart.getTime();
            });
            break;
        case 'month':
            filteredExpenses = filteredExpenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getTime() >= thisMonthStart.getTime();
            });
            break;
    }
    
    // Calculate total for filtered expenses
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalAmount.textContent = formatCurrency(total);
    
    // Render expenses list
    if (filteredExpenses.length === 0) {
        expensesList.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-filter fa-3x text-muted mb-3"></i>
                <p>Tidak ada pengeluaran yang sesuai dengan filter saat ini</p>
                <button class="btn btn-sm btn-outline-secondary mt-2" data-filter="all">
                    Tampilkan Semua Pengeluaran
                </button>
            </div>
        `;
        return;
    }
    
    // Render the expenses
    expensesList.innerHTML = '';
    
    filteredExpenses.forEach((expense) => {
        const expenseElement = document.createElement('div');
        expenseElement.className = 'list-group-item expense-item';
        expenseElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="me-auto">
                    <div class="d-flex align-items-center">
                        <div class="me-2">
                            <span class="badge rounded-pill text-bg-light">
                                <i class="fas ${getCategoryIcon(expense.category)}"></i>
                            </span>
                        </div>
                        <div>
                            <h6 class="mb-0">${expense.name}</h6>
                            <small class="text-muted">${formatDate(expense.date)}</small>
                        </div>
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-bold">${formatCurrency(expense.amount)}</div>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary btn-sm edit-expense" data-id="${expense.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm delete-expense" data-id="${expense.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
            ${expense.notes ? `<small class="text-muted mt-1 d-block">${expense.notes}</small>` : ''}
        `;
        
        expensesList.appendChild(expenseElement);
    });
    
    // Add event listeners to edit and delete buttons
    addExpenseItemListeners();
}

// Add event listeners to expense item buttons
function addExpenseItemListeners() {
    // Edit expense buttons
    const editButtons = document.querySelectorAll('.edit-expense');
    editButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const expenseId = e.currentTarget.getAttribute('data-id');
            editExpense(expenseId);
        });
    });
    
    // Delete expense buttons
    const deleteButtons = document.querySelectorAll('.delete-expense');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const expenseId = e.currentTarget.getAttribute('data-id');
            deleteExpense(expenseId);
        });
    });
}

// Edit an expense
function editExpense(expenseId) {
    const expense = appState.expenses.find(exp => exp.id === expenseId);
    if (!expense) return;
    
    // TODO: Implement edit functionality with a modal
    alert('Fungsi edit akan segera hadir!');
}

// Delete an expense
function deleteExpense(expenseId) {
    if (confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) {
        db.collection('expenses').doc(expenseId).delete()
            .then(() => {
                console.log('Expense deleted:', expenseId);
                showNotification('Pengeluaran berhasil dihapus');
                
                // Refresh expenses list
                loadUserExpenses();
            })
            .catch((error) => {
                console.error('Error deleting expense:', error);
                showNotification('Gagal menghapus pengeluaran. Silakan coba lagi.', 'danger');
            });
    }
}