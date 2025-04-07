const socket = io();

(() => {
    const token = localStorage.getItem('token')
    if (!token) {
        return window.location.href = './login/login.html'
    }
})()