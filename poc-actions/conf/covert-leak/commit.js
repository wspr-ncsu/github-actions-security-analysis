const exec = require('child_process').execSync;

module.exports.start = function () {
    try {
        exec("git config --global user.email 'user@example.com' && git config --global user.name 'Divanix Action'");
        exec("echo 'hello' >> change-repo-third-party.md");
        exec("git add *");
        exec("git commit -a -m 'divanix action change'");
        exec('git push');   
        return true;
    } catch (error) {
        throw error;
    }
}