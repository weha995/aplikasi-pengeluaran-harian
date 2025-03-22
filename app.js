// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDG6nTlQe6XqD_a0ZLC8aRrjofpYKmQxVc",
    authDomain: "dompet-b2306.firebaseapp.com",
    projectId: "dompet-b2306",
    storageBucket: "dompet-b2306.firebasestorage.app",
    messagingSenderId: "376331917453",
    appId: "1:376331917453:web:7864405d74a0a65a97aac4"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);

// Inisialisasi layanan
const auth = firebase.auth();
const db = firebase.firestore();

// Status aplikasi global
const appState = {
    currentUser: null,
    expenses: [],
    filter: 'all'
};

// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplikasi Pengeluaran Harian dimuat!');
    
    // Set tanggal hari ini sebagai default dalam input tanggal
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expense-date').value = today;
    
    // Inisialisasi event listener
    setupEventListeners();
    
    // Inisialisasi tooltips dan popovers jika diperlukan
    setupTooltips();
});

// Setup event listener umum
function setupEventListeners() {
    // Handler dropdown filter
    const filterLinks = document.querySelectorAll('[data-filter]');
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const filterType = e.target.getAttribute('data-filter');
            appState.filter = filterType;
            document.getElementById('filterDropdown').textContent = e.target.textContent;
            refreshExpensesList();
        });
    });
}

// Setup Bootstrap tooltips jika diperlukan
function setupTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Format currency (IDR)
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date to readable string
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Mendapatkan ikon kategori berdasarkan nama kategori
function getCategoryIcon(category) {
    const icons = {
        'food': 'fa-utensils',
        'transportation': 'fa-car',
        'entertainment': 'fa-film',
        'utilities': 'fa-bolt',
        'shopping': 'fa-shopping-bag',
        'health': 'fa-heartbeat',
        'education': 'fa-graduation-cap',
        'other': 'fa-question-circle'
    };
    
    return icons[category] || 'fa-receipt';
}

// Mendapatkan warna kategori berdasarkan nama kategori
function getCategoryColor(category) {
    const colors = {
        'food': '#FF5733',
        'transportation': '#3498DB',
        'entertainment': '#9B59B6',
        'utilities': '#F1C40F',
        'shopping': '#2ECC71',
        'health': '#E74C3C',
        'education': '#34495E',
        'other': '#95A5A6'
    };
    
    return colors[category] || '#777777';
}

// Menampilkan notifikasi
function showNotification(message, type = 'success') {
    // Membuat elemen notifikasi
    const notification = document.createElement('div');
    notification.className = `toast align-items-center text-white bg-${type} border-0`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.setAttribute('aria-atomic', 'true');
    
    notification.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Menambahkan ke DOM
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.appendChild(notification);
    document.body.appendChild(toastContainer);
    
    // Menampilkan notifikasi
    const toast = new bootstrap.Toast(notification, { autohide: true, delay: 3000 });
    toast.show();
    
    // Menghapus dari DOM setelah disembunyikan
    notification.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toastContainer);
    });
}

// Export functions and variables to be used in other scripts
window.appState = appState;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.getCategoryIcon = getCategoryIcon;
window.getCategoryColor = getCategoryColor;
window.showNotification = showNotification;