namespace GithubStore {
    export const DB_VERSION = 1; // for testing.
    const KEY_DB_VERSION = 'dbVersion';

    let isDBInit = false;

    export async function maybeUpgrade(storage: browser.storage.StorageArea, _newVersion?: number): Promise<void> {
        if (isDBInit) { return; }
        if (!_newVersion) { _newVersion = DB_VERSION; }

        const { dbVersion } = await storage.get(KEY_DB_VERSION);
        if (!dbVersion) {
            const storageObj = {} as ObjectStringToAny
            storageObj[KEY_DB_VERSION] = DB_VERSION;
            await storage.set(storageObj);
        } else if (dbVersion !== DB_VERSION) {
            // Upgrade for future versions...
        }

        isDBInit = true;
    }

    export function _reset() {
        isDBInit = false;
    }
}
