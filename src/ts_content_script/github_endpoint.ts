/*
 * Makes calls directly to the GitHub endpoint without caching.
 */
namespace GithubEndpoint {
    const SHOULD_MAKE_REQUEST = true;

    const BASE_URL = "https://api.github.com";

    export function fetchOpenPRs(owner: string, repo: string): Promise<Array<PR>> {
        if (!SHOULD_MAKE_REQUEST) {
            return new Promise((res, rej) => { res([]); }); // TODO: dummy data.
        }

        const url = `${BASE_URL}/repos/${owner}/${repo}/pulls?state=open`
        const request = new Request(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        // TODO: handle redirection
        // TODO: handle at API limit.
        return fetch(request).then(response => {
            if (response.status >= 300) {
                throw new Error('fetchOpenPRs response not success');
            }

            return response.json();
        });
    }

    export interface PR {
        id: number,
        title: string,
    }
}
