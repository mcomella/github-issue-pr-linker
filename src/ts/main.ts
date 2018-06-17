interface GithubPageType {
    urlMatches: Function,
    inject: Function,
}

const registeredGithubPageTypes: Array<GithubPageType> = [
    GithubPageIssue,
    GithubPagePR,
];

async function onPageLoad() { // Called by github_navigation.js.
    // TODO: remove added node (pass in container? location would depend on page though).
    const url = window.location;
    const matchingPageType = registeredGithubPageTypes.find(page => {
        return page.urlMatches(url);
    });

    if (matchingPageType != null) {
        matchingPageType.inject();
    }
}
