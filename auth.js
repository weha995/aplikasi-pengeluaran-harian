// Elemen DOM
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const userGreeting = document.getElementById('user-greeting');
const loginStatus = document.getElementById('login-status');

// Setup event listener autentikasi
document.addEventListener('DOMContentLoaded', () => {
    setupAuthListeners();
    
    // Set listener perubahan status autentikasi
    firebase.auth().onAuthStateChanged(handleAuthStateChange);
});

// Setup event listener terkait autentikasi
function setupAuthListeners() {
    // Klik tombol login
    loginButton.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                // Pengguna berhasil masuk
                console.log('Pengguna masuk:', result.user.displayName);
            })
            .catch((error) => {
                console.error('Error saat masuk:', error);
                showNotification('Gagal masuk. Silakan coba lagi.', 'danger');
            });
    });
    
    // Klik tombol logout
    logoutButton.addEventListener('click', () => {
        firebase.auth().signOut()
            .then(() => {
                console.log('Pengguna keluar');
            })
            .catch((error) => {
                console.error('Error saat keluar:', error);
                showNotification('Gagal keluar. Silakan coba lagi.', 'danger');
            });
    });
}

// Handle auth state changes
function handleAuthStateChange(user) {
    if (user) {
        // User is signed in
        appState.currentUser = user;
        
        // Update UI
        userGreeting.textContent = `Selamat Datang, ${user.displayName}`;
        loginStatus.textContent = `Masuk sebagai ${user.email}`;
        loginButton.classList.add('d-none');
        logoutButton.classList.remove('d-none');
        
        // Load user's expenses
        loadUserExpenses();
        
        // Show welcome notification
        showNotification(`Selamat datang kembali, ${user.displayName}!`);
    } else {
        // User is signed out
        appState.currentUser = null;
        
        // Update UI
        userGreeting.textContent = 'Selamat Datang, Tamu';
        loginStatus.textContent = 'Silakan masuk untuk menyimpan pengeluaran Anda';
        loginButton.classList.remove('d-none');
        logoutButton.classList.add('d-none');
        
        // Clear expenses list
        document.getElementById('expenses-list').innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-user-lock fa-3x text-muted mb-3"></i>
                <p>Silakan masuk untuk melihat pengeluaran Anda</p>
            </div>
        `;
        
        // Clear charts
        initCharts([]);
        
        // Reset total
        document.getElementById('total-amount').textContent = formatCurrency(0);
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return appState.currentUser !== null;
}