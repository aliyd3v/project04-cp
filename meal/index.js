const socket = io('https://api.aif.uz')
const token = localStorage.getItem('token')
const mealsContainer = document.getElementById('meals-container')
const updateFormContainer = document.getElementById('update-form-container')
const closeBtn = document.getElementById('close-btn')
const updateForm = document.getElementById('update-form')
const delPopup = document.querySelector('.del-popup')
const closeDelPopup = document.getElementById('close-del-btn')
const deleteMealBtn = document.getElementById('meal-del-btn')

socket.emit('get-meals', { token })

socket.on('meals', ({ meals, error }) => {
    if (error) {
        alert('Failed to get meals: ' + (error?.message || error))
        return;
    }

    mealsContainer.innerHTML = '';

    meals.forEach(el => {
        let div = document.createElement('div')
        div.style = 'border: 1px solid black; margin: 10px;'

        let img = document.createElement('img')
        if (el.image_url) {
            img.setAttribute('src', el.image_url)
        } else {
            img.setAttribute('src', '../images/no-image.png')
        }
        img.setAttribute('alt', el.name + '-image')
        img.style = 'max-width: 300px; max-height: 200px;'

        let p = document.createElement('p')
        p.textContent = `${el.name} - ${el.price} so'm`
        p.style = 'font-weight: bold;'

        let pCategory = document.createElement('p')
        pCategory.textContent = `Category: ${el.category_name}`

        let status = document.createElement('p')
        status.textContent = 'Status: '
        let statusValue = document.createElement('b')
        statusValue.textContent = el.active ? 'Active' : 'Not active'
        statusValue.style = `color: ${el.active ? 'blue' : 'red'};`
        status.appendChild(statusValue)

        let activateBtn = document.createElement('button')
        activateBtn.textContent = 'Activate'
        activateBtn.style = `color: blue; font-weight: bold;`;
        let unactivateBtn = document.createElement('button')
        unactivateBtn.textContent = 'Unactivate'
        unactivateBtn.style = `color: red; font-weight: bold;`;
        el.active ? activateBtn.classList.toggle('hidden') : unactivateBtn.classList.toggle('hidden');
        (el.active ? unactivateBtn : activateBtn).addEventListener('click', async (event) => {
            event.preventDefault();
            await changeStatus(el)
            socket.emit('get-meals', { token })
        })

        let updateBtn = document.createElement('button')
        updateBtn.dataset.id = el.id
        updateBtn.textContent = 'Update'
        updateBtn.style = 'font-weight: bold;'
        updateBtn.addEventListener('click', async event => {
            event.preventDefault();

            updateFormContainer.dataset.id = el.id

            document.getElementById('name').value = el.name
            document.getElementById('price').value = el.price
            document.getElementById('category_id').value = el.category_id
            document.getElementById('active').value = el.active ? 1 : 0
            document.getElementById('image').value = ''

            updateFormContainer.classList.remove('hidden')
        })

        let delBtn = document.createElement('button')
        delBtn.dataset.id = el.id
        delBtn.textContent = 'Delete'
        delBtn.style = 'font-weight: bold;'
        delBtn.addEventListener('click', (event) => {
            event.preventDefault();
            delPopup.dataset.id = el.id
            delPopup.classList.remove('hidden')
        })

        div.appendChild(img)
        div.appendChild(p)
        div.appendChild(pCategory)
        div.appendChild(status)
        div.append(activateBtn)
        div.append(unactivateBtn)
        div.appendChild(updateBtn)
        div.appendChild(delBtn)
        mealsContainer.appendChild(div)
    })
})

// Update form Pop-up close.
closeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    updateFormContainer.classList.toggle('hidden')
})

// Update meal function.
updateForm.addEventListener('submit', async event => {
    event.preventDefault();
    const id = updateFormContainer.dataset.id

    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('category_id', document.getElementById('category_id').value);
    formData.append('active', document.getElementById('active').value);
    document.getElementById('image').value ? formData.append('image', document.getElementById('image').files[0]) : false

    try {
        const response = await fetch(
            `https://api.aif.uz/meal/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            }
        );

        const res = await response.json();

        if (!response.ok) {
            alert('Failed to update meal: ' + (res.message || 'Unknown error'));
        }
        socket.emit('update-menu')
    } catch (error) {
        alert('Error: ' + error.message);
    }

    updateFormContainer.classList.toggle('hidden')

    socket.emit('get-meals', { token })
})

// Close del pop-up.
closeDelPopup.addEventListener('click', (event) => {
    event.preventDefault();

    delPopup.classList.toggle('hidden')
    delPopup.removeAttribute('data-id')
})

// Delete meal.
deleteMealBtn.addEventListener('click', async (event) => {
    const id = document.querySelector('.del-popup').dataset.id

    try {
        const response = await fetch(`https://api.aif.uz/meal/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const res = await response.json()

        if (!response.ok) {
            console.log(res)
            alert('Failed to update meal: ' + (res.message || 'Unknown error'));
        }
        socket.emit('update-menu')
    } catch (error) {
        alert('Error: ' + error.message);
    }

    delPopup.classList.toggle('hidden')
    delPopup.removeAttribute('data-id')
    socket.emit('get-meals', { token })
})

// Change status function.
const changeStatus = async el => {
    try {
        const response = await fetch(
            `https://api.aif.uz/meal/${el.id}/change-status`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        )
        const res = await response.json()
        if (!response.ok) {
            alert('Failed to update meal: ' + (res.message || 'Unknown error'));
        }
        socket.emit('update-menu')                      // Here is new code. (Testing)
    } catch (error) {
        alert('Error: ' + error.message);
    }
}