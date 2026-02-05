# Custom Domain Setup for GitHub Pages

If you want to use `stacktoheap.com` instead of `manojlds.github.io/stacktoheap/`, follow these steps:

## 1. Add CNAME File

Create a file named `CNAME` in the `public/` directory:

```
stacktoheap.com
```

## 2. Configure DNS

Add the following DNS records with your domain registrar:

### Option A: Apex Domain (stacktoheap.com)
```
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
```

### Option B: Subdomain (www.stacktoheap.com)
```
CNAME www   manojlds.github.io
```

## 3. Update Astro Config

Once the custom domain is configured, update `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://stacktoheap.com',
  // Remove or comment out the base property
  // base: '/stacktoheap',
  integrations: [
    // ...
  ],
});
```

## 4. Enable Custom Domain in GitHub

1. Go to repository Settings → Pages
2. Under "Custom domain", enter `stacktoheap.com`
3. Wait for DNS check to complete (may take a few minutes)
4. Enable "Enforce HTTPS" once available

## DNS Propagation

DNS changes can take 24-48 hours to propagate fully. You can check status at:
- https://www.whatsmydns.net/
- https://dnschecker.org/

## Verification

Once configured, your site will be accessible at:
- https://stacktoheap.com (if using apex domain)
- https://www.stacktoheap.com (if using www subdomain)

The GitHub Pages URL will automatically redirect to your custom domain.
