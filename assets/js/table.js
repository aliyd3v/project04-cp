const socket = io('https://api.aif.uz')
const token = localStorage.getItem('token')
const tablesBox = document.querySelector('.table-box')
const createForm = document.getElementById('create-form')
const updateForm = document.getElementById('update-form')


socket.emit('get-tables', { token })
socket.on('tables', ({ tables, error }) => {
    if (error) {
        alert('Failed to get meals: ' + (error.message || error))
        return;
    }
    tablesBox.innerHTML = '';
    tables.forEach(el => {
        const tableItem = document.createElement("div");

        tableItem.style = 'display: flex; justify-content: space-between;'

        tableItem.className = "category";

        tableItem.innerHTML = `<h3>${el.number}</h3> 
        <div><button onclick="openUpdateModal('${el.id}', '${el.number}')">Update</button>
        <button onclick="openDeletePopup('${el.id}', '${el.number}')">Delete</button></div>`;

        tablesBox.appendChild(tableItem)
    })
})


// Open and close functions for create form modal.
function openCreateModal() {
    document.getElementById('tables').style.display = 'none';
    document.getElementById('create').style.display = 'block';
}
function closeCreateModal() {
    createForm.reset();
    document.getElementById('create').style.display = 'none';
    document.getElementById('tables').style.display = 'block';
}

// Open and close functions for update form modal.
function openUpdateModal(id, number) {
    document.getElementById('updating-table-data-id').dataset.id = id;
    document.getElementById('number-in-update').value = number;
    document.getElementById('tables').style.display = 'none';
    document.getElementById('update').style.display = 'block';
}
function closeUpdateModal() {
    document.getElementById('updating-table-data-id').removeAttribute('data-id')
    updateForm.reset();
    document.getElementById('update').style.display = 'none';
    document.getElementById('tables').style.display = 'block';
}

// Open and close functions for delete popup.
function openDeletePopup(id, number) {
    document.querySelector('.del-popup').style.display = 'flex'
    document.querySelector('.del-popup').dataset.id = id
    document.querySelector('.del-popup').innerHTML = `
    <div style="width: 100%; display: flex; justify-content: center;">
        <h3>Delete Category</h3>
    </div>
    <div style="width: 100%; display: flex; justify-content: center;">
        <p>${number}</p>
    </div>
    <div style="width: 100%;  display: flex; justify-content: center;">
        <button onclick="closeDeletePopup()">Cancel</button>
        <button onclick="deleteCategory()">Delete</button>
    </div>`;
}
function closeDeletePopup() {
    document.querySelector('.del-popup').style.display = 'none'
    document.querySelector('.del-popup').removeAttribute('data-id')
    document.querySelector('.del-popup').innerHTML = '';
}


// Create category fetch function.
createForm.addEventListener('submit', async e => {
    e.preventDefault();
    try {
        const params = { number: document.getElementById('number-in-create').value }
        const response = await fetch('https://api.aif.uz/table', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });
        const res = await response.json();
        if (res.status !== 'success') {
            alert('Failed : ' + res.message)
        } else {
            closeCreateModal();
            socket.emit('get-tables', { token });
        }
    } catch (error) {
        console.error(error)
    }
})

// Update category fetch function.
updateForm.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('updating-table-data-id').dataset.id
    const formData = { number: document.getElementById('number-in-update').value }
    try {
        const response = await fetch(`https://api.aif.uz/table/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        const res = await response.json()
        if (!response.ok) {
            alert('Failed to update category: ' + res.message || 'Unknown error!')
        }
        closeUpdateModal()
        socket.emit('get-tables', { token })
    } catch (error) {
        alert('Error: ' + error || 'Unknown error')
    }
})

// Delete category fetch function.
async function deleteCategory() {
    const id = document.querySelector('.del-popup').dataset.id
    try {
        const response = await fetch(`https://api.aif.uz/table/${id}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await response.json()
        if (res.status !== 'success') { alert(res.message) }
        closeDeletePopup();
        document.querySelector('.del-popup').removeAttribute('data-id');
        socket.emit('get-tables', { token });
    } catch (error) {
        console.error(error)
    }
}