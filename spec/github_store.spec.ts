describe('The GithubStore', () => {

    beforeEach(() => {
        GithubStore._reset();
    });

    it('inits the DB with the current version when empty', async () => {
        const store = {
            get: () => { return Promise.resolve({}); },
            set: (items: any) => {
                expect(Object.keys(items).length).toBe(1)
                expect(items.dbVersion).toBe(GithubStore.DB_VERSION)
                return Promise.resolve();
            }
        } as browser.storage.StorageArea;

        return GithubStore.maybeUpgrade(store)
    });
});
