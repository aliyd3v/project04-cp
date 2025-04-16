const domain = 'http://192.168.0.113:7777'
const socket = io(domain)
const token = localStorage.getItem('token')
if (!token) window.location.href = '../index.html'

let Orders = []
let orderTimesArr = []
const ordersDiv = document.getElementById('orders-container')
const verifyDeliveredPopup = document.querySelector('.verify-delivered')
const selectedMeal = document.querySelector('.product-info')
const verifyMealInfo = document.getElementById('verify-product-info')

function getOrders() {
    socket.emit('get-orders', { token })
}

socket.on('new-order', ({ order, order_items, error }) => {
    let haveReadyProduct = order_items.some(i => i.meal.is_ready_product)
    if (haveReadyProduct) {
        getOrders()
        newOrderAudioPlay(order.table.number)
    }
})

socket.on('orders', ({ orders }) => {
    Orders = orders
    renderOrders(Orders)
})

socket.on('prepared', ({ ok, table, error }) => {
    if (ok) {
        getOrders()
        if (table) {
            newOrderAudioPlay(table.number)
        }
    } else {
        alert((error || 'Fatal error!'))
    }
})

socket.on('delivered', ({ ok, table, error }) => {
    if (ok) {
        getOrders()
    } else {
        alert((error || 'Fatal error!'))
    }
})

// Render orders function.
function renderOrders(Orders) {
    ordersDiv.innerHTML = ''
    Orders.forEach(order => {
        if (order.status == 'Pending' || order.status == 'Prepared') {
            let div = document.createElement('div')
            div.classList.add('order')
            div.innerHTML = `
            <div class="table">
                <div>Table ${order.table.number}</div>
                <div id="order-${order.id}"></div>
            </div>`
            let products = document.createElement('div')
            products.classList.add('products')
            let haveProduct = false
            order.order_items.forEach(item => {
                if (
                    (item.status == 'Pending' && item.meal.is_ready_product) ||
                    item.status == 'Prepared' /* || item.status == 'Delivered' */
                ) {
                    if (haveProduct != true) {
                        haveProduct = true
                    }
                    let onclickFunction = '';
                    if (
                        item.meal.is_ready_product && item.status == 'Pending' ||
                        !item.meal.is_ready_product && item.status == 'Prepared'
                    ) {
                        onclickFunction = `onclick = "openDeliveredVerify(${item.id}, '${item.meal.name}', '${item.meal.image_url}', ${item.quantity})"`
                    }
                    products.innerHTML += `
                    <div class="product ${item.status == 'Delivered' ? 'product-delivered' : ''}" ${onclickFunction}>
                        <div><img src="${item.meal.image_url}" alt="${item.meal.name}"></img></div>
                        <div>${item.quantity}</div>
                        <div>${item.meal.name}</div>
                    </div>`
                }
            })
            if (haveProduct) {
                div.appendChild(products)
                ordersDiv.appendChild(div)
                orderTimesArr.push({
                    element: document.getElementById(`order-${order.id}`),
                    created_at: new Date(order.created_at)
                })
            }
        }
    });
    timeShower()
}

// Show the difference from now with created_at.
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

// Open verify delivered page function.
function openDeliveredVerify(id, name, image_url, quantity) {
    verifyMealInfo.dataset.order_item = id
    verifyMealInfo.innerHTML = `
    <div class="product-info-img"><img src="${image_url}" alt="${name}"></img></div>
    <div><p>Quantity: ${quantity}</p></div>
    <div><p>Product: ${name}</p></div>`
    verifyDeliveredPopup.classList.remove('hidden')
}

// Close verify delivered page.
function closeDeliveredVerify() {
    verifyMealInfo.removeAttribute('data-order_item')
    verifyMealInfo.innerHTML = '';
    verifyDeliveredPopup.classList.add('hidden')
}

// Verify delivered.
function verifyDelivered() {
    const id = verifyMealInfo.dataset.order_item
    productDelivered(id)
}

// Delivered request to server.
function productDelivered(id) {
    socket.emit('order-item-delivered', { token, order_item_id: id })
    closeDeliveredVerify()
}

// Audio notification.
function newOrderAudioPlay(number) {
    new Audio('../audio/notification.mp3').play()
    setTimeout(() => {
        new Audio('../audio/заказ_готова.mp3').play()
    }, 1000)
    setTimeout(() => {
        new Audio('../audio/stol.mp3').play()
    }, 2200)
    setTimeout(() => {
        new Audio(`../audio/number/${number}.mp3`).play()
    }, 2700)
}


document.addEventListener("DOMContentLoaded", getOrders);