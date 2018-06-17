/*
 * The main interface to the GitHub API for the extension: it provides caching
 * and logic.
 */
namespace Github {

    const MIN_BETWEEN_UPDATES = 5;
    const MILLIS_BETWEEN_UPDATES = MIN_BETWEEN_UPDATES * 60 /* sec */ * 1000 /* ms */;

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

        const prs = await GithubCache.getIssueToPRs(owner, repo, issueNumber);
        if (prs) {
            return prs
        }

        return new Set();
    }

    async function maybeUpdatePRCache(owner: string, repo: string): Promise<void> {
        const lastUpdateMillis = await GithubCache.getLastUpdateMillis()
        const nowMillis = new Date().getTime();
        if (!lastUpdateMillis || lastUpdateMillis + MILLIS_BETWEEN_UPDATES < nowMillis) {
            Log.d('Fetching new data');
            const fetchedPRs = await GithubEndpoint.fetchOpenPRs(owner, repo);
            const issueToPRs = _convertFetchedPRsToIssuesToPRs(fetchedPRs);
            await GithubCache.mergeIssueToPRs(owner, repo, issueToPRs);
        } else {
            Log.d('Using cached data');
        }
    }

    export function _convertFetchedPRsToIssuesToPRs(fetchedPRs: GithubEndpoint.PR[]): ObjectNumberToNumberSet {
        let issueToPRs = {} as ObjectNumberToNumberSet
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
        return issueToPRs;
    }
}
