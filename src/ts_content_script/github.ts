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
    export async function getPRForIssue(owner: string, repo: string, issueNumber: number): Promise<GithubEndpoint.PR[]> {
        // todo: add storage perm.
        await ensurePRCacheUpdated(owner, repo);
        return getStorage().get(getKeyIssueToPR(owner, repo, issueNumber));
    }

    async function ensurePRCacheUpdated(owner: string, repo: string): Promise<void> {
        await maybeUpgradeDB();

        const { lastUpdateMillis } = await getStorage().get(KEY_LAST_UPDATE_MILLIS);
        const nowMillis = new Date().getTime();
        if (!lastUpdateMillis || lastUpdateMillis + MILLIS_BETWEEN_UPDATES < nowMillis) {
            await fetchAndMergeOpenPRs(owner, repo);
        }
    }

    async function fetchAndMergeOpenPRs(owner: string, repo: string): Promise<void> {
        let issueToPRs = Types.newDefaultStringToArrayNumSet(); // Set to remove dupes.
        const prs = await GithubEndpoint.fetchOpenPRs(owner, repo)
        prs.forEach(pr => {
            GithubParser.getIssueNumsFromTitle(pr.title).forEach(issueNum => {
                issueToPRs[issueNum].add(pr.id);
            });
        });

        await mergeOpenPRs(issueToPRs);
    }

    async function mergeOpenPRs(remoteIssueToOpenPRs: StringToArrayNumSet): Promise<void> {
        const remoteIssueNums = []; // TODO: better keys? Helper fn?
        for (const issueNum in remoteIssueToOpenPRs) { remoteIssueNums.push(issueNum); }

        const storage = getStorage();
        const storedIssueToPRs = await storage.get(remoteIssueNums);
        const mergedIssueToPRs = {} as ObjectKeyToAny;
        for (const key in storedIssueToPRs) { // todo: contains all requested keys, right?
            const issueNum = extractIssueNumFromKeyIssueToPR(key);
            if (issueNum === null) { throw new Error('Issue number from key unexpectedly null'); }

            // TODO: should we remove outdated PRs, e.g. if stored has something remote doesn't?
            const remoteOpenPRs = remoteIssueToOpenPRs[issueNum];
            const storedOpenPRs = storedIssueToPRs[issueNum] as number[];

            const mergedOpenPRs = new Set(remoteOpenPRs);
            storedOpenPRs.forEach(prNum => mergedOpenPRs.add(prNum));

            mergedIssueToPRs[key] = mergedOpenPRs; // TODO: can we store Set?
        }

        mergedIssueToPRs[KEY_LAST_UPDATE_MILLIS] = new Date().getTime();

        await storage.set(mergedIssueToPRs);
    }

    async function maybeUpgradeDB(): Promise<void> {
        if (isDBInit) { return; }

        const storage = getStorage();
        const { dbVersion } = await storage.get(KEY_DB_VERSION);
        if (!dbVersion) {
            const storageObj = {} as ObjectKeyToAny
            storageObj[KEY_DB_VERSION] = DB_VERSION;
            await storage.set(storageObj);
        } else if (dbVersion !== DB_VERSION) {
            // Upgrade for future versions...
        }

        isDBInit = true;
    }

    function getStorage(): browser.storage.StorageArea { return browser.storage.local; }

    function getKeyIssueToPR(owner: string, repo: string, issue: number): string {
        return `is_${owner}_${repo}_${issue}`;
    }

    function extractIssueNumFromKeyIssueToPR(key: string): number | null {
        const matches = RE_KEY_ISSUE_TO_PR.exec(key);
        if (!matches) { return null; }
        return parseInt(matches[1]);
    }
}
