const ADMIN_CREDENTIALS = {
    email: 'admin@cleaning.com',
    password: 'Admin123!'
};

const STORAGE_KEYS = {
    users: 'cleaning_users',
    currentUser: 'cleaning_current_user'
};

function getUsers() {
    const data = localStorage.getItem(STORAGE_KEYS.users);
    return data ? JSON.parse(data) : [];
}

function setUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.currentUser);
    return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
}

function showNotice(element, message, isError = true) {
    if (!element) return;
    element.textContent = message;
    element.style.display = 'block';
    element.style.color = isError ? '#b91c1c' : '#064e3b';
    element.style.background = isError ? '#fee2e2' : '#d1fae5';
    element.style.border = '1px solid ' + (isError ? '#fecaca' : '#86efac');
}

function hideNotice(element) {
    if (!element) return;
    element.style.display = 'none';
    element.textContent = '';
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function registerCustomer(form) {
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const firstName = form.first_name.value.trim();
    const lastName = form.last_name.value.trim();
    const companyName = form.company_name.value.trim();
    const phone = form.phone.value.trim();
    const notice = document.getElementById('register-error');

    hideNotice(notice);

    if (!validateEmail(email)) {
        showNotice(notice, 'Please enter a valid email address.');
        return;
    }
    if (password.length < 6) {
        showNotice(notice, 'Password must be at least 6 characters long.');
        return;
    }

    const users = getUsers();
    const existing = users.find((user) => user.email === email);
    if (existing) {
        showNotice(notice, 'This email is already registered. Please log in instead.');
        return;
    }

    const newUser = {
        email,
        password,
        first_name: firstName || 'Customer',
        last_name: lastName || '',
        company_name: companyName || 'N/A',
        phone: phone || 'N/A',
        invoices: [],
        service_requests: []
    };

    users.push(newUser);
    setUsers(users);
    setCurrentUser({...newUser, type: 'customer' });
    window.location.href = 'customer-dashboard.html';
}

function loginCustomer(form) {
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const notice = document.getElementById('login-error');

    hideNotice(notice);

    if (!validateEmail(email)) {
        showNotice(notice, 'Please enter a valid email address.');
        return;
    }

    const users = getUsers();
    const user = users.find((item) => item.email === email && item.password === password);
    if (!user) {
        showNotice(notice, 'Email or password is incorrect. Please try again.');
        return;
    }

    setCurrentUser({...user, type: 'customer' });
    window.location.href = 'customer-dashboard.html';
}

function loginAdmin(form) {
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const notice = document.getElementById('admin-error');

    hideNotice(notice);

    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
        showNotice(notice, 'Admin credentials are incorrect.');
        return;
    }

    setCurrentUser({ email, type: 'admin' });
    window.location.href = 'admin-dashboard.html';
}

function logout() {
    clearCurrentUser();
    window.location.href = 'Untitled-7.html';
}

function saveCurrentUserChanges(user) {
    if (!user || user.type !== 'customer') return;
    const users = getUsers();
    const index = users.findIndex((item) => item.email === user.email);
    if (index >= 0) {
        users[index] = user;
        setUsers(users);
    }
    setCurrentUser({...user, type: 'customer' });
}

function addServiceRequest(form) {
    const current = getCurrentUser();
    if (!current || current.type !== 'customer') {
        window.location.href = 'login.html';
        return;
    }

    const type = form.service_type.value;
    const date = form.requested_date.value || 'Flexible';
    const description = form.description.value.trim();
    const notice = document.getElementById('service-request-notice');

    hideNotice(notice);

    if (!type || !description) {
        showNotice(notice, 'Please select a service type and provide a description.', true);
        return;
    }

    const request = {
        id: Date.now(),
        service_type: type,
        requested_date: date,
        description,
        status: 'Pending'
    };

    current.service_requests = current.service_requests || [];
    current.service_requests.push(request);
    saveCurrentUserChanges(current);

    showNotice(notice, 'Your service request was submitted successfully.', false);
    form.reset();
    renderCustomerDashboard(current);
}

