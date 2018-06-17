describe('The GitHubParser', () => {
    it('gets no issue numbers from a title without numbers', () => {
        const titles = [
            'Title',
            'A simple title',
            'This is cool #hashtag',
            'ABC easy as 123',
            'This is #e3 right?'
        ];
        titles.forEach(title => {
            const actualValue = GithubParser.getIssueNumsFromTitle(title);
            expect(actualValue.length).toEqual(0);
        })
        expect(GithubParser.getIssueNumsFromTitle(''))
    });

    it('gets issue numbers from title with "Issue" notation', () => {
        const actualValue = GithubParser.getIssueNumsFromTitle('Issue #345: Add readme.');
        expect(actualValue.length).toEqual(1);
        expect(actualValue[0]).toEqual(345);
    });

    it('gets issue numbers from title with "Closes" notation', () => {
        const actualValue = GithubParser.getIssueNumsFromTitle('Closes #345: Add readme.');
        expect(actualValue.length).toEqual(1);
        expect(actualValue[0]).toEqual(345);
    });

    it('gets issue numbers from title with trailing notation', () => {
        const actualValue = GithubParser.getIssueNumsFromTitle('Add readme. (#345)');
        expect(actualValue.length).toEqual(1);
        expect(actualValue[0]).toEqual(345);
    });

    it('gets multiple issue numbers from title', () => {
        const actualValue = GithubParser.getIssueNumsFromTitle('Closes #345, Closes #567: Add readme.');
        expect(actualValue.length).toEqual(2);
        expect(actualValue).toContain(345);
        expect(actualValue).toContain(567);
    });
});
