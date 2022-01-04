// Context Menu

browser.contextMenus.create({
    id: 'anchr-link',
    title: 'Save Link to Anchr',
    contexts: ['link']
}, () => { })

browser.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case 'anchr-link':
            browser.storage.local.get('token')
                .then(token => token && token.token && browser.storage.local.set({
                    tempLink: {
                        url: info.linkUrl,
                        title: info.linkText,
                    }
                }))
            // normally, popup should be opened only after the callback returns
            // unfortunately, that is not allowed, as the call must happen directly from within an user action handler
            // however, calls to resolve collections, etc. in app.js take long enough for value to be present then
            browser.browserAction.openPopup()
            break
    }
})