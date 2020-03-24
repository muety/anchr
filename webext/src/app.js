const btnSettings = document.querySelector('#btn-settings')
const formMain = document.querySelector('#form-main')

btnSettings.addEventListener('click', () => browser.runtime.openOptionsPage())

getSettings().then(settings => {
    if (!settings || !settings.token) {
        onError('You are not logged in. Please go to the Add-On\'s settings page and enter your credentials.', true)
        toggleForm(false)
        return
    }
}).catch(onError)

function toggleForm(state) {
    if (state) {
        formMain.classList.remove('hidden')
    } else {
        formMain.classList.add('hidden')
    }
}

function getSettings() {
    return browser.storage.local.get()
}