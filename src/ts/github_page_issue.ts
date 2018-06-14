namespace GithubPageIssue {

    // sample: https://github.com/mozilla-mobile/focus-android/issues/2726
    const RE_URL = /.+github.com\/([^/]+)\/([^/]+)\/issues\/([0-9]+)/;

    export function urlMatches(url: Location): boolean {
        return RE_URL.test(url.toString());
    }

    export async function inject() {
        const {repo, owner, issueNumber} = getRepoOwnerIssueNum(window.location);
        // TODO: if we throw, should we notify the user? Should we always add content?
        let prs = await Github.getPRsForIssue(owner, repo, issueNumber);
        console.log(prs); // todo: test network, test merging, other pages.
        // addToDOM(prs);
    }

    function addToDOM(prs: GithubEndpoint.PR[]) {
        const newNodes = prs.map(createNodeForPR);
        const container = document.createElement('div');
        newNodes.forEach(node => container.appendChild(node));

        // TODO: find github node, add child.
    }

    function createNodeForPR(pr: GithubEndpoint.PR): HTMLDivElement {
        const node = document.createElement('div');
        return node;
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
