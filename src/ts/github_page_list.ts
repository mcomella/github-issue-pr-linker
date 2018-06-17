namespace GithubPageList {
    // samples:
    // - https://github.com/mozilla-mobile/focus-android/issues
    // - https://github.com/mozilla-mobile/focus-android/milestone/33
    const RE_URL = /.+github.com\/([^/]+)\/([^/]+)\/(issues|milestone\/[0-9]+)[^/]/;

    export function urlMatches(url: Location): boolean {
        return RE_URL.test(url.toString());
    }

    export async function inject() {
        const {repo, owner} = getRepoOwner(window.location);

        // TODO: perf of getting one issue from disk at a time?
        const issueNodes = Array.from(document.getElementsByClassName('d-table'));
        const issueNums = issueNodes.map(node => {
            const issueNumNode = document.getElementsByClassName('opened-by')[0] as HTMLSpanElement | null;
            if (!issueNumNode) { return; }
            return parseInt(issueNumNode.innerText.split(' ')[0].slice(1));
        }).filter(e => e) as number[];

        const prsForIssuesDeferred = issueNums.map(issueNum => {
            return Github.getPRsForIssue(owner, repo, issueNum);
        });

        const prs = await Promise.all(prsForIssuesDeferred);
        prs.forEach((prNums, index) => {
        });
    }

    function addToDOM(owner: string, repo: string, prs: Set<number>) {
        const container = GithubDOM.newContainerNode();
        const titleNode = GithubDOM.newTitleNode('PRs whose titles reference this issue (non-exhaustive):');
        container.appendChild(titleNode);
        const listNode = GithubDOM.newListNode();
        container.appendChild(listNode);

        const newNodes = Array.from(prs).map(prNum =>
                GithubDOM.createNodeForIssue(owner, repo, GithubPageType.PR, prNum));
        newNodes.forEach(node => listNode.appendChild(node));

        GithubDOM.insertAboveConversation(container);
    }

    function getRepoOwner(url: Location) {
        const maybeMatch = RE_URL.exec(url.toString());
        if (maybeMatch == null) { throw new Error('Regex doesn\'t match url'); }
        return {
            owner: maybeMatch[1],
            repo: maybeMatch[2],
        };
    }
}