function renderCustomerDashboard(current) {
    if (!current) return;
    const welcome = document.getElementById('customer-welcome');
    const invoiceCount = document.getElementById('invoice-count');
    const pendingAmount = document.getElementById('pending-amount');
    const paidAmount = document.getElementById('paid-amount');
    const activeRequests = document.getElementById('active-requests');
    const infoName = document.getElementById('info-name');
    const infoCompany = document.getElementById('info-company');
    const infoEmail = document.getElementById('info-email');
    const infoPhone = document.getElementById('info-phone');

    const invoices = current.invoices || [];
    const requests = current.service_requests || [];
    const pending = invoices.filter((invoice) => invoice.status !== 'Paid').reduce((total, invoice) => total + parseFloat(invoice.amount || 0), 0);
    const paid = invoices.filter((invoice) => invoice.status === 'Paid').reduce((total, invoice) => total + parseFloat(invoice.amount || 0), 0);

    if (welcome) welcome.textContent = `Welcome, ${current.first_name || 'Customer'}!`;
    if (invoiceCount) invoiceCount.textContent = invoices.length.toString();
    if (pendingAmount) pendingAmount.textContent = `$${pending.toFixed(2)}`;
    if (paidAmount) paidAmount.textContent = `$${paid.toFixed(2)}`;
    if (activeRequests) activeRequests.textContent = requests.length.toString();

    if (infoName) infoName.textContent = `${current.first_name || '--'} ${current.last_name || ''}`.trim() || '-- Login to view --';
    if (infoCompany) infoCompany.textContent = current.company_name || '-- Login to view --';
    if (infoEmail) infoEmail.textContent = current.email || '-- Login to view --';
    if (infoPhone) infoPhone.textContent = current.phone || '-- Login to view --';

    const invoiceBody = document.getElementById('invoice-table-body');
    if (invoiceBody) {
        invoiceBody.innerHTML = '';
        if (invoices.length === 0) {
            invoiceBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px;"><div class="empty-state"><div class="empty-state-icon">📄</div><p>No invoices available yet. Add invoices from the admin portal.</p></div></td></tr>`;
        } else {
            invoices.forEach((invoice) => {
                invoiceBody.innerHTML += `<tr><td>${invoice.number}</td><td>${invoice.date}</td><td>$${parseFloat(invoice.amount).toFixed(2)}</td><td>${invoice.status}</td><td><span class="action-links">${invoice.status === 'Paid' ? 'Paid' : 'Pending'}</span></td></tr>`;
            });
        }
    }

    const requestBody = document.getElementById('request-table-body');
    if (requestBody) {
        requestBody.innerHTML = '';
        if (requests.length === 0) {
            requestBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px;"><div class="empty-state"><div class="empty-state-icon">🛠️</div><p>No service requests yet. Submit a request below to get started.</p></div></td></tr>`;
        } else {
            requests.forEach((request) => {
                requestBody.innerHTML += `<tr><td>${request.service_type.replace(/_/g, ' ')}</td><td>${request.description}</td><td>${request.requested_date}</td><td>${request.status}</td></tr>`;
            });
        }
    }
}

function ensureCustomerSession() {
    const current = getCurrentUser();
    if (!current || current.type !== 'customer') {
        const container = document.createElement('div');
        container.style.padding = '40px';
        container.style.textAlign = 'center';
        container.style.fontFamily = 'Arial, sans-serif';
        container.innerHTML = `<h1 style="font-size:2rem;margin-bottom:1rem;">Please log in to continue</h1><p style="margin-bottom:1.5rem;color:#4b5563;">You must sign in as a customer to access this dashboard.</p><a href="login.html" style="display:inline-block;padding:14px 24px;background:#2563eb;color:#fff;border-radius:10px;text-decoration:none;">Go to Customer Login</a>`;
        document.body.innerHTML = '';
        document.body.appendChild(container);
        return;
    }
    renderCustomerDashboard(current);
}

