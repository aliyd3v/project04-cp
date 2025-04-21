const urlParams = new URLSearchParams(window.location.search)
const token = urlParams.get('token')

if (!token) {
    return window.location.href = 'https://aif.uz'
} else {
    checkToken()
}

async function checkToken() {
    try {
        const response = await fetch(`https://api.aif.uz/check-token`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const res = await response.json()
        console.log(res)
        if (response.ok) {
            if (res.status == 'success') {
                localStorage.setItem('token', token)
                return window.location.href = 'https://cp.aif.uz/index.html'
            } else {
                alert(res.message)
            }
        } else {
            console.error('Internal server error!')
        }
    } catch (error) {
        console.error('Internal server error!')
    }
}