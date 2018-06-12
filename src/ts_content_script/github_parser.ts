namespace GithubParser {

    const RE_ISSUE_NUMBER = /#([0-9])+/g

    export function getIssueNumsFromTitle(title: string): Array<number> {
        const issueNumbers = [];
        let match;
        while ((match = RE_ISSUE_NUMBER.exec(title)) !== null) {
            issueNumbers.push(parseInt(match[1]));
        }
        return issueNumbers;
    }

}
