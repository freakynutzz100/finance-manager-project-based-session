const API_URL = '/api/transactions';

document.addEventListener('DOMContentLoaded', () => {
    fetchTransactions();

    const form = document.getElementById('entry-form');
    form.addEventListener('submit', handleFormSubmit);

    const cancelBtn = document.getElementById('cancel-btn');
    cancelBtn.addEventListener('click', resetForm);
});

let transactionsList = [];

// Fetch all transactions from the API
function fetchTransactions() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            transactionsList = data;
            renderUI();
        })
        .catch(err => console.error('Error fetching transactions:', err));
}

// Render both tables and calculate totals
function renderUI() {
    const incomeList = document.getElementById('income-list');
    const expenseList = document.getElementById('expense-list');

    // Clear lists
    incomeList.innerHTML = '';
    expenseList.innerHTML = '';

    let totalIncome = 0;
    let totalExpense = 0;

    transactionsList.forEach(item => {
        const row = document.createElement('tr');
        
        // Build table row cells
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.description}</td>
            <td>${item.amount.toFixed(2)}</td>
            <td>
                <button class="action-btn" onclick="editTransaction(${item.id})">Edit</button>
                <button class="action-btn" onclick="deleteTransaction(${item.id})">Delete</button>
            </td>
        `;

        if (item.type === 'INCOME') {
            incomeList.appendChild(row);
            totalIncome += item.amount;
        } else if (item.type === 'EXPENSE') {
            expenseList.appendChild(row);
            totalExpense += item.amount;
        }
    });

    // Update Summary
    document.getElementById('total-income').innerText = totalIncome.toFixed(2);
    document.getElementById('total-expense').innerText = totalExpense.toFixed(2);

    const netLabel = document.getElementById('net-label');
    const netValue = document.getElementById('net-value');

    const netDiff = totalIncome - totalExpense;
    if (netDiff >= 0) {
        netLabel.innerText = 'Net Profit';
        netValue.innerText = netDiff.toFixed(2);
    } else {
        netLabel.innerText = 'Net Loss';
        netValue.innerText = Math.abs(netDiff).toFixed(2);
    }
}

// Handle Form Submit (Add or Update)
function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('entry-id').value;
    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    const transactionData = { description, amount, type };

    if (id) {
        // Update existing entry
        fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
        })
        .then(response => {
            if (response.ok) {
                resetForm();
                fetchTransactions();
            } else {
                alert('Failed to update entry');
            }
        })
        .catch(err => console.error('Error updating transaction:', err));
    } else {
        // Create new entry
        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
        })
        .then(response => {
            if (response.ok) {
                resetForm();
                fetchTransactions();
            } else {
                alert('Failed to save entry');
            }
        })
        .catch(err => console.error('Error creating transaction:', err));
    }
}

// Edit entry (populate form)
window.editTransaction = function(id) {
    const item = transactionsList.find(t => t.id === id);
    if (!item) return;

    document.getElementById('entry-id').value = item.id;
    document.getElementById('description').value = item.description;
    document.getElementById('amount').value = item.amount;
    document.getElementById('type').value = item.type;

    document.getElementById('form-title').innerText = 'Edit Entry';
    document.getElementById('save-btn').innerText = 'Save Changes';
    document.getElementById('cancel-btn').style.display = 'inline-block';
};

// Delete entry
window.deleteTransaction = function(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                fetchTransactions();
            } else {
                alert('Failed to delete entry');
            }
        })
        .catch(err => console.error('Error deleting transaction:', err));
    }
};

// Reset form to Add mode
function resetForm() {
    document.getElementById('entry-id').value = '';
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('type').value = 'INCOME';

    document.getElementById('form-title').innerText = 'Add New Entry';
    document.getElementById('save-btn').innerText = 'Save Entry';
    document.getElementById('cancel-btn').style.display = 'none';
}
