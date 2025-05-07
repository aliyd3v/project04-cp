const domain = 'https://api.aif.uz'
const socket = io(domain)
const token = localStorage.getItem('token')
if (!token) window.location.href = '../index.html'

const ordersDiv = document.getElementById('orders-container')
let Orders = []
let orderTimesArr = []
const delPopup = document.querySelector('.del-popup')
const closeDelPopup = document.getElementById('close-del-btn')
const deleteOrderBtn = document.getElementById('order-del-btn')

function getOrders() {
    socket.emit('get-orders', { token })
}

socket.on('new-order', ({ order }) => {
    getOrders()
})

socket.on('prepared', ({ ok, table, error }) => {
    if (ok) {
        getOrders()
    }
})

socket.on('delivered', ({ ok, table, error }) => {
    if (ok) {
        getOrders()
    }
})

socket.on('orders', ({ orders }) => {
    Orders = orders
    renderOrders(Orders)
})

function renderOrders(Orders) {
    ordersDiv.innerHTML = ''
    Orders.forEach(order => {
        let div = document.createElement('div')
        div.classList.add('order')
        div.innerHTML = `
        <div class="table">
            <div>Table ${order.table.number}</div>
            <div id="order-${order.id}"></div>
            <div><button class="del-btn" onclick="openDelPopup(${order.id})">DEL</button></div>
        </div>`
        let totalPrice = 0;
        let products = document.createElement('div')
        products.classList.add('products')
        order.order_items.forEach(meal => {
            let orderItemStatus
            let color
            if (meal.status == 'Pending' && !meal.meal.is_ready_product) {
                orderItemStatus = 'fa-fire'
                color = 'yellow'
            } else if (meal.status == 'Pending' && meal.meal.is_ready_product) {
                orderItemStatus = 'fa-person-running-fast'
                color = 'blue'
            } else if (meal.status == 'Prepared') {
                orderItemStatus = 'fa-person-running-fast'
                color = 'blue'
            } else if (meal.status == 'Delivered') {
                orderItemStatus = 'fa-check-circle'
                color = 'green'
            }
            products.innerHTML += `
                <div class="product">
                    <div><img src="${meal.meal.image_url}" alt="${meal.meal.name}"></img></div>
                    <div>${meal.quantity}</div>
                    <div>${meal.meal.name}</div>
                </div>
                <div class="product-status">
                    <div><i class="fas ${orderItemStatus} ${color}"></i></i></div>
                </div>`
            totalPrice += meal.quantity * meal.meal.price
        })
        let totalPriceDiv = document.createElement('div')
        totalPriceDiv.classList.add('total-price-div')
        totalPriceDiv.innerHTML = `<div>Total price:</div><div>${totalPrice} so'm</div>`
        products.appendChild(totalPriceDiv)
        div.appendChild(products)
        ordersDiv.appendChild(div)
        orderTimesArr.push({
            element: document.getElementById(`order-${order.id}`),
            created_at: new Date(order.created_at)
        })
    });
    timeShower()
}

function timeShower() {
    const now = new Date()
    for (const i of orderTimesArr) {
        const difference = Math.floor((now - i.created_at) / 1000)
        const hours = Math.floor(difference / 3600)
        const minutes = Math.floor((difference % 3600) / 60)
        const seconds = difference % 60
        i.element.innerHTML = `${hours ? `${hours}:` : ''}${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
    }
    requestAnimationFrame(timeShower)
}

// Open del pop-up.
function openDelPopup(id) {
    delPopup.dataset.id = id
    delPopup.classList.remove('hidden')
}

// Close del pop-up.
closeDelPopup.addEventListener('click', (event) => {
    event.preventDefault();

    delPopup.classList.add('hidden')
    delPopup.removeAttribute('data-id')
})

// Del order button onclick function.
deleteOrderBtn.addEventListener('click', e => {
    e.preventDefault();
    const id = delPopup.dataset.id
    delOrder(id)
})

// Del order function.
function delOrder(id) {
    fetch(`${domain}/order/${id}`, {
        method: 'delete',
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(res => {
            delPopup.classList.add('hidden')
            delPopup.removeAttribute('data-id')
            if (res.status != 'success') {
                console.error('Error on delete order: ' + (res.message || 'unknown error'))
            }
            socket.emit('update-orders', { token })
        })
        .catch(err => {
            console.error('Fatal error: ' + (err.message || 'unknown error'))
        })
}



document.addEventListener("DOMContentLoaded", getOrders);