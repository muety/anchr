const btnSettings = document.querySelector('#btn-settings')
const btnShorten = document.querySelector('#btn-shorten')
const selectCollection = document.querySelector('#select-collection')
const inputLink = document.querySelector('#input-link')
const inputDescription = document.querySelector('#input-description')
const formMain = document.querySelector('#form-main')

btnSettings.addEventListener('click', () => browser.runtime.openOptionsPage())
btnShorten.addEventListener('click', () => shortenLink(readForm())
    .then(data => updateLinkInformation({ url: data.href }))
    .catch(console.error))

let restoredSettings = {}

browser.storage.local.get()
    .then(settings => {
        if (!settings || !settings.token) {
            toggleForm(false)
            return Promise.reject({
                text: 'You are not logged in. Please go to the Add-On\'s settings page and enter your credentials.',
                persistent: true
            })
        }
        restoredSettings = settings
    })
    .then(fetchCollections)
    .then(updateCollectionList)
    .then(readTab)
    .then(updateLinkInformation)
    .catch(onError)
    .then(refreshToken)
    .then(data => browser.storage.local.set({ token: data.token }))
    .then(() => console.log('Refreshed token.'))
    .catch(console.error)

formMain.addEventListener('submit', event => {
    event.preventDefault()
    postLink(readForm())
        .then(resetForm)
        .then(() => onSuccess('Link saved successfully'))
        .catch(onError)
})

function readTab() {
    return browser.tabs.query({ active: true, windowId: browser.windows.WINDOW_ID_CURRENT })
        .then(tabs => {
            if (!tabs || !tabs.length) {
                return Promise.reject('Could not read current tab')
            }
            return {
                url: tabs[0].url,
                title: tabs[0].title
            }
        })
        .catch(err => console.error(JSON.stringify(err)))
}

function readForm() {
    return {
        url: inputLink.value.trim(),
        description: inputDescription.value.trim(),
        collection: selectCollection.value
    }
}

function shortenLink(data) {
    const server = restoredSettings.server
    const token = restoredSettings.token

    return fetch(`${server}/api/shortlink`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            url: data.url
        })
    })
        .then(response => {
            if (response.ok && response.status >= 200 && response.status <= 299) {
                return response.json()
            } else if (response.status === 401) {
                // Clear token, because expired
                browser.storage.local.remove('token')
                return Promise.reject(response.statusText)
            } else {
                return Promise.reject(response.statusText)
            }
        })
}

function fetchCollections() {
    const server = restoredSettings.server
    const token = restoredSettings.token

    return fetch(`${server}/api/collection?short=true`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (response.ok && response.status === 200) {
                return response.json()
            } else if (response.status === 401) {
                // Clear token, because expired
                browser.storage.local.remove('token')
                return Promise.reject(response.statusText)
            } else {
                return Promise.reject(response.statusText)
            }
        })
}

function postLink(data) {
    const server = restoredSettings.server
    const token = restoredSettings.token

    return fetch(`${server}/api/collection/${data.collection}/links`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.ok && response.status === 201) {
                return Promise.resolve()
            } else {
                return Promise.reject(response.statusText)
            }
        })
        .then(() => {
            return browser.storage.local.set({ lastSelected: data.collection })
        })
}

function refreshToken() {
    const server = restoredSettings.server
    const token = restoredSettings.token

    return fetch(`${server}/api/auth/renew`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (response.ok && response.status === 200) {
                return response.json()
            } else {
                return Promise.reject(response.statusText)
            }
        })
}

function toggleForm(state) {
    if (state) {
        formMain.classList.remove('hidden')
    } else {
        formMain.classList.add('hidden')
    }
}

function resetForm() {
    inputLink.value = ''
    inputDescription.value = ''
    return Promise.resolve()
}

function updateCollectionList(collections) {
    let selectId = restoredSettings.lastSelected

    collections
        .sort((a, b) => a.name < b.name ? -1 : (a.name === b.name ? 0 : 1))
        .forEach(c => {
            let el = document.createElement('option')
            el.value = c.id
            el.innerText = c.name
            el.selected = c.id === selectId

            selectCollection.appendChild(el)
        })
}

function updateLinkInformation(data) {
    if (data.url !== undefined) inputLink.value = data.url
    if (data.title !== undefined) inputDescription.value = data.title
    return Promise.resolve(data)
}