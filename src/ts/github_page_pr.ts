namespace GithubPagePR {

    // sample: https://github.com/mozilla-mobile/focus-android/pull/2721
    const RE_URL = /.+github.com\/([^/]+)\/([^/]+)\/pull\/([0-9]+)/;

    export function urlMatches(url: Location): boolean {
        return RE_URL.test(url.toString());
    }

    export function inject() {
        Log.l('github PR');
    }
}
