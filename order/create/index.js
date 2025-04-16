const socket = io('http://192.168.0.113:7777')
const token = localStorage.getItem('token');
if (!token) window.location.href = '../../index.html';

let Tables = []
const tablesDiv = document.querySelector('.tables-container')
const nextBtn = document.querySelector('.verify-popup-next')
const cancelBtn = document.querySelector('.verify-popup-cancel')
const verifyTable = document.querySelector('.verify-table')

/*
    Listeners
*/

socket.on('tables', ({ tables }) => {
    Tables = tables
    renderTables(Tables)
})

cancelBtn.addEventListener('click', e => {
    e.preventDefault();

    verifyTable.removeAttribute('data-table')
    verifyTable.classList.add('hidden')
})

nextBtn.addEventListener('click', e => {
    e.preventDefault();

    const tableNumber = verifyTable.dataset.table
    if (tableNumber) {
        // window.location.href = `https://menu.aif.uz/identificate/index.html?datatable=${tableNumber}&datatoken=${token}`
        window.location.href = `../../menu/identificate/index.html?datatable=${tableNumber}&datatoken=${token}`
    } else {
        alert('Fatal error at get table number!')
    }
})

/* 
    Functions
*/

// Get tables
function getTables() {
    socket.emit('get-tables', { token })
}

// Render tables.
function renderTables(Tables) {
    Tables.forEach(table => {

        let div = document.createElement('div')
        div.classList.add('table')
        div.textContent = table.number
        div.addEventListener('click', e => {
            e.preventDefault();

            verifyTable.dataset.table = table.id
            verifyTable.classList.remove('hidden')
        })

        tablesDiv.appendChild(div)
    })
}



document.addEventListener("DOMContentLoaded", getTables);