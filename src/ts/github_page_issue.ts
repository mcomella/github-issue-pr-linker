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
        addToDOM(owner, repo, issueNumber, prs);
    }

    function addToDOM(owner: string, repo: string, issueNumber: number, prs: Set<number>) {
        const container = document.createElement('div');

        const titleNode = document.createElement('p');
        titleNode.innerText = 'PRs whose titles reference this issue (non-exhaustive):';
        titleNode.style.marginBottom = '0'; // Override GH style.
        container.appendChild(titleNode);

        const listNode = document.createElement('ul');
        listNode.style.paddingLeft = '40px';
        listNode.style.marginBottom = '14px';
        container.appendChild(listNode);
        const newNodes = Array.from(prs).map(prNum =>
                GithubDOM.createNodeForIssue(owner, repo, GithubPageType.PR, prNum));
        newNodes.forEach(node => listNode.appendChild(node));

        insertAboveConversation(container);
    }

    function insertAboveConversation(node: HTMLElement) {
        const threadNode = document.getElementById('discussion_bucket');
        if (threadNode && threadNode.parentNode) {
            threadNode.parentNode.insertBefore(node, threadNode);
        }
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
