const alertDiv = document.querySelector('#alert-container')
const errorDiv = document.querySelector('#error-container')

let alertTimeout

function showAlert(type, text, persistent) {
    if (!!alertTimeout) return

    const elem = type === 'error' ? errorDiv : alertDiv
    const prefix = type === 'error' ? 'Error' : 'Success'

    if (typeof (text) === 'object' && text.text) {
        persistent = !!text.persistent
        text = text.text
    } else if (typeof (text) !== 'string') {
        text = ''
    }

    elem.innerHTML = `<strong>${prefix}!</strong> ${text}`
    elem.classList.remove('hidden')
    if (persistent) {
        elem.classList.remove('hidden')
    } else {
        alertTimeout = setTimeout(() => {
            elem.classList.add('hidden')
            delete alertTimeout
        }, 3000)
    }
}

function onError(text, persistent) {
    showAlert('error', text, persistent)
}

function onSuccess(text, persistent) {
    showAlert('alert', text, persistent)
}
