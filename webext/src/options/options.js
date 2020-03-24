const form = document.querySelector('#form-credentials')
const serverInput = document.querySelector('#input-server')
const usernameInput = document.querySelector('#input-username')
const passwordInput = document.querySelector('#input-password')

form.addEventListener('submit', saveSettings)
browser.storage.local.get().then(updateUI, onError)

function saveSettings(event) {
    event.preventDefault()
    browser.storage.local.set({
        server: serverInput.value.replace(/\/$/, '')
    })
    
    fetchToken(serverInput.value, {
        username: usernameInput.value,
        password: passwordInput.value
    })
    .then(data => {
        browser.storage.local.set({ token: data.token })
        onSuccess('You are logged in.')
    })
    .then(browser.storage.local.get)
    .then(updateUI)
    .catch(onError)
}

function fetchToken(server, credentials) {
    return fetch(`${server}/api/auth/token`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'email': credentials.username,
            'password': credentials.password
            })
        })
        .then(response => {
            if (response.ok && response.status === 200) {
                return response.json()
            } else {
                onError(response.statusText)
            }
        })
        .catch(onError)
}

function updateUI(restoredSettings) {
    serverInput.value = restoredSettings.server || ''
    if (restoredSettings.token) {
        usernameInput.value = ''
        usernameInput.placeholder = '<successfully saved>'
        passwordInput.value = ''
        passwordInput.placeholder = '<successfully saved>'
    }
}