function acceptServiceRequest(customerEmail, requestIndex) {
    const users = getUsers();
    const customer = users.find(user => user.email === customerEmail);
    if (customer && customer.service_requests && customer.service_requests[requestIndex]) {
        customer.service_requests[requestIndex].status = 'Accepted';
        setUsers(users);
        ensureAdminSession(); // Refresh the dashboard
    }
}

function ensureAdminSession() {
    const current = getCurrentUser();
    if (!current || current.type !== 'admin') {
        const container = document.createElement('div');
        container.style.padding = '40px';
        container.style.textAlign = 'center';
        container.style.fontFamily = 'Arial, sans-serif';
        container.innerHTML = `<h1 style="font-size:2rem;margin-bottom:1rem;">Admin access required</h1><p style="margin-bottom:1.5rem;color:#4b5563;">Please sign in with the admin account to access this dashboard.</p><a href="admin-login.html" style="display:inline-block;padding:14px 24px;background:#2563eb;color:#fff;border-radius:10px;text-decoration:none;">Go to Admin Login</a>`;
        document.body.innerHTML = '';
        document.body.appendChild(container);
        return;
    }

    const stats = {
        totalCustomers: getUsers().length,
        totalInvoices: getUsers().reduce((acc, user) => acc + (user.invoices ? user.invoices.length : 0), 0),
        amountPaid: getUsers().reduce((acc, user) => acc + (user.invoices ? user.invoices.filter((invoice) => invoice.status === 'Paid').reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) : 0), 0),
        amountPending: getUsers().reduce((acc, user) => acc + (user.invoices ? user.invoices.filter((invoice) => invoice.status !== 'Paid').reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) : 0), 0),
        pendingRequests: getUsers().reduce((acc, user) => acc + (user.service_requests ? user.service_requests.filter((req) => req.status === 'Pending').length : 0), 0)
    };

    const totalCustomers = document.getElementById('admin-total-customers');
    const totalInvoices = document.getElementById('admin-total-invoices');
    const amountPaid = document.getElementById('admin-amount-paid');
    const amountPending = document.getElementById('admin-amount-pending');
    const pendingRequests = document.getElementById('admin-pending-requests');

    if (totalCustomers) totalCustomers.textContent = stats.totalCustomers.toString();
    if (totalInvoices) totalInvoices.textContent = stats.totalInvoices.toString();
    if (amountPaid) amountPaid.textContent = `$${stats.amountPaid.toFixed(2)}`;
    if (amountPending) amountPending.textContent = `$${stats.amountPending.toFixed(2)}`;
    if (pendingRequests) pendingRequests.textContent = stats.pendingRequests.toString();

    const customerBody = document.getElementById('admin-customer-body');
    const invoiceBody = document.getElementById('admin-invoice-body');
    const serviceRequestsBody = document.getElementById('admin-service-requests-body');
    const users = getUsers();


    if (customerBody) {
        customerBody.innerHTML = '';
        if (users.length === 0) {
            customerBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:18px; color:#6b7280;">No customers loaded yet.</td></tr>';
        } else {
            users.forEach((user) => {
                customerBody.innerHTML += `<tr><td>${user.company_name}</td><td>${user.first_name} ${user.last_name}</td><td>${user.email}</td><td>${new Date().toLocaleDateString()}</td></tr>`;
            });
        }
    }

    if (invoiceBody) {
        invoiceBody.innerHTML = '';
        const invoices = users.flatMap((user) => (user.invoices || []).map((invoice) => ({ customer: user.company_name, ...invoice })));
        if (invoices.length === 0) {
            invoiceBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:18px; color:#6b7280;">No invoices found yet.</td></tr>';
        } else {
            invoices.forEach((invoice) => {
                invoiceBody.innerHTML += `<tr><td>${invoice.number}</td><td>${invoice.customer}</td><td>$${parseFloat(invoice.amount).toFixed(2)}</td><td>${invoice.status}</td><td>${invoice.date}</td></tr>`;
            });
        }
    }

    if (serviceRequestsBody) {
        serviceRequestsBody.innerHTML = '';
        const allRequests = users.flatMap((user) => (user.service_requests || []).map((request, index) => ({ customer: user.company_name, customerEmail: user.email, requestIndex: index, ...request })));
        if (allRequests.length === 0) {
            serviceRequestsBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:18px; color:#6b7280;">No service requests yet.</td></tr>';
        } else {
            allRequests.forEach((request) => {
                const typeLabel = request.service_type.replace(/_/g, ' ').toUpperCase();
                const actions = request.status === 'Pending' ? `<button class="accept-btn" data-customer="${request.customerEmail}" data-index="${request.requestIndex}">Accept</button>` : '--';
                serviceRequestsBody.innerHTML += `<tr><td>${request.customer}</td><td>${typeLabel}</td><td>${request.description.substring(0, 50)}${request.description.length > 50 ? '...' : ''}</td><td>${request.requested_date}</td><td><span style="padding:4px 8px; background:#fff3cd; color:#856404; border-radius:4px; font-size:0.85rem;">${request.status}</span></td><td>${actions}</td></tr>`;
            });
        }

        // Add event listeners for accept buttons
        document.querySelectorAll('.accept-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const customerEmail = btn.getAttribute('data-customer');
                const index = parseInt(btn.getAttribute('data-index'));
                acceptServiceRequest(customerEmail, index);
            });
        });
    }
}

