// const socket = io('https://api.aif.uz')
const token = localStorage.getItem('token')
const userBox = document.querySelector('.user-box')
const createForm = document.getElementById('create-form')
const updateForm = document.getElementById('update-form')
const updatePassForm = document.getElementById('update-pass-form')
let Users = []

// Getting users with fetch.
async function getUsers() {
    try {
        const response = await fetch('https://api.aif.uz/user', {
            method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await response.json();
        if (res.status != 'success') {
            alert(res.message)
        } else {
            Users = res.data.users
            renderUsers(res.data.users)
        }
    } catch (error) {
        console.error
    }
}

// Render users.
function renderUsers(Users) {
    userBox.innerHTML = '';
    Users.forEach(el => {
        const userItem = document.createElement("div");

        userItem.style = 'display: flex; justify-content: space-between;'

        userItem.className = "category";

        userItem.innerHTML = `<h3>${el.name}</h3> 
            <div><button onclick="openUpdateModal('${el.id}', '${el.name}', '${el.username}', '${el.role}', '${el.gender}')">Update</button>
            <button onclick="openDeletePopup('${el.id}', '${el.name}', '${el.username}', '${el.role}', '${el.gender}')">Delete</button></div>`;

        userBox.appendChild(userItem)
    })
}


// Open and close functions for create form modal.
function openCreateModal() {
    document.getElementById('users').style.display = 'none';
    document.getElementById('create').style.display = 'block';
}
function closeCreateModal() {
    createForm.reset();
    document.getElementById('create').style.display = 'none';
    document.getElementById('users').style.display = 'block';
}

// Open and close functions for update form modal.
function openUpdateModal(id, name, username, role, gender) {
    document.getElementById('updating-user-data-id').dataset.id = id;
    document.getElementById('name-in-update').value = name
    document.getElementById('username-in-update').value = username
    // Render first current role after other roles.
    const Roles = ['Admin', 'Chef', 'Cook', 'Waiter', 'Waitress']
    let roleSelectHtml = `<option value="${role}">${role}</option>`
    for (const r of Roles)
        if (r !== role) roleSelectHtml += `<option value="${r}">${r}</option>`;
    document.getElementById('role-in-update').innerHTML = roleSelectHtml
    if (gender === 'Male')
        document.getElementById('gender-in-update').innerHTML = `
            <option value="Male">Male</option>
            <option value="Female">Female</option>`;
    else
        document.getElementById('gender-in-update').innerHTML = `
        <option value="Female">Female</option>
        <option value="Male">Male</option>`;
    document.getElementById('users').style.display = 'none';
    document.getElementById('update').style.display = 'block';
}
function closeUpdateModal() {
    document.getElementById('updating-user-data-id').removeAttribute('data-id')
    updateForm.reset();
    document.getElementById('update').style.display = 'none';
    document.getElementById('users').style.display = 'block';
}

// Open and close functions for delete popup.
function openDeletePopup(id, name, username, role, gender) {
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
        <button onclick="deleteUser()">Delete</button>
    </div>`;
}
function closeDeletePopup() {
    document.querySelector('.del-popup').style.display = 'none'
    document.querySelector('.del-popup').removeAttribute('data-id')
    document.querySelector('.del-popup').innerHTML = '';
}

// Open and close functions form update password popup.
function openUpdatePassPopup() {
    document.querySelector('.update-pass-popup').style.display = 'block'
}
function closeUpdatePassPopup() {
    document.querySelector('.update-pass-popup').style.display = 'none'
}


// Create user fetch function.
createForm.addEventListener('submit', async e => {
    e.preventDefault();
    try {
        const params = {
            name: document.getElementById('name-in-create').value,
            username: document.getElementById('username-in-create').value,
            password: document.getElementById('password-in-create').value,
            role: document.getElementById('role-in-create').value,
            gender: document.getElementById('gender-in-create').value,
        }
        const response = await fetch('https://api.aif.uz/user', {
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
            getUsers()
        }
    } catch (error) {
        console.error(error)
    }
})

// Update user fetch function.
updateForm.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('updating-user-data-id').dataset.id
    const formData = {
        name: document.getElementById('name-in-update').value,
        username: document.getElementById('username-in-update').value,
        role: document.getElementById('role-in-update').value,
        gender: document.getElementById('gender-in-update').value
    }
    try {
        const response = await fetch(`https://api.aif.uz/user/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        const res = await response.json()
        if (!response.ok) {
            alert('Failed to update user: ' + res.message || 'Unknown error!')
        }
        closeUpdateModal()
        getUsers()
    } catch (error) {
        alert('Error: ' + error || 'Unknown error')
    }
})

// Delete user fetch function.
async function deleteUser() {
    const id = document.querySelector('.del-popup').dataset.id
    try {
        const response = await fetch(`https://api.aif.uz/user/${id}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await response.json()
        if (res.status !== 'success') { alert(res.message) }
        closeDeletePopup();
        document.querySelector('.del-popup').removeAttribute('data-id');
        getUsers()
    } catch (error) {
        console.error(error)
    }
}

// Update password fetch function.
updatePassForm.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('updating-user-data-id').dataset.id
    try {
        const response = await fetch(`https://api.aif.uz/user/${id}`, {
            method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await response.json()
        if (res.status !== 'success') { alert(res.message) }
        closeUpdatePassPopup();
    } catch (error) {
        console.error(error)
    }
})



document.addEventListener("DOMContentLoaded", getUsers);