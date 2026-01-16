// Dashboard functionality

// Initialize dashboard
function initDashboard() {
    // Load dashboard data
    loadDashboardStats();
    loadRecentPayments();
    
    // Initialize revenue chart
    initRevenueChart();
}

// Load dashboard statistics
function loadDashboardStats() {
    // In a real application, you would fetch this data from Firestore
    // For demo purposes, we'll use mock data
    
    // Mock data for dashboard stats
    const mockStats = {
        totalCustomers: 245,
        pendingInvoices: 18,
        monthlyRevenue: 125000,
        collectionRate: 92
    };
    
    // Update UI with stats
    document.getElementById('total-customers').textContent = mockStats.totalCustomers;
    document.getElementById('pending-invoices').textContent = mockStats.pendingInvoices;
    document.getElementById('monthly-revenue').textContent = `৳${mockStats.monthlyRevenue.toLocaleString()}`;
    document.getElementById('collection-rate').textContent = `${mockStats.collectionRate}%`;
}

// Load recent payments
function loadRecentPayments() {
    const paymentsContainer = document.getElementById('recent-payments');
    
    // Mock recent payments data
    const mockPayments = [
        { customer: "John Smith", date: "2023-10-15", amount: 1500, status: "paid" },
        { customer: "Sarah Johnson", date: "2023-10-14", amount: 1200, status: "paid" },
        { customer: "Robert Brown", date: "2023-10-13", amount: 2000, status: "paid" },
        { customer: "Emily Davis", date: "2023-10-12", amount: 1800, status: "paid" },
        { customer: "Michael Wilson", date: "2023-10-11", amount: 1600, status: "pending" }
    ];
    
    // Clear loading message
    paymentsContainer.innerHTML = '';
    
    // Add payment items
    mockPayments.forEach(payment => {
        const paymentElement = document.createElement('div');
        paymentElement.className = 'activity-item';
        
        const statusClass = payment.status === 'paid' ? 'trend-up' : 'trend-down';
        const statusText = payment.status === 'paid' ? 'Paid' : 'Pending';
        
        paymentElement.innerHTML = `
            <div class="activity-info">
                <h4>${payment.customer}</h4>
                <p>${payment.date}</p>
            </div>
            <div class="activity-amount ${statusClass}">
                ৳${payment.amount.toLocaleString()} <span class="status-badge">${statusText}</span>
            </div>
        `;
        
        paymentsContainer.appendChild(paymentElement);
    });
}

// Initialize revenue chart
function initRevenueChart() {
    const ctx = document.getElementById('revenue-chart').getContext('2d');
    
    // Mock revenue data for the last 12 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueData = [85000, 92000, 105000, 110000, 115000, 120000, 118000, 125000, 130000, 128000, 135000, 140000];
    
    // Create chart
    const revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Monthly Revenue (৳)',
                data: revenueData,
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Revenue: ৳${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '৳' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
    
    // Handle chart period change
    document.getElementById('chart-period').addEventListener('change', function(e) {
        const period = parseInt(e.target.value);
        updateChartData(period, revenueChart);
    });
}

// Update chart data based on selected period
function updateChartData(period, chart) {
    // In a real app, you would fetch data based on the selected period
    // For demo, we'll just adjust the existing data
    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const allRevenue = [85000, 92000, 105000, 110000, 115000, 120000, 118000, 125000, 130000, 128000, 135000, 140000];
    
    const startIndex = Math.max(0, 12 - period);
    const selectedMonths = allMonths.slice(startIndex);
    const selectedRevenue = allRevenue.slice(startIndex);
    
    chart.data.labels = selectedMonths;
    chart.data.datasets[0].data = selectedRevenue;
    chart.update();
}

// Export functions for global use
window.initDashboard = initDashboard;
window.loadDashboardStats = loadDashboardStats;