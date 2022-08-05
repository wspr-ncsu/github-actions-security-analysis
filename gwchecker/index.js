const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const YAML = require('yaml')
const request = require('sync-request');
const cheerio = require('cheerio');
const { exec } = require("child_process");

/**
 * The GWChecker passies some basic checks on all of the workflows.
 * Are there any secrets present (using RegEx).
 * Are you using Tags for versioning.
 * Are you using actions that are not-verified.
 * Is SUDO allowed by default on the box.
 */

regexs = {
    "yaml": "^.*\.(yaml|YAML|yml|YML)$",
    "secrets": {
        "twitter Token": "[1-9][0-9]+-[0-9a-zA-Z]{40}",
        "facebook Token": "EAACEdEose0cBA[0-9A-Za-z]+",
        "Youtube API Key": "AIza[0-9A-Za-z\-_]{35}",
        "Youtube OAuth ID": "[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com",
        "Picatic API Key": "sk_live_[0-9a-z]{32}",
        "Stripe Standard API Key": "sk_live_[0-9a-zA-Z]{24}",
        "Stripe Restricted API Key": "rk_live_[0-9a-zA-Z]{24}",
        "Square Access Token": "sq0atp-[0-9A-Za-z\-_]{22}",
        "Square Oauth Secret": "sq0csp-[0-9A-Za-z\-_]{43}",
        "Paypal Braintree Access Token": "access_token\$production\$[0-9a-z]{16}\$[0-9a-f]{32}",
        "Amazon MWS Auth Token": "amzn\.mws\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
        "Twilio API Key": "SK[0-9a-fA-F]{32}",
        "MailGun API Key": "key-[0-9a-zA-Z]{32}",
        "MailChip API Key": "[0-9a-f]{32}-us[0-9]{1,2}",
        "AWS Access Key ID": "AKIA[0-9A-Z]{16}",
        "AWS Secret Access Key": "(?<!@)(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])*" // Modifed not to capture sha hashes used for versioning
    },
}


pre_commit = `
#!/bin/bash
git diff --cached --diff-filter=AM | grep -q .github
if [ $? -eq 0 ]
then
  echo "Changes to .github folder detected"
  exit 1
fi
`;

function verify(action, author) { // I am really set on not doing this statically
    const URL = `https://github.com/marketplace?type=actions&query=${action} publisher:${author}`
    let resp = request("GET", URL);

    let resultSection = cheerio.load(resp.body.toString())(".col-md-6.mb-4.d-flex.no-underline");
    if (!resultSection || resultSection.length == 0) {
        return -2;
    }
    let item = cheerio.load(resultSection.html());
    if (item('.octicon-verified') != undefined && item('.octicon-verified').length == 1) {
        return 0;
    } else {
        return -1;
    }
}
// Search .github/* for yanl files recursively! 
function search(directory) {
    let yamlFiles = []
    let directories = []
    let subf = fs.readdirSync(directory);
    for (let index in subf) {
        let file = subf[index];
        let fullPath = directory + '/' + file
        if (fs.statSync(fullPath).isDirectory()) {
            directories.push(fullPath);
        } else if (file.match(regexs['yaml'])) {
            yamlFiles.push(fullPath);
        }
    }

    while (directories.length != 0) {
        // console.log(yamlFiles);
        yamlFiles = yamlFiles.concat(search(directories.pop()));
    }

    // console.log(yamlFiles);
    return yamlFiles;

}

try {
    // Write a pre-commit hook to make sure no action can push changes to the workflows!
    fs.writeFile('.git/hooks/pre-commit', pre_commit, function (err) {
        if (err) {
            console.log("failed to write pre-commit hook, did you clone the repo?")
            console.log(err);
            return; 
        }
      });
    // Seek all the files
    let yamlFiles = search("./.github");

    // SUDO? 
    exec("sudo -n ls", (error, stdout, stderr) => { 
        if(!error) {
            console.log("Warning: The actions are allowed to elevate privileges with a passwordless sudo");
        }

    })
    // go through one by one
    for (let idx in yamlFiles) {
        // Start by looking at secrets
        let file = yamlFiles[idx].replace("./", "");

        console.log(`Scanning ${file}.`);
        try {
            let data = fs.readFileSync(file).toString("utf8");
            if (data.length <= 2) { // Let's skip blank files 
                continue
            }
            for (let option in regexs.secrets) {
                let match = data.match(regexs.secrets[option])
                if (match) {
                    match.forEach(e => console.log(`\tFound ${option} in ${file}: ${e}.`));
                    
                }
            }
            // Now let's look at the actions you are using and how you are versioning them
            let parsedData = YAML.parse(data)
            if (Array.isArray(parsedData['on'])) { // If we are dealing with an array, we just need to loop through all of the elements
                for (let elementIDX in parsedData['on']) {
                    if (parsedData['on'][elementIDX] === "pull_request") {
                        console.log(`\tWorkflow can be triggered using a pull request due to: ${JSON.stringify(parsedData['on'])}.`);
                    }
                }
            } else { // Otherwise it's an object and we need to loop through the keys
                for (let element in parsedData['on']) {
                    if (element === "pull_request") {
                        console.log(`\tWorkflow can be triggered using a pull request due to: ${JSON.stringify(parsedData['on'])}.`);
                    }
                    if (element === "pull_request_target") {
                        console.log(`\tWorkflow can be triggered using a pull request due to: ${JSON.stringify(parsedData['on'])}.`);
                    }
                }
            }

            for (let jobTitle in parsedData['jobs']) {
                let job = parsedData['jobs'][jobTitle];

                for (const step of job['steps']) {
                    if (step['uses']) {
                        let uses = step['uses'];
                        let versioning = uses.split("@")[1];
                        let name = uses.split("@")[0]
                        if (versioning != "HEAD" && (versioning.length < 40 || versioning.match(/\.|-/))) {
                            console.log(`\tWorkflow uses ${name} with a developer control tag ${versioning} for versioning, consider using a commit hash.`);
                        }
                        let marketplaceStatus = verify(name.split('/')[1], name.split('/')[0]);
                        if (marketplaceStatus == -1) {
                            console.log(`\tWorkflow uses ${name} which appears not to be verified on the marketplace`);
                        } else if (marketplaceStatus == -2) {
                            console.log(`\tWorkflow uses ${name} which appears not to be published on the marketplace`);
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`\tError while reading ${file}: ${e}.`);
        }

    }
    // report
} catch (error) {
    core.setFailed(error.message);
}