function submitInvoiceForm(form) {
    const current = getCurrentUser();
    if (!current || current.type !== 'admin') {
        window.location.href = 'admin-login.html';
        return;
    }

    const customerId = form.customer_id.value.trim();
    const invoiceNumber = form.invoice_number.value.trim();
    const description = form.description.value.trim();
    const amount = parseFloat(form.amount.value);
    const dueDate = form.due_date.value;
    const notice = document.getElementById('invoice-submit-notice');

    hideNotice(notice);

    if (!customerId || !invoiceNumber || !description || !dueDate || Number.isNaN(amount) || amount <= 0) {
        showNotice(notice, 'Please fill in every invoice field correctly.');
        return;
    }

    const users = getUsers();
    const customer = users.find((user) => user.email === customerId || user.company_name.toLowerCase() === customerId.toLowerCase());
    if (!customer) {
        showNotice(notice, 'Customer not found. Use the customer email or exact company name.');
        return;
    }

    customer.invoices = customer.invoices || [];
    customer.invoices.push({
        number: invoiceNumber,
        description,
        amount: amount.toFixed(2),
        date: dueDate,
        status: 'Pending'
    });

    setUsers(users);
    showNotice(notice, 'Invoice created successfully.', false);
    form.reset();
    ensureAdminSession();
}

window.logout = logout;
window.registerCustomer = registerCustomer;
window.loginCustomer = loginCustomer;
window.loginAdmin = loginAdmin;
window.addServiceRequest = addServiceRequest;
window.submitInvoiceForm = submitInvoiceForm;
window.acceptServiceRequest = acceptServiceRequest;

window.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            registerCustomer(registerForm);
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            loginCustomer(loginForm);
        });
    }

    const adminForm = document.getElementById('admin-login-form');
    if (adminForm) {
        adminForm.addEventListener('submit', (event) => {
            event.preventDefault();
            loginAdmin(adminForm);
        });
    }

    const serviceForm = document.getElementById('service-request-form');
    if (serviceForm) {
        serviceForm.addEventListener('submit', (event) => {
            event.preventDefault();
            addServiceRequest(serviceForm);
        });
    }

    const invoiceForm = document.getElementById('invoice-form');
    if (invoiceForm) {
        invoiceForm.addEventListener('submit', (event) => {
            event.preventDefault();
            submitInvoiceForm(invoiceForm);
        });
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    if (document.body.dataset.page === 'customer-dashboard') {
        ensureCustomerSession();
    }
    if (document.body.dataset.page === 'admin-dashboard') {
        ensureAdminSession();
    }
});