#!/bin/bash

# Format of origin url in GitLab CI is as follows: http://user:pwd@mygitlabhost/path/to/repo.git
commit_msg=$1
origin_url=`git remote get-url origin`
url_regex='(.*)://(.*@)(.*)'
[[ $origin_url =~ $url_regex ]]
auth_url="${BASH_REMATCH[1]}://gitlab-ci-token:$GITLAB_TOKEN@${BASH_REMATCH[3]}"
git config --global user.email "buildserver@animech.com"
git config --global user.name "buildserver"
echo "Creating commit with message: '$commit_msg'"
git add .
git commit -a -m "$commit_msg"
echo "Pushing changes to branch '$CI_COMMIT_REF_NAME' with url '$auth_url'"
git push $auth_url HEAD:$CI_COMMIT_REF_NAME
