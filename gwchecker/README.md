## GWChecker Action

To assist in mitigating simple security mistakes in the YAML configuration for CI/CD workflows, we developed a workflow auditing GitHub action, GWChecker
 
 * The GWChecker passes the following checks on all of the workflows.
   * Are there any secrets present (using RegEx)?
   * Are you using tags for versioning?
   * Are you using actions that are not verified?
   * Is SUDO allowed by default on the box?

In addition to this GWChecker enforces a pre-commit hook that ensures that the files committed are not in ‘.github/workflow‘ to avoid having workflows that commit other workflow-related files to the repository.
