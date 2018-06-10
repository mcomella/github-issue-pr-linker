/*
 * The main interface to the GitHub API for the extension: it provides caching
 * and logic.
 */
namespace Github {

    const DB_VERSION = 1;

    const MIN_BETWEEN_UPDATES = 5;
    const MILLIS_BETWEEN_UPDATES = MIN_BETWEEN_UPDATES * 60 /* sec */ * 1000 /* ms */;

    export function getPRForIssue(owner: string, repo: string, issueNumber: number): Promise<Array<GithubEndpoint.PR>> {
        ensurePRCacheUpdated(owner, repo).then(() => {

        });

        return new Promise([]);
    }

    function ensurePRCacheUpdated(owner: string, repo: string): Promise<any> {
        const storage = browser.storage.local;
        const nowMillis = new Date().getTime();
        return maybeUpgradeDB().then(() => {
            return storage.get('lastUpdateMillis');
        }).then(items => {
            if (!items.lastUpdateMillis ||
                    items.lastUpdateMillis + MILLIS_BETWEEN_UPDATES < nowMillis) {
                // TODO: update.
            }
        });
    }

    function maybeUpgradeDB(): Promise<any> {
        const storage = browser.storage.local;
        return storage.get('dbVersion').then(items => {
            if (!items.dbVersion) {
                return storage.set({dbVersion: DB_VERSION});
            }

            if (items.dbVersion !== DB_VERSION) {
                // TODO: upgrade.
                return;
            }
        });
    }

    function getStorage(): browser.storage.StorageArea { return browser.storage.local; }
}
