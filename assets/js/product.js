const socket = io('https://api.aif.uz')
const token = localStorage.getItem('token')
const productsBox = document.querySelector('.products-box')
const createForm = document.getElementById('create-form')
const updateForm = document.getElementById('update-form')
let Categories = [];


// Products getting and render functions.
socket.emit('get-meals', { token });
socket.on('meals', ({ meals, error }) => {
    if (error) {
        alert('Failed to get meals: ' + (error?.message || error))
        return;
    }
    productsBox.innerHTML = '';
    meals.forEach(el => {
        const product = document.createElement("tr");
        product.className = "product";
        product.innerHTML = `
            <td class="product-image">
                <img src="${el.image_url}" alt="${el.name}">
            </td>
            <td class="product-name">
                <h2>${el.name}</h2>
            </td>
            <td class="product-price">
                <p>${el.price} so'm</p>
            </td>
            <td class="is-ready-meal">
                <p>${el.is_ready_product ? "Ha" : "Yo'q"}</p>
            </td>
            <td class="is-active-meal">
                <p>${el.active ? "Ha" : "Yo'q"}</p>
            </td>
            <td class="product-actions">
                <button class="update-btn" onclick="openUpdateModal('${el.id}', '${el.name}', '${el.price}', '${el.image_url}', '${el.category_id}', '${el.category_name}', '${el.active}', '${el.is_ready_product}')">
                    <i class="fa-regular fa-pen"></i>
                    Tahrirlash
                </button>
                <button class="delete-btn" onclick="openDeletePopup('${el.id}', '${el.name}', '${el.price}', '${el.image_url}', '${el.category_id}', '${el.category_name}', '${el.active}', '${el.is_ready_product}')">
                    <i class="fa-regular fa-trash"></i>
                    O'chirish
                </button>
                
            </td>
        `;
        productsBox.appendChild(product)
    })
});


// Categories getting and render functions.
socket.emit('get-categories', { token });
socket.on('categories', ({ categories, error }) => {
    if (error) {
        alert('Failed to get meals: ' + (error?.message || error))
        return;
    }
    Categories = categories
    renderCategories(Categories)
});
function renderCategories(Categories) {
    document.getElementById('category_id-in-create').innerHTML = `<option value="">Select category</option>`;
    for (const category of Categories) {
        const option = document.createElement('option')
        option.value = category.id
        option.textContent = category.name
        document.getElementById('category_id-in-create').appendChild(option)
    }
}


// Open and close functions for create modal.
function openCreateModal() {
    document.getElementById('products').style.display = 'none';
    document.getElementById('create').style.display = 'block';
}
function closeCreateModal() {
    document.getElementById('create-form').reset();
    document.getElementById('create').style.display = 'none';
    document.getElementById('products').style.display = 'block';
}

// Open and close functions for update modal.
function openUpdateModal(id, name, price, image_url, category_id, category_name, active, is_ready_product) {
    document.getElementById('products').style.display = 'none';
    document.getElementById('updating-product-data-id').dataset.id = id
    document.getElementById('name-in-update').value = name
    document.getElementById('price-in-update').value = price
    document.getElementById('category_id-in-update').innerHTML = `<option value="${category_id}">${category_name}</option>`;
    const categoriesWithoutCurrentCategory = Categories.filter(e => e.id != category_id)
    for (const category of categoriesWithoutCurrentCategory) {
        const option = document.createElement('option')
        option.value = category.id
        option.textContent = category.name
        document.getElementById('category_id-in-update').appendChild(option)
    }
    document.getElementById('is_ready_product-in-update').innerHTML = '';
    if (is_ready_product === 'true') {
        const optionYes = document.createElement('option')
        optionYes.value = 1
        optionYes.textContent = 'Yes'
        const optionNo = document.createElement('option')
        optionNo.value = 0
        optionNo.textContent = 'No'
        document.getElementById('is_ready_product-in-update').appendChild(optionYes)
        document.getElementById('is_ready_product-in-update').appendChild(optionNo)
    } else {
        const optionNo = document.createElement('option')
        optionNo.value = 0
        optionNo.textContent = 'No'
        const optionYes = document.createElement('option')
        optionYes.value = 1
        optionYes.textContent = 'Yes'
        document.getElementById('is_ready_product-in-update').appendChild(optionNo)
        document.getElementById('is_ready_product-in-update').appendChild(optionYes)
    }
    document.getElementById('active-in-update').innerHTML = '';
    if (active === 'true') {
        const optionYes = document.createElement('option')
        optionYes.value = 1
        optionYes.textContent = 'Yes'
        const optionNo = document.createElement('option')
        optionNo.value = 0
        optionNo.textContent = 'No'
        document.getElementById('active-in-update').appendChild(optionYes)
        document.getElementById('active-in-update').appendChild(optionNo)
    } else {
        const optionNo = document.createElement('option')
        optionNo.value = 0
        optionNo.textContent = 'No'
        const optionYes = document.createElement('option')
        optionYes.value = 1
        optionYes.textContent = 'Yes'
        document.getElementById('active-in-update').appendChild(optionNo)
        document.getElementById('active-in-update').appendChild(optionYes)
    }
    document.getElementById('update').style.display = 'block';
}
function closeUpdateModal() {
    document.getElementById('updating-product-data-id').removeAttribute('data-id')
    document.getElementById('update-form').reset();
    document.getElementById('update').style.display = 'none';
    document.getElementById('products').style.display = 'block';
}

