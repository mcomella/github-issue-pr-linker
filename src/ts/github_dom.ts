/*
 * Shared functions for operating on the GitHub DOM.
 */
namespace GithubDOM {

    export function createNodeForIssue(owner: string, repo: string, issueType: GithubPageType, num: number) {
        let issueTypeForUrl: string;
        if (issueType === GithubPageType.ISSUE) {
            issueTypeForUrl = 'issues';
        } else if (issueType === GithubPageType.PR) {
            issueTypeForUrl = 'pull';
        } else {
            throw new Error('Unknown GithubPageType: ' + issueType);
        }

        const listNode = document.createElement('li');

        const linkNode = document.createElement('a');
        linkNode.href = `https://github.com/${owner}/${repo}/${issueTypeForUrl}/${num}`
        linkNode.innerText = `#${num}`
        listNode.appendChild(linkNode);

        return listNode;
    }

    export function insertAboveConversation(node: HTMLElement) {
        const threadNode = document.getElementById('discussion_bucket');
        if (threadNode && threadNode.parentNode) {
            threadNode.parentNode.insertBefore(node, threadNode);
        }
    }

}
