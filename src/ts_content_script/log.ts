namespace Log {
    const LOGTAG = 'github-issue-pr-linker';

    export function log(msg: string) { _log(msg, console.log); }
    export function warn(msg: string) { _log(msg, console.warn); }
    export function error(msg: string) { _log(msg, console.error); }

    function _log(msg: string, fn: Function) {
        fn(`${LOGTAG}: ${msg}`);
    }
}
