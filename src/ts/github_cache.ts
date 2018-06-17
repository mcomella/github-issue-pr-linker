/*
 * Cached data from the Github API with metadata convenient for access (e.g. lastUpdateMillis).
 */
namespace GithubCache {
    export type StorageArea = browser.storage.StorageArea;

    const PREFIX_KEY = 'ghcache-';

    export const DB_VERSION = 1; // for testing.
    export const KEY_DB_VERSION = PREFIX_KEY + 'dbVersion';

    export const KEY_LAST_UPDATE_MILLIS = PREFIX_KEY + 'lastUpdateMillis';

    const RE_KEY_ISSUE_TO_PR = /([0-9]+)$/

    let isDBInit = false;

    export async function _maybeUpgrade(_storage?: StorageArea, _newVersion?: number): Promise<void> {
        if (isDBInit) { return; }
        if (!_storage) { _storage = getStorage() }
        if (!_newVersion) { _newVersion = DB_VERSION; }

        const dbVersion = (await _storage.get(KEY_DB_VERSION))[KEY_DB_VERSION];
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

    // TODO: do for owner/repo
    export async function getLastUpdateMillis(_storage?: StorageArea): Promise<number | null> {
        if (!_storage) { _storage = getStorage() }
        _maybeUpgrade(_storage)
        return (await _storage.get(KEY_LAST_UPDATE_MILLIS))[KEY_LAST_UPDATE_MILLIS]
    }

    export async function getIssuesToPRs(owner: string, repo: string, issueNums: number[], _storage?: StorageArea): Promise<ObjectNumberToNumberSet> {
        if (!_storage) { _storage = getStorage() }
        _maybeUpgrade(_storage)

        const keysToFetch = issueNums.map(num => _getKeyIssueToPR(owner, repo, num));
        const storedIssueToPRs = await _storage.get(keysToFetch);
        const returnValue = {} as ObjectNumberToNumberSet;
        for (const key in storedIssueToPRs) {
            const issueNum = extractIssueNumFromKeyIssueToPR(key);
            if (!issueNum) {
                // todo: surface to user for bug report?
                Log.e(`key ${key} does not have issue number`);
            } else {
                returnValue[issueNum] = storedIssueToPRs[key];
            }
        }
        return returnValue;
    }

    export async function getIssueToPRs(owner: string, repo:string, issueNum: number, _storage?: StorageArea): Promise<Set<number> | null> {
        const issuesToPRs = await getIssuesToPRs(owner, repo, [issueNum], _storage);
        return issuesToPRs[issueNum];
    }

    export async function mergeIssueToPRs(owner: string, repo: string, remoteIssueToOpenPRs: ObjectNumberToNumberSet, _storage?: StorageArea): Promise<void> {
        if (!_storage) { _storage = getStorage() }
        _maybeUpgrade(_storage)

        const issueNumsToFetch = [] as number[];
        for (const issueNum in remoteIssueToOpenPRs) { issueNumsToFetch.push(parseInt(issueNum)); }

        const storedIssueToPRs = await getIssuesToPRs(owner, repo, issueNumsToFetch, _storage);
        const mergedIssueToPRs = {} as ObjectStringToAny;
        for (const issueNum in remoteIssueToOpenPRs) {
            // TODO: should we remove outdated PRs, e.g. if stored has something remote doesn't?
            const remoteOpenPRs = remoteIssueToOpenPRs[issueNum];
            const storedOpenPRs = storedIssueToPRs[issueNum] as Set<number>;

            const mergedOpenPRs = new Set(remoteOpenPRs);
            if (storedOpenPRs) {
                storedOpenPRs.forEach(prNum => mergedOpenPRs.add(prNum));
            }

            mergedIssueToPRs[_getKeyIssueToPR(owner, repo, parseInt(issueNum))] = mergedOpenPRs;
        }

        mergedIssueToPRs[KEY_LAST_UPDATE_MILLIS] = new Date().getTime();

        return _storage.set(mergedIssueToPRs);
    }

    export function _getKeyIssueToPR(owner: string, repo: string, issue: number): string {
        return PREFIX_KEY + `is/${owner}/${repo}/${issue}`;
    }

    function extractIssueNumFromKeyIssueToPR(key: string): number | null {
        const matches = RE_KEY_ISSUE_TO_PR.exec(key);
        if (!matches) { return null; }
        return parseInt(matches[1]);
    }

    function getStorage(): StorageArea { return browser.storage.local; }
}
