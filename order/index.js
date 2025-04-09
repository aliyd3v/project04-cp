const socket = io('https://api.aif.uz')
const token = localStorage.getItem('token')
if (!token) window.location.href = '../index.html'

const ordersDiv = document.getElementById('orders-container')
let Orders = []
let orderTimesArr = []

function getOrders() {
    socket.emit('get-orders', { token })
}

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
        </div>`
        let products = document.createElement('div')
        products.classList.add('products')
        order.order_items.forEach(meal => {
            if (meal.status === 'Pending' || meal.status === 'Prepared') {
                products.innerHTML += `
                <div class="product ${meal.status == 'Prepared' ? 'product-prepared' : ''}" onclick="productPrepared(${meal.id})">
                    <div><img src="${meal.meal.image_url}" alt="${meal.meal.name}"></img></div>
                    <div>${meal.quantity}</div>
                    <div>${meal.meal.name}</div>
                </div>`
            }
        })
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
        i.element.innerHTML = `${hours ? hours : ''}:${minutes ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
    }
    requestAnimationFrame(timeShower)
}

function productPrepared(order_item_id) {
    socket.emit('prepared', { token, order_item_id })
}



document.addEventListener("DOMContentLoaded", getOrders);