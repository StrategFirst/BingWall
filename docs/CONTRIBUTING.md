# Welcome to BingWall docs contributing guide 

Thank you for investing your time in contributing to this project! 

## New contributor guide

To get an overview of the project, read the [README](README.md). Here are some resources to help you get started with open source contributions:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/quickstart/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

### Issues

#### Create a new issue

If you find anything that might be wrong :

 1. Search if an issue already exists [[How to?]](https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-issues-and-pull-requests#search-by-the-title-body-or-comments).
 2. If a related issue does exist, fill free to help anyone by adding any extra information you have.
 3. If a related issue doesn't exist, you can open a new issue using a relevant issue form or start from a blank one.

#### Solve an issue

If you're wishing to help us, you can solve issue by scanning through our existing issues to find one that interests you. You can narrow down the search using `labels` as filters or more information.

### Make Changes

If you want to make changes, either to fix or upgrade the project, first thanks for your investments and then there's the procedure you should follow :

1. Fork the repository.
- Using GitHub Desktop:
  - [Getting started with GitHub Desktop](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/getting-started-with-github-desktop) will guide you through setting up Desktop.
  - Once Desktop is set up, you can use it to [fork the repo](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/cloning-and-forking-repositories-from-github-desktop)!

- Using the command line:
  - [Fork the repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository) so that you can make your changes without affecting the original project until you're ready to merge them.

2. Make sure you met the requirements specified in the repo's wiki. And follow the wiki to start the app.

3. Create a working branch and start with your changes!

4. Commit the changes once you are happy with them. 

5. Once you've made all your changes, make a Pull Request (PR) onto the dev branch of this repo.

### Pull Request

When you're finished with the changes, create a pull request, also known as a PR.
- Create you're PR with all information, such has tags, a description of what the PR is about etc.
- Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if you are solving one.
- The PR changes might be edited before being merged if requried.
- As you update your PR and apply changes, mark each conversation as [resolved](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/commenting-on-a-pull-request#resolving-conversations).
- If you run into any merge issues, checkout this [git tutorial](https://github.com/skills/resolve-merge-conflicts) to help you resolve merge conflicts and other issues.

### Your PR is merged!

Congratulations :tada::tada: We thanks you :sparkles:.


This site can be developed on Windows, however a few potential gotchas need to be kept in mind:

1. Regular Expressions: Windows uses `\r\n` for line endings, while Unix-based systems use `\n`. Therefore, when working on Regular Expressions, use `\r?\n` instead of `\n` in order to support both environments. The Node.js [`os.EOL`](https://nodejs.org/api/os.html#os_os_eol) property can be used to get an OS-specific end-of-line marker.
2. Paths: Windows systems use `\` for the path separator, which would be returned by `path.join` and others. You could use `path.posix`, `path.posix.join` etc and the [slash](https://ghub.io/slash) module, if you need forward slashes - like for constructing URLs - or ensure your code works with either.
3. Bash: Not every Windows developer has a terminal that fully supports Bash, so it's generally preferred to write [scripts](/script) in JavaScript instead of Bash.
4. Filename too long error: There is a 260 character limit for a filename when Git is compiled with `msys`. While the suggestions below are not guaranteed to work and could cause other issues, a few workarounds include:
    - Update Git configuration: `git config --system core.longpaths true`
    - Consider using a different Git client on Windows