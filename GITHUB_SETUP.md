# 🔗 Connect to GitHub - Quick Setup

## Your Repository
Already connected to: `https://github.com/vashonakexander-netizen/-novafans.git`

## Easiest Method: GitHub CLI

### Step 1: Install GitHub CLI
```bash
brew install gh
```

### Step 2: Login to GitHub
```bash
gh auth login
```

Follow the prompts:
- **GitHub.com?** Yes
- **HTTPS?** Yes
- **Authenticate Git?** Yes
- **Login with web browser?** Yes (opens browser)
- Click "Authorize" in browser

### Step 3: Push Your Code
```bash
cd /Users/vash/novafans
git push origin main
```

---

## Alternative: Personal Access Token

If you prefer not to use CLI:

### Step 1: Create Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "NovaFans"
4. Expiration: 90 days (or No expiration)
5. Select: ✅ `repo` (all repo permissions)
6. Click "Generate token"
7. **COPY THE TOKEN** (starts with `ghp_...`)

### Step 2: Push
```bash
cd /Users/vash/novafans
git push origin main
```

When prompted:
- **Username:** `vashonakexander-netizen`
- **Password:** Paste your token (NOT your GitHub password!)

---

## After Pushing

Once code is on GitHub:
1. Go to: https://vercel.com
2. Sign in with GitHub
3. Import your repo
4. Deploy!

