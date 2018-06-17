describe('The Github namespace', () => {

    it('converts raw PR json to issues-to-prs', () => {
        const expectedValueGenerator = {
            2174: 2624,
            2584: 2640,
            2682: 2697,
            2683: 2699,
            2686: 2700,
            2684: 2702,
            2677: 2713,
            2678: 2713,
            2687: 2719,
            2685: 2721,
            2730: 2739,
        } as ObjectNumberToNumber;
        const expectedValue = {} as ObjectNumberToNumberSet;
        for (const key in expectedValueGenerator) {
            expectedValue[key] = new Set([expectedValueGenerator[key]]);
        }

        const actualValue = Github._convertFetchedPRsToIssuesToPRs(rawPRJSON);
        expect(actualValue).toEqual(expectedValue);
    });

});
