/*
 * The main interface to the GitHub API for the extension: it provides caching
 * and logic.
 */
namespace Github {

    const DB_VERSION = 1;
    const KEY_DB_VERSION = 'dbVersion';

    const KEY_LAST_UPDATE_MILLIS = 'lastUpdateMillis';
    const RE_KEY_ISSUE_TO_PR = /([0-9]+)$/

    const MIN_BETWEEN_UPDATES = 5;
    const MILLIS_BETWEEN_UPDATES = MIN_BETWEEN_UPDATES * 60 /* sec */ * 1000 /* ms */;

    let isDBInit = false;

    /*
     * Gets the linked PRs for the given issue.
     *
     * This return promise may reject if there's an error, e.g. in the returned storage or network layers.
     */
    export async function getPRsForIssue(owner: string, repo: string, issueNumber: number): Promise<Set<number>> {
        try {
            await maybeUpdatePRCache(owner, repo);
        } catch (e) {
            Log.e(`Unable to update PR cache, will fall back: ${e}`);
        }

        const issueToPRKey = getKeyIssueToPR(owner, repo, issueNumber);
        const issueKeysToPRs = await getStorage().get(issueToPRKey) as ObjectStringToNumberSet;
        const prs = issueKeysToPRs[issueToPRKey];
        if (prs) {
            return prs
        }

        return new Set();
    }

    async function maybeUpdatePRCache(owner: string, repo: string): Promise<void> {
        await maybeUpgradeDB();

        const { lastUpdateMillis } = await getStorage().get(KEY_LAST_UPDATE_MILLIS);
        const nowMillis = new Date().getTime();
        if (!lastUpdateMillis || lastUpdateMillis + MILLIS_BETWEEN_UPDATES < nowMillis) {
            Log.d('Fetching new data');
            await fetchAndMergeOpenPRs(owner, repo);
        } else {
            Log.d('Using cached data');
        }
    }

    async function fetchAndMergeOpenPRs(owner: string, repo: string): Promise<void> {
        let issueToPRs = {} as ObjectNumberToNumberSet
        const fetchedPRs = await GithubEndpoint.fetchOpenPRs(owner, repo)
        fetchedPRs.forEach(pr => {
            GithubParser.getIssueNumsFromTitle(pr.title).forEach(issueNum => {
                let prsToStore = issueToPRs[issueNum];
                if (!prsToStore) {
                    prsToStore = new Set();
                    issueToPRs[issueNum] = prsToStore;
                }
                prsToStore.add(pr.number);
            });
        });

        await mergeOpenPRs(owner, repo, issueToPRs);
    }

    async function mergeOpenPRs(owner: string, repo: string, remoteIssueToOpenPRs: ObjectNumberToNumberSet): Promise<void> {
        const keysToFetch = [] as string[]; // TODO: better keys? Helper fn?
        for (const issueNum in remoteIssueToOpenPRs) { keysToFetch.push(getKeyIssueToPR(owner, repo, parseInt(issueNum))); }

        const storage = getStorage();
        const storedIssueToPRs = await storage.get(keysToFetch);
        const mergedIssueToPRs = {} as ObjectStringToAny;
        for (const issueNum in remoteIssueToOpenPRs) {
            // TODO: should we remove outdated PRs, e.g. if stored has something remote doesn't?
            const remoteOpenPRs = remoteIssueToOpenPRs[issueNum];
            const storedOpenPRs = storedIssueToPRs[issueNum] as Set<number>;

            const mergedOpenPRs = new Set(remoteOpenPRs);
            if (storedOpenPRs) {
                storedOpenPRs.forEach(prNum => mergedOpenPRs.add(prNum));
            }

            mergedIssueToPRs[getKeyIssueToPR(owner, repo, parseInt(issueNum))] = mergedOpenPRs;
        }

        mergedIssueToPRs[KEY_LAST_UPDATE_MILLIS] = new Date().getTime();

        await storage.set(mergedIssueToPRs);
    }

    async function maybeUpgradeDB(): Promise<void> {
        if (isDBInit) { return; }

        const storage = getStorage();
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

    function getStorage(): browser.storage.StorageArea { return browser.storage.local; }

    function getKeyIssueToPR(owner: string, repo: string, issue: number): string {
        return `is/${owner}/${repo}/${issue}`;
    }

    function extractIssueNumFromKeyIssueToPR(key: string): number | null {
        const matches = RE_KEY_ISSUE_TO_PR.exec(key);
        if (!matches) { return null; }
        return parseInt(matches[1]);
    }
}
