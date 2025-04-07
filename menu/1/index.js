const socket = io('https://api.aif.uz')
const menu = document.getElementById('menu')
const cartDiv = document.getElementById('cart')
const menuContainer = document.getElementById('menu-container')
const cartContainer = document.getElementById('cart-container')
const cartBtn = document.getElementById('cart-btn')
const menuBtn = document.getElementById('menu-btn')
const cartClearBtn = document.querySelector('.clear-btn')
const clearVerifyPopup = document.querySelector('.verify-clear')
const clearVerifyBtn = document.getElementById('clear-verify-btn')
const closeVerifyClearPopup = document.getElementById('close-verify-clear-popup')
const cartEmptyMsg = document.querySelector('.cart-empty-msg')

socket.emit('get-menu')

// Real-time functions.
socket.on('menu', ({ categories }) => {
    menu.innerHTML = '';
    categories.map(el => {
        let div = document.createElement('div')
        let h2 = document.createElement('h2')
        h2.textContent = el.category_name
        div.appendChild(h2)
        const meals = mealsRender(el.meals)
        div.appendChild(meals)

        menu.appendChild(div)
    })
})

// Render functions.
const mealsRender = (meals) => {
    let mealsDiv = document.createElement('div')

    meals.map(el => {

        // Item container.
        let div = document.createElement('div')
        div.classList.add('menu-item')


        // Image attribute.
        let img = document.createElement('img')
        if (el.image_url) {
            img.setAttribute('src', el.image_url)
        } else {
            img.setAttribute('src', '../images/no-image.png')
        }


        // Paragraph for meal title (name) and price.
        let p = document.createElement('p')
        p.classList.add('item-title')
        p.textContent = `${el.name} - ${el.price} so'm`


        // localStorage (parsed to json).
        let cart = JSON.parse(localStorage.getItem('cart')) || []
        // Index item on the cart array.
        const index = cart.length ? cart.findIndex(value => value.mealId == el.id) : -1


        // Div attribute for add to cart
        let addToCartDiv = document.createElement('div')
        addToCartDiv.classList.add('add-to-cart-div')
        // Button attribute for add to cart.
        let addToCart = document.createElement('button')
        addToCart.textContent = '+'
        addToCart.classList.add('add-to-cart-btn')
        addToCart.addEventListener('click', async event => {
            let cart = JSON.parse(localStorage.getItem('cart'))
            if (!cart) {
                localStorage.setItem('cart', JSON.stringify([]))
                cart = JSON.parse(localStorage.getItem('cart'))
            }
            let cartItem = {
                mealId: el.id,
                quantity: 1
            }
            let cartResult = []
            for (let i = 0; i < cart.length; i++) {
                if (cartItem.mealId != cart[i].mealId) {
                    cartResult.push(cart[i])
                }
            }
            cartResult.push(cartItem)
            localStorage.setItem('cart', JSON.stringify(cartResult))
            addToCartDiv.classList.add('hidden')
            changeCount.classList.remove('hidden')
        })


        // Changer item count.
        let changeCount = document.createElement('div')
        changeCount.classList.add('change-counter')
        // + button.
        let plusBtn = document.createElement('button')
        plusBtn.classList.add('plus-btn')
        plusBtn.textContent = '+'
        // plusBtn.addEventListener('click', event => {
        // })
        // Item amout.
        let amount = document.createElement('b')
        amount.classList.add('item-amount')
        amount.textContent = cart[index]?.quantity || 1
        // - button.
        let minusBtn = document.createElement('button')
        minusBtn.classList.add('minus-btn')
        minusBtn.textContent = '-'
        // minusBtn.addEventListener('click', event => {
        // })


        // Hide or don't hide attributes.
        if (!cart.length) {
            changeCount.classList.add('hidden')
        } else {
            cart.find(value => {
                return el.id == value.mealId
            }) ? addToCartDiv.classList.add('hidden') : changeCount.classList.add('hidden')
        }


        div.appendChild(img)
        div.appendChild(p)
        addToCartDiv.appendChild(addToCart)
        div.appendChild(addToCartDiv)
        changeCount.appendChild(plusBtn)
        changeCount.appendChild(amount)
        changeCount.appendChild(minusBtn)
        div.appendChild(changeCount)


        mealsDiv.appendChild(div)
    })

    return mealsDiv
}

// Cart unhide and hide menu.
cartBtn.addEventListener('click', event => {
    event.preventDefault();

    cartContainer.classList.toggle('hidden')
    menuContainer.classList.toggle('hidden')
    cartBtn.classList.toggle('hidden')
    menuBtn.classList.toggle('hidden')

    let cartStorage = localStorage.getItem('cart')
    if (cartStorage) {
        let cartArray = JSON.parse(cartStorage)
        if (cartArray.length) {
            cartClearBtn.classList.remove('hidden')
            cartEmptyMsg.classList.add('hidden')
        }
    }
})

// Menu unhide and hide cart.
menuBtn.addEventListener('click', event => {
    event.preventDefault();

    cartContainer.classList.toggle('hidden')
    menuContainer.classList.toggle('hidden')
    cartBtn.classList.toggle('hidden')
    menuBtn.classList.toggle('hidden')
})

// Cart clear button pupup unhide.
cartClearBtn.addEventListener('click', event => {
    event.preventDefault();
    clearVerifyPopup.classList.remove('hidden')
})

// Clear cart.
clearVerifyBtn.addEventListener('click', event => {
    event.preventDefault();

    localStorage.removeItem('cart')
    cartClearBtn.classList.add('hidden')
    clearVerifyPopup.classList.add('hidden')
    cartEmptyMsg.classList.remove('hidden')
})

// Close cart clear verify popup.
closeVerifyClearPopup.addEventListener('click', event => {
    event.preventDefault();
    clearVerifyPopup.classList.add('hidden')
})
