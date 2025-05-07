const socket = io('https://api.aif.uz')
const token = localStorage.getItem('token')
const categoriesBox = document.querySelector('.category-box')
const createForm = document.getElementById('create-form')
const updateForm = document.getElementById('update-form')


socket.emit('get-categories', { token })
socket.on('categories', ({ categories, error }) => {
    if (error) {
        alert('Failed to get meals: ' + (error?.message || error))
        return;
    }
    categoriesBox.innerHTML = '';
    categories.forEach(el => {
        const categoryItem = document.createElement("div");

        categoryItem.style = 'display: flex; justify-content: space-between;'

        categoryItem.className = "category";

        categoryItem.innerHTML = `<h3>${el.name}</h3> 
        <div><button onclick="openUpdateModal('${el.id}', '${el.name}', '${el.active}')">Update</button>
        <button onclick="openDeletePopup('${el.id}', '${el.name}', '${el.active}')">Delete</button></div>`;

        categoriesBox.appendChild(categoryItem)
    })
})


// Open and close functions for create form modal.
function openCreateModal() {
    document.getElementById('categories').style.display = 'none';
    document.getElementById('create').style.display = 'block';
}
function closeCreateModal() {
    createForm.reset();
    document.getElementById('create').style.display = 'none';
    document.getElementById('categories').style.display = 'block';
}

// Open and close functions for update form modal.
function openUpdateModal(id, name, active) {
    document.getElementById('updating-category-data-id').dataset.id = id;
    document.getElementById('name-in-update').value = name;
    if (active === 'true') {
        document.getElementById('active-in-update').innerHTML = `
            <option value="1">Yes</option>
            <option value="0">No</option>`
    } else {
        document.getElementById('active-in-update').innerHTML = `
            <option value="0">No</option>
            <option value="1">Yes</option>`
    }
    document.getElementById('categories').style.display = 'none';
    document.getElementById('update').style.display = 'block';
}
function closeUpdateModal() {
    document.getElementById('updating-category-data-id').removeAttribute('data-id')
    updateForm.reset();
    document.getElementById('update').style.display = 'none';
    document.getElementById('categories').style.display = 'block';
}

// Open and close functions for delete popup.
function openDeletePopup(id, name, active) {
    document.querySelector('.del-popup').style.display = 'flex'
    document.querySelector('.del-popup').dataset.id = id
    document.querySelector('.del-popup').innerHTML = `
    <div style="width: 100%; display: flex; justify-content: center;">
        <h3>Delete Category</h3>
    </div>
    <div style="width: 100%; display: flex; justify-content: center;">
        <p>${name}</p>
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
        const params = {
            name: document.getElementById('name-in-create').value,
            active: document.getElementById('active-in-create').value
        }
        const response = await fetch('https://api.aif.uz/category', {
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
            socket.emit('get-categories', { token });
        }
    } catch (error) {
        console.error(error)
    }
})

// Update category fetch function.
updateForm.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('updating-category-data-id').dataset.id
    const formData = {
        name: document.getElementById('name-in-update').value,
        active: Number(document.getElementById('active-in-update').value)
    }
    try {
        const response = await fetch(`https://api.aif.uz/category/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        const res = await response.json()
        if (res.status !== 'success') {
            alert('Failed to update category: ' + res.message || 'Unknown error!')
        }
        closeUpdateModal()
        socket.emit('update-menu')
        socket.emit('get-categories', { token })
    } catch (error) {
        alert('Error: ' + error || 'Unknown error')
    }
})

// Delete category fetch function.
async function deleteCategory() {
    const id = document.querySelector('.del-popup').dataset.id
    try {
        const response = await fetch(`https://api.aif.uz/category/${id}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await response.json()
        if (res.status !== 'success') { alert(res.message) }
        closeDeletePopup();
        document.querySelector('.del-popup').removeAttribute('data-id');
        socket.emit('update-menu')
        socket.emit('get-categories', { token });
    } catch (error) {
        console.error(error)
    }
}