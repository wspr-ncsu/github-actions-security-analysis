const fs = require('fs');
const core = require('@actions/core');
const artifact = require('@actions/artifact');
const artifactClient = artifact.create();
const artifactName = core.getInput('artifact-name');

(async () => {

    try {
        let content = 'This is artifact MODIFIED by third-party action';
        fs.writeFileSync('artifact.txt', content);
        let uploadResults = await artifactClient.uploadArtifact(artifactName, ['artifact.txt'], '.', {continueOnError: true });
        console.log(uploadResults);
    } catch (error) {
        core.setFailed(error.message)   ;
    }
})();