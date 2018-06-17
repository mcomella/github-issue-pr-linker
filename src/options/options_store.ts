namespace OptionsStore {
    const PREFIX_KEY = 'opt-';
    const KEY_PERSONAL_ACCESS_TOKEN = PREFIX_KEY + 'gh-access-token';

    export async function getPersonalAccessToken(): Promise<string> {
        const token = (await getStorage().get(KEY_PERSONAL_ACCESS_TOKEN))[KEY_PERSONAL_ACCESS_TOKEN];
        if (!token) { return ''; }
        return token;
    }

    export function setPersonalAccessToken(token: string): Promise<void> {
        const storageObj = {} as { [key: string]: string };
        storageObj[KEY_PERSONAL_ACCESS_TOKEN] = token;
        return getStorage().set(storageObj);
    }

    function getStorage() { return browser.storage.local; }
}