// Open and close functions for delete popup.
function openDeletePopup(id, name, price, image_url, category_id, category_name, active, is_ready_product) {
    document.querySelector('.del-popup').style.display = 'flex';
    document.querySelector('.del-popup-background').classList.add("active");
    document.querySelector('.del-popup').classList.add("active");
    document.querySelector('.del-popup').dataset.id = id;
    document.querySelector('.del-popup').innerHTML = `
    <div class="del-title">
        <h3>Delete Product</h3>
    </div>
    <div class="del-img">
        <img src="${image_url}" alt="${name}">
    </div>
    <div class="del-name">
        <p>${name}</p>
    </div>
    <div class="del-actions">
        <button onclick="closeDeletePopup()">Cancel</button>
        <button onclick="deleteProduct()">Delete</button>
    </div>`;
}

function closeDeletePopup() {
    document.querySelector('.del-popup').style.display = 'none'
    document.querySelector('.del-popup').classList.remove("active");
    document.querySelector('.del-popup-background').classList.remove("active");
    document.querySelector('.del-popup').removeAttribute('data-id')
    document.querySelector('.del-popup').innerHTML = '';
}


// Create product fetch function.
createForm.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById('name-in-create').value);
    formData.append('price', document.getElementById('price-in-create').value);
    formData.append('category_id', document.getElementById('category_id-in-create').value);
    formData.append('is_ready_product', document.getElementById('is_ready_product-in-create').value);
    formData.append('active', document.getElementById('active-in-create').value);
    document.getElementById('image-in-create').value ? formData.append('image', document.getElementById('image-in-create').files[0]) : false
    try {
        const response = await fetch('https://api.aif.uz/meal', {
            method: 'POST', headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const res = await response.json();
        if (!response.ok) {
            alert('Failed to create meal: ' + (res.message || 'Unknown error'));
        } else {
            closeCreateModal()
            if (res.data.meal.active) { socket.emit('update-menu') }
            socket.emit('get-meals', { token });
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
})

// Update product fetch function.
updateForm.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById('name-in-update').value);
    formData.append('price', document.getElementById('price-in-update').value);
    formData.append('category_id', document.getElementById('category_id-in-update').value);
    formData.append('is_ready_product', document.getElementById('is_ready_product-in-update').value);
    formData.append('active', document.getElementById('active-in-update').value);
    document.getElementById('image-in-update').value ? formData.append('image', document.getElementById('image-in-update').files[0]) : false
    try {
        const product_id = document.getElementById('updating-product-data-id').dataset.id
        const response = await fetch(`https://api.aif.uz/meal/${product_id}`, {
            method: 'PUT', headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const res = await response.json();
        if (!response.ok) {
            alert('Failed to update product: ' + (res.message || 'Unknown error'));
        } else {
            closeUpdateModal()
            if (res.data.meal.active) { socket.emit('update-menu') }
            socket.emit('get-meals', { token });
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
})

// Delete product fetch function.
async function deleteProduct() {
    const id = document.querySelector('.del-popup').dataset.id
    try {
        const response = await fetch(`https://api.aif.uz/meal/${id}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await response.json()
        if (res.status !== 'success') { alert(res.message) }
        closeDeletePopup();
        socket.emit('update-menu')
        socket.emit('get-meals', { token });
    } catch (error) {
        console.error(error)
    }
}