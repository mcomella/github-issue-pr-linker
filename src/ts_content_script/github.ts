/*
 * The main interface to the GitHub API for the extension: it provides caching
 * and logic.
 */
namespace Github {

    const DB_VERSION = 1;

    const KEY_LAST_UPDATE_MILLIS = 'lastUpdateMillis';

    const MIN_BETWEEN_UPDATES = 5;
    const MILLIS_BETWEEN_UPDATES = MIN_BETWEEN_UPDATES * 60 /* sec */ * 1000 /* ms */;

    let isDBInit = false;

    export function getPRForIssue(owner: string, repo: string, issueNumber: number): Promise<Array<GithubEndpoint.PR>> {
        ensurePRCacheUpdated(owner, repo).then(() => {

        });
    }

    function ensurePRCacheUpdated(owner: string, repo: string): Promise<any> {
        const storage = getStorage();
        const nowMillis = new Date().getTime();
        return maybeUpgradeDB().then(() => {
            return storage.get(KEY_LAST_UPDATE_MILLIS);
        }).then(items => {
            if (!items.lastUpdateMillis ||
                    items.lastUpdateMillis + MILLIS_BETWEEN_UPDATES < nowMillis) {
                return fetchAndMergeOpenPRs(owner, repo);
            }
        });
    }

    function fetchAndMergeOpenPRs(owner: string, repo: string): Promise<any> {
        GithubEndpoint.fetchOpenPRs(owner, repo).then(prs => {
            let issueToPRs = Types.newDefaultStringToArrayNumObject();
            prs.forEach(pr => {
                GithubParser.getIssueNumsFromTitle(pr.title).forEach(issueNum => {
                    issueToPRs[issueNum].push(pr.id); // Set instead? Don't want dupes.
                });
            });

            // todo: merge. don't forget owner/repo.
            const valsToSet = {
                KEY_LAST_UPDATE_MILLIS: new Date(),
            };

            getStorage().set()
        });
    }

    function maybeUpgradeDB(): Promise<any> {
        if (isDBInit) { return Promise.resolve(); }

        const storage = getStorage();
        return storage.get('dbVersion').then(items => {
            let returnVal = null;
            if (!items.dbVersion) {
                returnVal = storage.set({dbVersion: DB_VERSION});
            } else if (items.dbVersion !== DB_VERSION) {
                // TODO: upgrade.
            }

            isDBInit = true;
            return returnVal || Promise.resolve();
        });
    }

    function getStorage(): browser.storage.StorageArea { return browser.storage.local; }
}
