interface GithubPageType {
    urlMatches: Function,
    inject: Function,
}

const registeredGithubPageTypes: Array<GithubPageType> = [
    GithubIssue,
    GithubPR,
];

function onPageLoad() { // Called by github_navigation.js.
    const url = window.location;
    const matchingPageType = registeredGithubPageTypes.find(page => {
        return page.urlMatches(url);
    });

    if (matchingPageType != null) {
        matchingPageType.inject();
    }
}
