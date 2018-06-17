/*
 * Makes calls directly to the GitHub endpoint without caching.
 */
namespace GithubEndpoint {
    const SHOULD_MAKE_REQUEST = true;

    const BASE_URL = "https://api.github.com";

    export async function fetchOpenPRs(owner: string, repo: string): Promise<Array<PR>> {
        if (!SHOULD_MAKE_REQUEST) {
            return Promise.resolve(testData);
        }

        const url = `${BASE_URL}/repos/${owner}/${repo}/pulls?state=open`
        const request = new Request(url, {
            method: 'GET',
            headers: await getHeaders(),
        });

        return fetch(request).then(response => {
            if (response.status >= 300) {
                throw new Error('fetchOpenPRs response not success: ' + response.statusText);
            }

            return response.json();
        });
    }

    async function getHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
        } as { [key: string]: string };

        const accessToken = await OptionsStore.getPersonalAccessToken();
        if (accessToken.length > 0) {
            headers['Authorization'] = `token ${accessToken}`
        }

        return headers;
    }

    export interface PR {
        number: number,
        title: string,
    }

    const testData = [{
        number: 884,
        title: "[WAITING ON CI] Closes #883: Upgrade support lib and SDK to 27",
    }, {
        number: 725,
        title: "[NO MERGE] Double-tap to page up/down.",
    }];
}
