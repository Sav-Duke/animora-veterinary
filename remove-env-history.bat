@echo off
REM Animora AI - Remove .env from git history and force push
REM Prerequisite: Install git-filter-repo (https://github.com/newren/git-filter-repo)

REM Step 1: Remove .env from all git history
echo Removing .env from git history...
git filter-repo --path .env --invert-paths

REM Step 2: Add .env to .gitignore (if not already present)
echo .env>>.gitignore

git add .gitignore
git commit -m "Add .env to .gitignore (prevent future commits)"

REM Step 3: Force push cleaned history to GitHub
echo Force pushing cleaned history...
git push --force

echo.
echo All done! .env and secrets removed from git history and remote.
pause
