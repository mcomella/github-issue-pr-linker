namespace GithubStore {
    type StorageArea = browser.storage.StorageArea;

    export const DB_VERSION = 1; // for testing.
    const KEY_DB_VERSION = 'dbVersion';

    const KEY_LAST_UPDATE_MILLIS = 'lastUpdateMillis';

    let isDBInit = false;

    export async function maybeUpgrade(_storage?: StorageArea, _newVersion?: number): Promise<void> {
        if (isDBInit) { return; }
        if (!_storage) { _storage = getStorage() }
        if (!_newVersion) { _newVersion = DB_VERSION; }

        const { dbVersion } = await _storage.get(KEY_DB_VERSION);
        if (!dbVersion) {
            const storageObj = {} as ObjectStringToAny
            storageObj[KEY_DB_VERSION] = DB_VERSION;
            await _storage.set(storageObj);
        } else if (dbVersion !== DB_VERSION) {
            // Upgrade for future versions...
        }

        isDBInit = true;
    }

    export function _reset() {
        isDBInit = false;
    }

    export async function getLastUpdateMillis(_storage?: StorageArea): Promise<number | null> {
        maybeUpgrade()
        if (!_storage) { _storage = getStorage() }
        return (await _storage.get(KEY_LAST_UPDATE_MILLIS))[KEY_LAST_UPDATE_MILLIS]
    }

    export async function mergeOpenPRs

    function getStorage(): StorageArea { return browser.storage.local; }
}
