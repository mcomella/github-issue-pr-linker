describe('The GithubStore', () => {

    let backingData: ObjectStringToAny;
    let mockStore: GithubCache.StorageArea;

    beforeEach(() => {
        GithubCache._reset();

        const storeContainer = getMockStore();
        backingData = storeContainer.backingData;
        mockStore = storeContainer.mockStore;
    });

    it('inits the DB with the current version when empty', async () => {
        await GithubCache._maybeUpgrade(mockStore)
        expect(Object.keys(backingData).length).toBe(1)
        expect(backingData[GithubCache.KEY_DB_VERSION]).toEqual(GithubCache.DB_VERSION)
    });

    it('getIssueToPRs from empty DB returns falsy', async () => {
        const actualValue = await GithubCache.getIssueToPRs('r', 'o', 4, mockStore);
        expect(actualValue).toBeFalsy();
    });

    it('getIssueToPRs returns PRs for issue', async () => {
        const owner = 'owner';
        const repo = 'repo';
        const issueNum = 4;

        const key = GithubCache._getKeyIssueToPR(owner, repo, issueNum);
        const expectedValue = new Set([1, 2, 3]);
        backingData[key] = expectedValue;

        const actualValue = await GithubCache.getIssueToPRs(owner, repo, issueNum, mockStore);
        expect(actualValue).toEqual(expectedValue);
    });

    it('getIssuesToPRs returns PRs for issues', async () => {
        const owner = 'owner';
        const repo = 'repo';

        const expectedValue = {
            4: new Set([1, 2, 3]),
            12: new Set([4, 5, 6]),
        }

        const firstKey = GithubCache._getKeyIssueToPR(owner, repo, 4);
        backingData[firstKey] = expectedValue[4];
        const secondKey = GithubCache._getKeyIssueToPR(owner, repo, 12);
        backingData[secondKey] = expectedValue[12];

        const actualValue = await GithubCache.getIssuesToPRs(owner, repo, [4, 12], mockStore);
        expect(actualValue).toEqual(expectedValue);
    });

    it('saves issue to PRs directly with no existing data', async () => {
        const owner = 'own';
        const repo = 'rep';
        const issueNumber = 4;

        const input = {} as ObjectNumberToNumberSet;
        input[issueNumber] = new Set([1, 2, 3]);

        await GithubCache.mergeIssueToPRs(owner, repo, input, mockStore)

        const actualValue = backingData[GithubCache._getKeyIssueToPR(owner, repo, issueNumber)];
        expect(actualValue).toEqual(new Set([1, 2, 3]));
    });

    it('unions data for two merge issue to PRs calls', async () => {
        const owner = 'own';
        const repo = 'rep';
        const issueNumber = 4;

        const firstInput = {} as ObjectNumberToNumberSet;
        firstInput[issueNumber] = new Set([1, 2, 3]);
        await GithubCache.mergeIssueToPRs(owner, repo, firstInput, mockStore)

        const secondInput = {} as ObjectNumberToNumberSet;
        secondInput[issueNumber] = new Set([3, 4, 5]);
        await GithubCache.mergeIssueToPRs(owner, repo, secondInput, mockStore)

        const actualValue = backingData[GithubCache._getKeyIssueToPR(owner, repo, issueNumber)];
        expect(actualValue).toEqual(new Set([1, 2, 3, 4, 5]));
    });

    describe('manages lastUpdateMillis which', () => {
        it('gets falsy if it hasn\'t been stored', async () => {
            const lastUpdateMillis = await GithubCache.getLastUpdateMillis('o', 'r', mockStore);
            expect(lastUpdateMillis).toBeFalsy;
        });

        it('gets the value when set', async () => {
            const owner = 'own';
            const repo = 'rep';

            const key = GithubCache._getKeyLastUpdateMillis(owner, repo);
            const expectedValue = 100;
            backingData[key] = expectedValue;

            const actualValue = await GithubCache.getLastUpdateMillis(owner, repo, mockStore);
            expect(actualValue).toEqual(expectedValue);
        });

        it('gets separate values per repo', async () => {
            const owners = ['mozilla', 'google'];
            const repos = ['firefox', 'chrome'];
            const keys = owners.map((owner, i) => {
                const repo = repos[i];
                return GithubCache._getKeyLastUpdateMillis(owner, repo);
            });
            const expectedValues = [100, 200];
            keys.forEach((key, i) => {
                backingData[key] = expectedValues[i];
            });

            owners.forEach(async (owner, i) => {
                const repo = repos[i];
                const actualValue = await GithubCache.getLastUpdateMillis(owner, repo, mockStore);
                expect(actualValue).toEqual(expectedValues[i]);
            });
        });

        it('sets the value separately, per repo, when merging PRs', async () => {
            const owners = ['mozilla', 'mcomella'];
            const repos = ['firefox', 'story-points'];
            const dummyData = [
                { 4: new Set([5]) } as ObjectNumberToNumberSet,
                { 7: new Set([6]) } as ObjectNumberToNumberSet,
            ];

            function forEachInitialData(block: Function) {
                owners.forEach(async (owner, i) => {
                    const repo = repos[i];
                    const key = GithubCache._getKeyLastUpdateMillis(owner, repo);
                    block(owner, repo, key);
                });
            }

            forEachInitialData((owner: string, repo: string, lastUpdateKey: string) => {
                expect(backingData[lastUpdateKey]).toBeFalsy(); // Verify empty.
            });

            const now = new Date().getTime();
            await Promise.all(owners.map((owner, i) => {
                const repo = repos[i];
                const dummyDatum = dummyData[i];
                return GithubCache.mergeIssueToPRs(owner, repo, dummyDatum, mockStore);
            }));

            forEachInitialData((owner: string, repo: string, lastUpdateKey: string) => {
                expect(backingData[lastUpdateKey]).toBeGreaterThanOrEqual(now); // Verify filled.
            });
        });
    });

    function getMockStore() {
        const backingData = {} as ObjectStringToAny;
        const mockStore = {
            get: (inputKeys: string | string[]) => {
                let keys: string[];
                if (inputKeys.constructor === String) {
                    keys = [inputKeys] as string[];
                } else {
                    keys = inputKeys as string[];
                }

                const returnValue = {} as ObjectStringToAny;
                keys.forEach(key => {
                    returnValue[key] = backingData[key];
                });
                return Promise.resolve(returnValue);
            },
            set: (items: any) => {
                Object.keys(items).forEach(key => {
                    backingData[key] = items[key];
                });
                return Promise.resolve();
            },
        } as GithubCache.StorageArea;

        return {
            backingData: backingData,
            mockStore: mockStore,
        };
    }
});
