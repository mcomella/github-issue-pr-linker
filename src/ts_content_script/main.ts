function onPageLoad() { // Called by github_navigation.js.
    GithubAPI.fetchOpenPRs('mozilla-mobile', 'focus-android').then(resItems => {
        console.log('fetched!');
        resItems.forEach(e => {
            Log.log(e.title);
        });
    }).catch(err => {
        Log.error(err);
    });
}
