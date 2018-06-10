namespace GithubPageIssue {

    // sample: https://github.com/mozilla-mobile/focus-android/issues/2726
    const RE_URL = /.+github.com\/([^/]+)\/([^/]+)\/issues\/([0-9]+)/;

    export function urlMatches(url: Location): boolean {
        return RE_URL.test(url.toString());
    }

    export function inject() {
    }

    // GithubAPI.fetchOpenPRs('mozilla-mobile', 'focus-android').then(resItems => {
    //     console.log('fetched!');
    //     resItems.forEach(e => {
    //         Log.log(e.title);
    //     });
    // }).catch(err => {
    //     Log.error(err);
    // });
}
