namespace GithubPageIssue {

    // sample: https://github.com/mozilla-mobile/focus-android/issues/2726
    const RE_URL = /.+github.com\/([^/]+)\/([^/]+)\/issues\/([0-9]+)/;

    export function urlMatches(url: Location): boolean {
        return RE_URL.test(url.toString());
    }

    export function inject() {
        const {repo, owner, issueNumber} = getRepoOwnerIssueNum(window.location);
        Github.getPRForIssue(owner, repo, issueNumber).then(pr => {
            // TODO: mutate the dom.
        });
    }

    function getRepoOwnerIssueNum(url: Location) {
        const maybeMatch = RE_URL.exec(url.toString());
        if (maybeMatch == null) { throw new Error('Regex doesn\'t match url'); }
        return {
            owner: maybeMatch[1],
            repo: maybeMatch[2],
            issueNumber: parseInt(maybeMatch[3]),
        }
    }
}
