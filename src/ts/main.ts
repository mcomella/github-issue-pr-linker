interface GithubPageFns {
    urlMatches: Function,
    inject: Function,
}

const registeredGithubPageFns: Array<GithubPageFns> = [
    GithubPageIssue,
    GithubPagePR,
];

async function onPageLoad() { // Called by github_navigation.js.
    GithubDOM.removeContainerNode();

    const url = window.location;
    const matchingPageType = registeredGithubPageFns.find(page => {
        return page.urlMatches(url);
    });

    if (matchingPageType != null) {
        matchingPageType.inject();
    }
}
