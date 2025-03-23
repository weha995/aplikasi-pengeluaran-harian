// Objek grafik
let categoryChart = null;
let dailyChart = null;

// Inisialisasi grafik
document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi grafik kosong
    initCharts([]);
});

// Inisialisasi grafik dengan data
function initCharts(expenses) {
    initCategoryChart(expenses);
    initDailyChart(expenses);
}

// Inisialisasi grafik distribusi kategori
function initCategoryChart(expenses) {
    const ctx = document.getElementById('category-chart').getContext('2d');
    
    // Mengelompokkan pengeluaran berdasarkan kategori
    const categoryData = {};
    
    expenses.forEach(expense => {
        if (categoryData[expense.category]) {
            categoryData[expense.category] += expense.amount;
        } else {
            categoryData[expense.category] = expense.amount;
        }
    });
    
    // Menyiapkan data untuk grafik
    const labels = [];
    const data = [];
    const backgroundColor = [];
    
    for (const category in categoryData) {
        labels.push(getCategoryLabel(category));
        data.push(categoryData[category]);
        backgroundColor.push(getCategoryColor(category));
    }
    
    // Jika grafik sudah ada, hancurkan terlebih dahulu
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    // Membuat grafik baru
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Inisialisasi grafik harian
function initDailyChart(expenses) {
    const ctx = document.getElementById('daily-chart').getContext('2d');
    
    // Mendapatkan 7 hari terakhir
    const dates = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    
    // Menyiapkan data untuk grafik
    const dailyData = {};
    
    // Inisialisasi semua tanggal dengan 0
    dates.forEach(date => {
        dailyData[date] = 0;
    });
    
    // Mengumpulkan data pengeluaran harian
    expenses.forEach(expense => {
        if (dailyData[expense.date] !== undefined) {
            dailyData[expense.date] += expense.amount;
        }
    });
    
    // Mengonversi data untuk grafik
    const chartData = dates.map(date => {
        return {
            x: formatDate(date),
            y: dailyData[date]
        };
    });
    
    // Jika grafik sudah ada, hancurkan terlebih dahulu
    if (dailyChart) {
        dailyChart.destroy();
    }
    
    // Membuat grafik baru
    dailyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: [{
                label: 'Pengeluaran Harian',
                data: chartData,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Pengeluaran: ${formatCurrency(context.raw.y)}`;
                        }
                    }
                }
            }
        }
    });
}

// Memperbarui grafik dengan data baru
function updateCharts() {
    initCharts(appState.expenses);
}

// Mendapatkan label kategori dalam Bahasa Indonesia
function getCategoryLabel(category) {
    const labels = {
        'food': 'Makanan & Minuman',
        'transportation': 'Transportasi',
        'entertainment': 'Hiburan',
        'utilities': 'Tagihan & Utilitas',
        'shopping': 'Belanja',
        'health': 'Kesehatan',
        'education': 'Pendidikan',
        'other': 'Lainnya'
    };
    
    return labels[category] || 'Lainnya';
}