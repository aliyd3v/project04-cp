const urlParams = new URLSearchParams(window.location.search)
const token = urlParams.get('token')

if (!token) {
    window.location.href = 'https://aif.uz'
} else {
    fetch('https://api.aif.uz/check-token', {
        method: 'get',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(res => {
            if (res.status == 'success') {
                localStorage.setItem('token', token)
                window.location.href = 'https://cp.aif.uz/index.html'
            } else {
                alert(res.message)
            }
        })
        .catch(err => console.error('Internal server error!'))
}