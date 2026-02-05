# PR Preview Deployment Setup

This guide will help you set up automated preview deployments for pull requests.

## 🎯 Features

- ✅ Automatic preview deployment for each PR
- ✅ Only verified contributors can trigger previews (security)
- ✅ Preview URL posted as PR comment
- ✅ Auto-cleanup when PR is closed
- ✅ Isolated from main site deployment

## 🔒 Security

The workflow includes security checks:
1. **No fork deployments** - PRs from forks are blocked
2. **Contributor verification** - Only users with write/admin access can trigger previews
3. **Separate secrets** - Preview deployments use separate API tokens

## 📋 Setup Options

### Option 1: Cloudflare Pages (Recommended)

**Pros:** Free unlimited sites, fast global CDN, simple setup
**Cons:** Requires Cloudflare account

#### Steps:

1. **Create Cloudflare Account** (if you don't have one)
   - Go to https://dash.cloudflare.com/sign-up
   - Free plan is sufficient

2. **Get API Token**
   - Go to https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use "Edit Cloudflare Workers" template
   - Add "Account - Cloudflare Pages - Edit" permission
   - Copy the token

3. **Get Account ID**
   - Go to https://dash.cloudflare.com/
   - Click on "Workers & Pages"
   - Your Account ID is shown on the right sidebar

4. **Add GitHub Secrets**
   - Go to your repository Settings → Secrets and variables → Actions
   - Add these secrets:
     - `CLOUDFLARE_API_TOKEN` - The API token from step 2
     - `CLOUDFLARE_ACCOUNT_ID` - The account ID from step 3

5. **Create Cloudflare Pages Project**
   ```bash
   # Install Wrangler CLI
   npm install -g wrangler

   # Login to Cloudflare
   wrangler login

   # Create pages project
   wrangler pages project create stacktoheap-preview
   ```

6. **Done!** The workflow is already configured in `.github/workflows/pr-preview-deploy.yml`

### Option 2: Netlify

**Pros:** Great DX, popular, generous free tier
**Cons:** Limited to 100 GB bandwidth/month on free plan

#### Steps:

1. **Create Netlify Account**
   - Go to https://app.netlify.com/signup
   - Free plan is sufficient

2. **Create New Site**
   - Click "Add new site" → "Import existing project"
   - Skip the Git connection (we'll deploy via API)
   - Note the Site ID from Settings → General → Site details

3. **Get API Token**
   - Go to User Settings → Applications
   - Click "New access token"
   - Copy the token

4. **Add GitHub Secrets**
   - `NETLIFY_AUTH_TOKEN` - The API token
   - `NETLIFY_SITE_ID` - The site ID

5. **Enable Netlify Workflow**
   ```bash
   # Disable Cloudflare workflow
   mv .github/workflows/pr-preview-deploy.yml .github/workflows/pr-preview-deploy.yml.disabled

   # Enable Netlify workflow
   mv .github/workflows/pr-preview-netlify.yml.example .github/workflows/pr-preview-netlify.yml
   ```

### Option 3: Vercel

**Pros:** Excellent platform, automatic HTTPS, great free tier
**Cons:** More complex API setup

#### Steps:

1. **Create Vercel Account**
   - Go to https://vercel.com/signup

2. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **Get Token**
   - Go to https://vercel.com/account/tokens
   - Create new token

4. **Link Project**
   ```bash
   vercel link
   ```

5. **Add GitHub Secrets**
   - `VERCEL_TOKEN` - Your Vercel token
   - `VERCEL_ORG_ID` - From .vercel/project.json
   - `VERCEL_PROJECT_ID` - From .vercel/project.json

## 🧪 Testing

Once set up:

1. Create a new branch
2. Make some changes
3. Open a PR
4. Wait for the workflow to run
5. Check the PR comment for the preview URL

## 🔍 How It Works

```
PR Opened/Updated
       ↓
Check if contributor (not from fork)
       ↓
Build Astro site
       ↓
Deploy to preview platform
       ↓
Post preview URL as comment
       ↓
PR Closed → Cleanup deployment
```

## 🚨 Troubleshooting

### Preview not deploying?
- Check if you're a repository contributor
- Check if secrets are set correctly
- Verify you're not creating PR from a fork

### URL not working?
- Wait 1-2 minutes for DNS propagation
- Check workflow logs for errors
- Verify the platform account is active

### Want to disable previews?
Rename the workflow file to `.disabled`:
```bash
mv .github/workflows/pr-preview-deploy.yml .github/workflows/pr-preview-deploy.yml.disabled
```

## 💰 Cost Comparison

| Platform | Free Tier | Bandwidth | Sites |
|----------|-----------|-----------|-------|
| Cloudflare Pages | Yes | Unlimited | Unlimited |
| Netlify | Yes | 100 GB/month | 1 concurrent build |
| Vercel | Yes | 100 GB/month | Unlimited |

## 📚 Additional Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Netlify Deploy Docs](https://docs.netlify.com/site-deploys/overview/)
- [Vercel Deployments](https://vercel.com/docs/deployments/overview)
