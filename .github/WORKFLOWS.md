# GitHub Workflows Documentation

This document describes all the GitHub Actions workflows configured for this project.

## 📋 Overview

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [Deploy](#deploy-to-github-pages) | Push to `main` | Build and deploy site to GitHub Pages |
| [CI](#continuous-integration) | Push, PR to `main` | Lint, type check, and build validation |
| [PR Preview](#pr-preview-comment) | PR opened/updated | Post build information as PR comment |
| [Dependency Review](#dependency-review) | PR to `main` | Review dependencies for security issues |
| [CodeQL](#codeql-analysis) | Push, PR, Weekly | Security code scanning |

## Workflows

### Deploy to GitHub Pages

**File:** `.github/workflows/deploy.yml`

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Steps:**
1. Checkout repository
2. Setup Node.js 20 with npm caching
3. Install dependencies
4. Run type checking (`astro check`)
5. Build site for production
6. Upload build artifacts
7. Deploy to GitHub Pages

**Features:**
- ✅ npm caching for faster builds
- ✅ Type checking before deployment
- ✅ Concurrency control (one deployment at a time)
- ✅ Production environment variables

**Environment:**
- `NODE_ENV=production`

### Continuous Integration

**File:** `.github/workflows/ci.yml`

**Triggers:**
- Push to `main` branch
- Pull requests to `main`

**Jobs:**

#### 1. Lint and Type Check
- Runs Astro type checking
- Checks code formatting with Prettier (if configured)

#### 2. Build
- Builds the site
- Verifies dist directory is created
- Lists generated files

#### 3. Lighthouse CI
- Runs only on pull requests
- Performs Lighthouse audits
- Tests performance, accessibility, best practices, SEO
- Uploads results as artifacts

**Features:**
- ✅ Parallel job execution
- ✅ npm caching
- ✅ Concurrency control per PR

### PR Preview Comment

**File:** `.github/workflows/pr-preview.yml`

**Triggers:**
- Pull request opened
- Pull request synchronized (new commits)
- Pull request reopened

**Functionality:**
Posts a comment on PRs with:
- Build status (success/failure)
- Build size
- Number of files generated
- Number of HTML pages
- Commit and branch information
- Preview information

**Features:**
- ✅ Updates existing comment (no spam)
- ✅ Build statistics
- ✅ Helpful preview information

### Dependency Review

**File:** `.github/workflows/dependency-review.yml`

**Triggers:**
- Pull requests to `main`

**Functionality:**
- Reviews dependency changes
- Checks for known vulnerabilities
- Posts summary in PR comments
- Fails on moderate or higher severity issues

**Features:**
- ✅ Automated security scanning
- ✅ Vulnerability detection
- ✅ License compliance checking

### CodeQL Analysis

**File:** `.github/workflows/codeql.yml`

**Triggers:**
- Push to `main` branch
- Pull requests to `main`
- Weekly schedule (Mondays at midnight)

**Functionality:**
- Static code analysis
- Security vulnerability detection
- Identifies potential bugs
- Scans JavaScript/TypeScript code

**Features:**
- ✅ Automated security scanning
- ✅ Regular scheduled scans
- ✅ GitHub Security tab integration

## Dependabot Configuration

**File:** `.github/dependabot.yml`

**Functionality:**
Automated dependency updates for:
- npm packages (weekly, Mondays at 9 AM)
- GitHub Actions (weekly, Mondays at 9 AM)

**Grouping:**
- Astro-related packages grouped together
- Tailwind-related packages grouped together
- Dev dependencies grouped by type

**Features:**
- ✅ Automated PRs for updates
- ✅ Smart grouping to reduce PR noise
- ✅ Auto-assign to repository owner
- ✅ Proper labeling

## Required Secrets

No secrets are required for basic functionality. All workflows use default `GITHUB_TOKEN`.

## Required Repository Settings

### GitHub Pages

1. Go to **Settings** → **Pages**
2. Set **Source** to "GitHub Actions"
3. Save

### Branch Protection (Recommended)

For `main` branch:
1. Require pull request reviews
2. Require status checks to pass:
   - `Lint and Type Check`
   - `Build`
3. Require branches to be up to date
4. Restrict who can push to matching branches

## Workflow Permissions

All workflows use minimal required permissions:
- Most workflows: `contents: read`
- Deploy workflow: `contents: read`, `pages: write`, `id-token: write`
- PR workflows: `pull-requests: write`
- CodeQL: `security-events: write`

## Caching Strategy

All workflows use npm caching via `actions/setup-node@v4`:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
```

This significantly speeds up workflow runs by caching `node_modules`.

## Troubleshooting

### Build Fails on GitHub but Works Locally

1. Check Node.js version matches (20.x)
2. Ensure `package-lock.json` is committed
3. Check for environment-specific code
4. Review workflow logs for specific errors

### Deployment Not Triggering

1. Verify GitHub Pages source is set to "GitHub Actions"
2. Check branch name is exactly `main`
3. Ensure workflow file is in `.github/workflows/`
4. Check workflow permissions in repository settings

### Lighthouse CI Failing

1. Lighthouse runs against localhost - ensure preview server works
2. Check Lighthouse scores aren't below thresholds
3. Review Lighthouse artifacts for detailed reports

## Maintenance

### Updating Workflows

1. Create a new branch
2. Modify workflow files
3. Test in PR (most workflows will run)
4. Merge after verification

### Monitoring

- Check **Actions** tab for workflow runs
- Review **Security** tab for CodeQL findings
- Monitor **Dependabot** PRs for updates

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
