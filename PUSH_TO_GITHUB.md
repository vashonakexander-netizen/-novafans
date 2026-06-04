# 🔗 Push to GitHub - Authentication Guide

Your repository is already connected to:
`https://github.com/vashonakexander-netizen/-novafans.git`

## Option 1: Use SSH (Recommended - No password needed)

### Step 1: Check if you have SSH key
```bash
ls -la ~/.ssh/id_rsa.pub
```

### Step 2: If you don't have one, create it
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter for all prompts
```

### Step 3: Copy your public key
```bash
cat ~/.ssh/id_rsa.pub
# Copy the entire output
```

### Step 4: Add to GitHub
1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Paste your key
4. Click "Add SSH key"

### Step 5: Change remote to SSH
```bash
cd /Users/vash/novafans
git remote set-url origin git@github.com:vashonakexander-netizen/-novafans.git
git push origin main
```

---

## Option 2: Use Personal Access Token (Easier)

### Step 1: Create Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: "NovaFans Deployment"
4. Select scopes: ✅ `repo` (all)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Push with token
```bash
cd /Users/vash/novafans
git push origin main
```

When it asks for:
- **Username:** `vashonakexander-netizen`
- **Password:** Paste your Personal Access Token (not your GitHub password!)

---

## Option 3: Use GitHub CLI (Easiest)

```bash
# Install GitHub CLI (if not installed)
brew install gh

# Login
gh auth login

# Push
cd /Users/vash/novafans
git push origin main
```

---

## Quick Push (After Authentication)

Once authenticated, just run:
```bash
cd /Users/vash/novafans
git push origin main
```

