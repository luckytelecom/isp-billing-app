// Customer management functionality

let customers = [];
let currentPage = 1;
const itemsPerPage = 10;
let editingCustomerId = null;

// Load customers from Firestore
async function loadCustomers() {
    try {
        const customersTable = document.getElementById('customers-table-body');
        customersTable.innerHTML = '<tr><td colspan="8" class="loading">Loading customers...</td></tr>';
        
        // Fetch customers from Firestore
        const querySnapshot = await db.collection('customers').get();
        
        customers = [];
        querySnapshot.forEach((doc) => {
            customers.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by date (newest first)
        customers.sort((a, b) => {
            return new Date(b.connectionDate) - new Date(a.connectionDate);
        });
        
        renderCustomersTable();
        updatePagination();
        
    } catch (error) {
        console.error("Error loading customers:", error);
        const customersTable = document.getElementById('customers-table-body');
        customersTable.innerHTML = '<tr><td colspan="8" class="error">Error loading customers. Please try again.</td></tr>';
    }
}

// Render customers table
function renderCustomersTable() {
    const customersTable = document.getElementById('customers-table-body');
    
    // Apply filters
    let filteredCustomers = [...customers];
    const searchTerm = document.getElementById('search-customers').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;
    const packageFilter = document.getElementById('filter-package').value;
    
    if (searchTerm) {
        filteredCustomers = filteredCustomers.filter(customer => 
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.email.toLowerCase().includes(searchTerm) ||
            customer.phone.includes(searchTerm)
        );
    }
    
    if (statusFilter) {
        filteredCustomers = filteredCustomers.filter(customer => 
            customer.status === statusFilter
        );
    }
    
    if (packageFilter) {
        filteredCustomers = filteredCustomers.filter(customer => 
            customer.package === packageFilter
        );
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
    
    // Clear table
    customersTable.innerHTML = '';
    
    if (paginatedCustomers.length === 0) {
        customersTable.innerHTML = '<tr><td colspan="8" class="no-data">No customers found.</td></tr>';
        return;
    }
    
    // Add rows
    paginatedCustomers.forEach(customer => {
        const row = document.createElement('tr');
        
        // Format date
        const joinDate = new Date(customer.connectionDate);
        const formattedDate = joinDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Status badge
        let statusClass = '';
        switch(customer.status) {
            case 'active':
                statusClass = 'status-active';
                break;
            case 'inactive':
                statusClass = 'status-inactive';
                break;
            case 'suspended':
                statusClass = 'status-suspended';
                break;
        }
        
        row.innerHTML = `
            <td>${customer.id.substring(0, 8)}</td>
            <td>
                <strong>${customer.name}</strong><br>
                <small>${customer.email}</small>
            </td>
            <td>${customer.phone}</td>
            <td>${customer.package}</td>
            <td>৳${customer.monthlyFee.toLocaleString()}</td>
            <td><span class="status-badge ${statusClass}">${customer.status}</span></td>
            <td>${formattedDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" onclick="viewCustomer('${customer.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="editCustomer('${customer.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteCustomer('${customer.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        customersTable.appendChild(row);
    });
}

// Open customer modal for adding/editing
function openCustomerModal(customerId = null) {
    const modal = document.getElementById('customer-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('customer-form');
    
    if (customerId) {
        // Edit mode
        modalTitle.textContent = 'Edit Customer';
        editingCustomerId = customerId;
        
        // Find customer
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            // Fill form with customer data
            document.getElementById('customer-name').value = customer.name || '';
            document.getElementById('customer-email').value = customer.email || '';
            document.getElementById('customer-phone').value = customer.phone || '';
            document.getElementById('customer-nid').value = customer.nid || '';
            document.getElementById('customer-address').value = customer.address || '';
            document.getElementById('customer-package').value = customer.package || '';
            document.getElementById('customer-monthly-fee').value = customer.monthlyFee || '';
            
            // Format date for input
            const connectionDate = new Date(customer.connectionDate);
            const formattedDate = connectionDate.toISOString().split('T')[0];
            document.getElementById('customer-connection-date').value = formattedDate;
            
            document.getElementById('customer-status').value = customer.status || 'active';
            document.getElementById('customer-notes').value = customer.notes || '';
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Customer';
        editingCustomerId = null;
        form.reset();
        
        // Set default values
        document.getElementById('customer-connection-date').valueAsDate = new Date();
        document.getElementById('customer-status').value = 'active';
    }
    
    modal.style.display = 'block';
}

// Save customer (add or update)
async function saveCustomer(event) {
    event.preventDefault();
    
    // Get form data
    const customerData = {
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value,
        nid: document.getElementById('customer-nid').value,
        address: document.getElementById('customer-address').value,
        package: document.getElementById('customer-package').value,
        monthlyFee: parseInt(document.getElementById('customer-monthly-fee').value) || 0,
        connectionDate: document.getElementById('customer-connection-date').value,
        status: document.getElementById('customer-status').value,
        notes: document.getElementById('customer-notes').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        // Get save button
        const saveBtn = document.getElementById('save-customer-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;
        
        if (editingCustomerId) {
            // Update existing customer
            await db.collection('customers').doc(editingCustomerId).update(customerData);
            alert('Customer updated successfully!');
        } else {
            // Add new customer
            customerData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('customers').add(customerData);
            alert('Customer added successfully!');
        }
        
        // Close modal and refresh data
        document.getElementById('customer-modal').style.display = 'none';
        loadCustomers();
        
        // Reset button
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        
    } catch (error) {
        console.error("Error saving customer:", error);
        alert('Error saving customer. Please try again.');
        
        // Reset button
        const saveBtn = document.getElementById('save-customer-btn');
        saveBtn.innerHTML = 'Save Customer';
        saveBtn.disabled = false;
    }
}

// View customer details
function viewCustomer(customerId) {
    // In a real app, you might open a detailed view modal
    alert(`View customer ${customerId}`);
}

// Edit customer
function editCustomer(customerId) {
    openCustomerModal(customerId);
}

// Delete customer with confirmation
async function deleteCustomer(customerId) {
    if (!confirm('Are you sure you want to delete this customer?')) {
        return;
    }
    
    try {
        await db.collection('customers').doc(customerId).delete();
        alert('Customer deleted successfully!');
        loadCustomers();
    } catch (error) {
        console.error("Error deleting customer:", error);
        alert('Error deleting customer. Please try again.');
    }
}

// Update pagination
function updatePagination() {
    const totalCustomers = customers.length;
    const totalPages = Math.ceil(totalCustomers / itemsPerPage);
    
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages || totalPages === 0;
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
}

// Event listeners for pagination
document.addEventListener('DOMContentLoaded', function() {
    // Previous page
    document.getElementById('prev-page').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderCustomersTable();
            updatePagination();
        }
    });
    
    // Next page
    document.getElementById('next-page').addEventListener('click', function() {
        const totalPages = Math.ceil(customers.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderCustomersTable();
            updatePagination();
        }
    });
    
    // Search input
    document.getElementById('search-customers').addEventListener('input', function() {
        currentPage = 1;
        renderCustomersTable();
        updatePagination();
    });
    
    // Filter selectors
    document.getElementById('filter-status').addEventListener('change', function() {
        currentPage = 1;
        renderCustomersTable();
        updatePagination();
    });
    
    document.getElementById('filter-package').addEventListener('change', function() {
        currentPage = 1;
        renderCustomersTable();
        updatePagination();
    });
    
    // Clear filters
    document.getElementById('clear-filters-btn').addEventListener('click', function() {
        document.getElementById('search-customers').value = '';
        document.getElementById('filter-status').value = '';
        document.getElementById('filter-package').value = '';
        currentPage = 1;
        renderCustomersTable();
        updatePagination();
    });
    
    // Customer form submission
    document.getElementById('customer-form').addEventListener('submit', saveCustomer);
});

// Export customers to CSV
function exportCustomersToCSV() {
    if (customers.length === 0) {
        alert('No customers to export.');
        return;
    }
    
    // Create CSV header
    let csv = 'ID,Name,Email,Phone,Address,Package,Monthly Fee,Status,Connection Date\n';
    
    // Add customer data
    customers.forEach(customer => {
        csv += `"${customer.id}","${customer.name}","${customer.email}","${customer.phone}","${customer.address}","${customer.package}","${customer.monthlyFee}","${customer.status}","${customer.connectionDate}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Initialize export button
document.addEventListener('DOMContentLoaded', function() {
    const exportBtn = document.getElementById('export-customers-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportCustomersToCSV);
    }
});

// CSS for table actions (add to style.css)
const actionStyles = `
.action-buttons {
    display: flex;
    gap: 5px;
}

.btn-icon {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.btn-view {
    background-color: #4CAF50;
    color: white;
}

.btn-edit {
    background-color: #2196F3;
    color: white;
}

.btn-delete {
    background-color: #f44336;
    color: white;
}

.btn-icon:hover {
    opacity: 0.8;
    transform: translateY(-1px);
}

.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
}

.status-active {
    background-color: #d4edda;
    color: #155724;
}

.status-inactive {
    background-color: #fff3cd;
    color: #856404;
}

.status-suspended {
    background-color: #f8d7da;
    color: #721c24;
}
`;

// Add styles to page
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = actionStyles;
    document.head.appendChild(style);
});
