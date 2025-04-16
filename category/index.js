const socket = io('http://192.168.0.113:7777')
const token = localStorage.getItem('token')
const categoriesContainer = document.getElementById('categories-container')
const categoryDelBtn = document.getElementById('category-del-btn')
const closeDelBtn = document.getElementById('close-del-btn')
const delPopup = document.querySelector('.del-popup')
const updateFormContainer = document.getElementById('update-form-container')
const closeBtn = document.getElementById('close-btn')
const closeDelPopup = document.getElementById('close-del-btn')
const updateForm = document.getElementById('update-form')

socket.emit('get-categories', { token })

socket.on('categories', ({ categories, error }) => {
    if (error) {
        alert('Failed to get meals: ' + (error?.message || error))
        return;
    }

    categoriesContainer.innerHTML = '';

    categories.forEach(el => {
        let div = document.createElement('div')
        let name = document.createElement('p')
        let nameBold = document.createElement('b')
        nameBold.textContent = el.name
        name.textContent = `Category name: `
        name.appendChild(nameBold)

        let active = document.createElement('p')
        let bold = document.createElement('b')
        bold.textContent = `${el.active ? 'Active' : 'Not active'}`
        bold.style = `color: ${el.active ? 'blue' : 'red'};`
        active.textContent = `Status: `
        active.appendChild(bold)

        // Change status buttons.
        let unactivateBtn = document.createElement('button')
        unactivateBtn.textContent = 'Unactivate'
        unactivateBtn.style = 'font-weight: bold; color: red;'
        let activateBtn = document.createElement('button')
        activateBtn.textContent = 'Activate'
        activateBtn.style = 'font-weight: bold; color: blue;'
        el.active ? activateBtn.classList.toggle('hidden') : unactivateBtn.classList.toggle('hidden');
        (el.active ? unactivateBtn : activateBtn).addEventListener('click', async event => {
            event.preventDefault();
            await changeStatus(el);
            socket.emit('get-categories', { token })
        })

        let updateBtn = document.createElement('button')
        updateBtn.textContent = 'Update'
        updateBtn.style = 'font-weight: bold;'
        updateBtn.addEventListener('click', async event => {
            event.preventDefault();

            updateFormContainer.dataset.id = el.id
            document.getElementById('name').value = el.name
            document.getElementById('active').value = el.active ? 1 : 0;

            // Unhide.
            updateFormContainer.classList.remove('hidden')
        })

        let delBtn = document.createElement('button')
        delBtn.textContent = 'Delete'
        delBtn.style = 'font-weight: bold;'
        delBtn.addEventListener('click', event => {
            event.preventDefault();
            delPopup.dataset.id = el.id;
            delPopup.classList.remove('hidden')
        })

        div.appendChild(name)
        div.appendChild(active)
        div.appendChild(activateBtn)
        div.appendChild(unactivateBtn)
        div.appendChild(updateBtn)
        div.appendChild(delBtn)

        categoriesContainer.appendChild(div)
    })

})

// Update form Pop-up close.
closeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    updateFormContainer.classList.toggle('hidden')
    updateFormContainer.removeAttribute('data-id');
    document.getElementById('name').value = '';
    document.getElementById('active').value = '';
})

// Close del pop-up.
closeDelPopup.addEventListener('click', (event) => {
    event.preventDefault();

    delPopup.classList.toggle('hidden')
    delPopup.removeAttribute('data-id')
})

// Delete category.
categoryDelBtn.addEventListener('click', async event => {
    event.preventDefault();
    const id = delPopup.dataset.id
    try {
        const response = await fetch(
            `http://192.168.0.113:7777/category/${id}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        const res = await response.json();
        if (!response.ok) {
            alert('Failed to delete category: ' + (res.message || 'Unknown error!'))
        }
        socket.emit('update-menu')
        delPopup.removeAttribute('data-id');
        delPopup.classList.toggle('hidden')
        socket.emit('get-categories', { token })
    } catch (error) {
        alert('Error: ' + (error.message || 'Unknown error!'))
    }
})

// Update category.
updateForm.addEventListener('submit', async event => {
    event.preventDefault();

    const id = updateFormContainer.dataset.id
    const formData = {
        name: document.getElementById('name').value,
        active: Number(document.getElementById('active').value)
    }
    try {
        const response = await fetch(
            `http://192.168.0.113:7777/category/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            }
        )
        const res = await response.json()

        if (!response.ok) {
            alert('Failed to update category: ' + res.message || 'Unknown error!')
        }

        socket.emit('update-menu')
        updateFormContainer.classList.toggle('hidden')
        socket.emit('get-categories', { token })

    } catch (error) {
        alert('Error: ' + error || 'Unknown error')
    }
})

// Change status function.
const changeStatus = async el => {
    try {
        const response = await fetch(
            `http://192.168.0.113:7777/category/${el.id}/change-status`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        )
        const res = await response.json()
        if (!response.ok) {
            alert('Failed to change status: ' + (res.message || 'Unknown error!'))
        }
        socket.emit('update-menu')
    } catch (error) {
        alert('Error: ' + error.message || 'Unknown error!')
    }
}