// if (!localStorage.getItem('token')) {
//     window.location.href = 'https://aif.uz'
// } else {
//     fetch(`https://api.aif.uz/check-token`, {
//         method: 'get',
//         headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//     })
//         .then(res => res.json())
//         .then(data => {
//             if (data.status !== 'success') window.location.href = 'https://aif.uz'
//         })
//         .catch(e => {
//             console.log(e)
//             alert(e)
//         })
// }

function director(key) {
    window.location.href = `/${key}.html`
}