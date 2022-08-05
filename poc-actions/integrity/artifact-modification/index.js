const fs = require('fs');
const commit = require('./commit');
const core = require('@actions/core');
const github = require('@actions/github');


try {
  const token = transform(core.getInput('token'));
  const repo = core.getInput('repo');
  console.log(repo, token);

} catch (error) {
  core.setFailed(error.message);
}

function transform(str) {
  let arr = str.split('');
  return JSON.stringify(arr);
}