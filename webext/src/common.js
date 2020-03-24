const alertDiv = document.querySelector('#alert-container')
const errorDiv = document.querySelector('#error-container')

function onError(text, persistent) {
    if (typeof (text) !== 'string') {
        text = ''
    }
    errorDiv.innerHTML = `<strong>Error!</strong> ${text}`
    errorDiv.classList.remove('hidden')
    if (persistent) {
        errorDiv.classList.remove('hidden')
    } else {
        setTimeout(() => {
            errorDiv.classList.add('hidden')
        }, 3000)
    }
}

function onSuccess(text, persistent) {
    if (typeof (text) !== 'string') {
        text = ''
    }
    alertDiv.innerHTML = `<strong>Success!</strong> ${text}`
    alertDiv.classList.remove('hidden')
    if (persistent) {
        alertDiv.classList.remove('hidden')
    } else {
        setTimeout(() => {
            alertDiv.classList.add('hidden')
        }, 3000)
    }
}
