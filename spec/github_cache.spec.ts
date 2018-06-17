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
        await GithubCache.maybeUpgrade(mockStore)
        expect(Object.keys(backingData).length).toBe(1)
        expect(backingData[GithubCache.KEY_DB_VERSION]).toBe(GithubCache.DB_VERSION)
    });

    it('gets null for the last update millis if it hasn\'t been stored', async () => {
        const lastUpdateMillis = await GithubCache.getLastUpdateMillis(mockStore);
        expect(lastUpdateMillis).toBeNull;
    });

    it('gets pr data', async () => {
        // todo: getIssuesToPRs, getIssueToPRs
    });

    it('saves issue to PRs directly with no existing data', async () => {
        const owner = 'own';
        const repo = 'rep';
        const issueNumber = 4;

        const input = {} as ObjectNumberToNumberSet;
        input[issueNumber] = new Set([1, 2, 3]);

        await GithubCache.mergeIssueToPRs(owner, repo, input, mockStore)

        const actualValue = backingData[GithubCache.getKeyIssueToPR(owner, repo, issueNumber)];
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

        const actualValue = backingData[GithubCache.getKeyIssueToPR(owner, repo, issueNumber)];
        expect(actualValue).toEqual(new Set([1, 2, 3, 4, 5]));
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