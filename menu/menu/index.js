const socket = io("http://192.168.0.113:7777");


/*
    ELEMENTS
*/

const token = localStorage.getItem('token')
let cart = JSON.parse(localStorage.getItem('cart')) || [] // Cart item in localStorage
let Categories   // Categories from real-time api
let items = []
let table = localStorage.getItem('table')   // Table for ordering (if exist)
let orderBtn = document.querySelector('.order-btn')
let cartBtn = document.getElementById('cart-btn')

const menuDiv = document.getElementById('menu')
const cartDiv = document.getElementById('cartItems')



/*
    LISTENERS
*/

// Listener for menu
socket.on('menu', ({ categories }) => {
    Categories = categories
    renderMenu(Categories)
})



/*
    FUNCTIONS
*/

// Request for menu
function getMenu() {
    socket.emit('get-menu')
}

// Menu render function
function renderMenu(Categories) {

    menuDiv.innerHTML = "";
    items = []

    Categories.forEach(category => {
        let categoryDiv = document.createElement("div");
        categoryDiv.className = "category";
        categoryDiv.innerHTML = `<div class='category-title'>${category.category_name}</div>`;

        category.meals.forEach(meal => {

            items.push({ id: meal.id, name: meal.name, price: meal.price, image_url: meal.image_url })

            const cartItem = cart.find(i => i.mealId == meal.id)

            let itemDiv = document.createElement('div')
            itemDiv.classList.add('menu-item')
            itemDiv.innerHTML = `<img src="${meal.image_url}" alt="${meal.name}">
                                <div class="menu-item-content">
                                    <div class="menu-item-info">
                                        <h3>${meal.name}</h3>
                                        <span>${meal.price} so'm</span>
                                    </div>
                                    <button class="btn ${cartItem ? 'hidden' : ''}" onclick="addToCart(${meal.id})">+</button>
                                    <div class="counter-container ${cartItem ? '' : 'hidden'}">
                                        <button onclick="incriminate(${meal.id})">+</button>
                                        <span>${cartItem ? cartItem.quantity : 0}</span>
                                        <button onclick="decriminate(${meal.id})">-</button>
                                    </div>
                                </div>`;

            categoryDiv.appendChild(itemDiv);
        })

        menuDiv.appendChild(categoryDiv);
    })

    if (!cart.length) {
        document.querySelector('.clear-btn').classList.add('hidden')
        if (table) {
            orderBtn.classList.add('hidden')
        }
        cartBtn.innerHTML = `🛒`
    } else {
        cartBtn.innerHTML = `
        <i id="cart-item-amount" class="badge" value=${cart.length}></i>🛒`
    }

    renderCart()
}

// Add to cart (array) function
function addToCart(id) {
    const i = items.find(i => i.id == id)
    if (i) {
        const e = cart.find(e => e.mealId == id)
        if (!e) {
            cart.push({ mealId: id, quantity: 1 })
            localStorage.setItem('cart', JSON.stringify(cart))
        }
    }

    // Unhide clear button on cart popup
    document.querySelector('.clear-btn').classList.remove('hidden')

    renderMenu(Categories)
}

// Incriminate item quantity function
function incriminate(id) {
    const e = cart.find(e => e.mealId == id)
    if (e) {
        e.quantity += 1
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    renderMenu(Categories)
}

// Decriminate item quantity function
function decriminate(id) {
    const e = cart.find(e => e.mealId == id)
    if (e) {
        if (e.quantity > 1) {
            e.quantity -= 1
            localStorage.setItem('cart', JSON.stringify(cart))
        } else if (e.quantity == 1) {
            const index = cart.findIndex(i => i.mealId == id)
            cart.splice(index, 1)
            localStorage.setItem('cart', JSON.stringify(cart))
        }
    }
    renderMenu(Categories)
}

// Cart render function
function renderCart() {
    cartDiv.innerHTML = '';
    let changed = false
    cart.forEach(e => {
        const el = items.find(i => i.id == e.mealId)
        if (el) {
            let div = document.createElement('div')
            div.classList.add('cart-item')
            div.innerHTML = `<img class="cart-item-img" src="${el.image_url}" alt="el.name">
                            <div class="cart-item-info">
                                <p style="font-weight: bold;">${el.name}</p>
                                <p>${el.price} so'm x ${e.quantity}</p>
                            </div>
                            <div class="counter-container">
                                <button onclick="incriminate(${el.id})">+</button>
                                <span>${e.quantity}</span>
                                <button onclick="decriminate(${el.id})">-</button>
                            </div>`
            cartDiv.appendChild(div)
        } else {
            let index = cart.findIndex(el => el.mealId == e.mealId)
            cart.splice(index, 1)
            if (!changed) {
                changed = true
            }
        }
    })
    if (changed) {
        localStorage.setItem('cart', JSON.stringify(cart))
        renderMenu(Categories)
    }
}

// Open cart popup
function openCart() {
    if (table && cart.length) {
        orderBtn.classList.remove('hidden')
    }
    document.getElementById("cartOverlay").style.display = "block";
    document.getElementById("cartPopup").style.display = "block";
    document.querySelector('.clear-btn').addEventListener('click', e => {
        e.preventDefault();

        cart = []
        localStorage.removeItem('cart')
        cartDiv.innerHTML = ''
        document.querySelector('.clear-btn').classList.add('hidden')
        renderMenu(Categories)
    })
    orderBtn.addEventListener('click', e => {
        e.preventDefault();

        if (table && token && cart.length) {

            socket.emit('create-order', { token, table, cart })
            cart = []
            localStorage.setItem('cart', JSON.stringify(cart))
            window.location.href = '../success.html'

        }
    })
}

// Close cart popup
function closeCart() {
    document.getElementById("cartOverlay").style.display = "none";
    document.getElementById("cartPopup").style.display = "none";
}



document.addEventListener("DOMContentLoaded", getMenu);