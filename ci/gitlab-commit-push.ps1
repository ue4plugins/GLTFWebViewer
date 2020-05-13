# Format of origin url in GitLab CI is as follows: http://user:pwd@mygitlabhost/path/to/repo.git
$commit_msg = $args[0]
$url = $(git remote get-url origin)
$url -match '^(.*)://(.*@)(.*)'
$auth_url = $matches[1] + "://" + "$Env:BUILDSERVER_USERNAME" + ":" + "$Env:BUILDSERVER_PASSWORD" + "@" + $matches[3]
git config --global user.email "$Env:BUILDSERVER_USERNAME@animech.com"
git config --global user.name $Env:BUILDSERVER_USERNAME
Write-Host "Creating commit with message: '$commit_msg'"
git add .
git commit -a -m "$commit_msg"
Write-Host "Pushing changes to branch '$Env:CI_COMMIT_REF_NAME' with url '$auth_url'"
git push "$auth_url" HEAD:$Env:CI_COMMIT_REF_NAME
