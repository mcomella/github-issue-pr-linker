async function saveOptions(e: Event) {
    e.preventDefault();

    const accessToken = getAccessTokenNode().value;
    OptionsStore.setPersonalAccessToken(accessToken);
}

async function restoreOptions() {
    const accessToken = await OptionsStore.getPersonalAccessToken();
    if (accessToken) {
        getAccessTokenNode().value = accessToken;
    }
}

function getAccessTokenNode() { return document.querySelector('#access-token') as HTMLInputElement; }

document.addEventListener('DOMContentLoaded', restoreOptions);
const form = document.querySelector('form') as HTMLFormElement;
form.addEventListener('submit', saveOptions);
