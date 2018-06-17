/*
 * Shared functions for operating on the GitHub DOM.
 */
namespace GithubDOM {

    const CONTAINER_ID = 'github-issue-pr-linker-container';

    export function newContainerNode() {
        const container = document.createElement('div');
        container.id = CONTAINER_ID;
        return container;
    }

    export function removeContainerNode() {
        const maybeContainer = document.getElementById(CONTAINER_ID);
        if (maybeContainer) {
            maybeContainer.remove();
        }
    }

    export function newTitleNode(title: string, linkText?: string, linkTitle?: string) {
        // TODO: link text.
        const titleNode = document.createElement('p');
        titleNode.innerText = title;
        titleNode.style.marginBottom = '0'; // Override GH style.
        return titleNode;
    }

    export function newListNode() {
        const listNode = document.createElement('ul');
        listNode.style.paddingLeft = '40px';
        listNode.style.marginBottom = '14px';
        return listNode;
    }

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
