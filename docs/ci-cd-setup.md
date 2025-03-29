# CI/CD Pipeline Documentation

This document describes the continuous integration and continuous deployment (CI/CD) pipeline for the Steam Deck DUB Edition project.

## Overview

Our CI/CD pipeline automates testing, building, and deployment processes, ensuring code quality and reliable releases. The pipeline is implemented using GitHub Actions and consists of three main workflows:

1. **Continuous Integration (CI)** - Tests and validates code changes
2. **Continuous Deployment (CD)** - Builds and deploys code to staging and production
3. **Release Management** - Handles semantic versioning and changelog generation

## Workflow Details

### Continuous Integration (CI)

**Trigger:** Pull requests to `main` or `develop` branches, and direct pushes to these branches.

**File:** `.github/workflows/ci.yml`

**Steps:**
1. Code checkout
2. Node.js environment setup (tests multiple Node versions)
3. Dependency installation
4. Code linting
5. Unit testing
6. End-to-end testing
7. Test coverage reporting

**Usage:**
- CI runs automatically on PR creation and updates
- View test results in the GitHub Actions tab
- Test coverage reports are available as artifacts

### Continuous Deployment (CD)

**Trigger:** Pushes to `main` branch (for staging) or tags matching `v*.*.*` pattern (for production)

**File:** `.github/workflows/cd.yml`

**Steps:**
1. Code checkout
2. Node.js environment setup
3. Dependency installation
4. Application build
5. Deployment to appropriate environment (staging or production)
6. GitHub release creation (for tag deployments)

**Usage:**
- Staging deployments happen automatically when merging to `main`
- Production deployments happen when creating a release tag
- Access the deployed applications at:
  - Staging: `https://staging.steamdeckdubedition.com`
  - Production: `https://steamdeckdubedition.com`

### Release Management

**Trigger:** Manual workflow dispatch with version type selection

**File:** `.github/workflows/release.yml`

**Steps:**
1. Code checkout
2. Node.js environment setup
3. Dependency installation
4. Version bumping (patch, minor, or major)
5. Changelog generation
6. Changelog file update
7. Git tag creation
8. GitHub release creation

**Usage:**
1. Go to the "Actions" tab in GitHub
2. Select the "Release" workflow
3. Click "Run workflow"
4. Choose the version type (patch, minor, or major)
5. Click "Run workflow" to start the process

## Local Development Scripts

The package.json includes several scripts for local development and testing:

```bash
# Run the complete CI process locally
npm run ci

# Run tests with coverage reporting
npm run ci:coverage

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:prod

# Create a new release (patch, minor, or major)
npm run release:patch
npm run release:minor
npm run release:major
```

## Environment Variables

The following environment variables are used by the CI/CD pipeline:

### GitHub Secrets

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- `FTP_SERVER` - FTP server address for deployment
- `FTP_USERNAME` - FTP username for deployment
- `FTP_PASSWORD` - FTP password for deployment

### Deployment Configuration

- `STAGING_HOST` - Hostname for staging server
- `STAGING_USER` - Username for staging server
- `STAGING_PATH` - Deployment path on staging server
- `PRODUCTION_HOST` - Hostname for production server
- `PRODUCTION_USER` - Username for production server
- `PRODUCTION_PATH` - Deployment path on production server

## Best Practices

1. **Write Good Commit Messages**: Follow [conventional commits](https://www.conventionalcommits.org/) format
2. **Test Before Committing**: Run `npm run ci` locally before pushing changes
3. **Review CI Results**: Always check the CI results on your pull requests
4. **Semantic Versioning**: Follow [SemVer](https://semver.org/) guidelines:
   - Patch (1.0.x): Bug fixes and minor changes
   - Minor (1.x.0): New features, backward compatible
   - Major (x.0.0): Breaking changes

## Troubleshooting

### Failed CI Builds

1. Check the GitHub Actions logs for specific error messages
2. Run the tests locally using `npm run ci`
3. Fix the issues and push the changes

### Failed Deployments

1. Verify that the build process completes successfully
2. Check server connectivity and credentials
3. Review deployment logs in GitHub Actions

## Future Improvements

- Add performance testing to the CI pipeline
- Implement canary deployments for safer production updates
- Add automated rollback capabilities
- Expand test coverage requirements
- Add deployment notifications to Slack/Discord 