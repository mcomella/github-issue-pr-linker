namespace GithubPagePR {

    // sample: https://github.com/mozilla-mobile/focus-android/pull/2721
    const RE_URL = /.+github.com\/([^/]+)\/([^/]+)\/pull\/([0-9]+)/;

    export function urlMatches(url: Location): boolean {
        return RE_URL.test(url.toString());
    }

    export function inject() {
        const {repo, owner} = getRepoOwnerIssueNum(window.location);

        const prTitleNode = document.getElementsByClassName('js-issue-title')[0] as HTMLSpanElement;
        const prTitle = prTitleNode.innerText;
        const issues = GithubParser.getIssueNumsFromTitle(prTitle);
        if (issues.length > 0) {
            addToDOM(owner, repo, issues);
        }
    }

    function addToDOM(owner: string, repo: string, issueNumbers: number[]) {
        const container = GithubDOM.newContainerNode();
        const titleNode = GithubDOM.newTitleNode('Issues referenced in this PR title:');
        container.appendChild(titleNode);
        const listNode = GithubDOM.newListNode();
        container.appendChild(listNode);

        const newNodes = Array.from(issueNumbers).map(issueNum =>
                GithubDOM.createNodeForIssue(owner, repo, GithubPageType.ISSUE, issueNum));
        newNodes.forEach(node => listNode.appendChild(node));

        GithubDOM.insertAboveConversation(container);
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
