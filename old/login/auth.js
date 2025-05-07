const form = document.getElementById('login_form');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const apiUrl = 'https://api.aif.uz/login';

    const requestData = {
        username: username,
        password: password
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            const data = await response.json()
            localStorage.setItem('token', data.token)
            window.location.href = '../'
        } else {
            alert('Login or password is valid!');
        }
    } catch (error) {
        alert('Internal server error!');
    }
});
