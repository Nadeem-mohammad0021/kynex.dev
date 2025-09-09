# 🚀 Custom Domain Deployment Guide

## 📋 **Pre-Deployment Checklist**

### ✅ **What You Need to Change:**

#### 1. **Environment Variables**
Replace `yourdomain.com` with your actual domain in:
- `.env.production` → `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`

#### 2. **Supabase Authentication Settings**
Go to your Supabase Dashboard:
1. **Authentication** → **URL Configuration**
2. **Site URL**: `https://yourdomain.com`
3. **Redirect URLs**: Add these:
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/auth/token-handler`

#### 3. **GitHub OAuth Settings** (if using GitHub)
In your GitHub App settings:
1. **Homepage URL**: `https://yourdomain.com`
2. **Authorization callback URL**: `https://yourdomain.com/auth/callback`

## 🌐 **Deployment Options**

### 🔥 **Option 1: Vercel (Recommended)**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Add environment variables in Vercel dashboard:
# - Go to your project settings
# - Add all variables from .env.production
```

### 🔷 **Option 2: Netlify**
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build and deploy
npm run build
netlify deploy --prod --dir=.next

# 3. Add environment variables in Netlify dashboard
```

### ⚙️ **Option 3: Custom Server**
```bash
# 1. Build the application
npm run build

# 2. Start production server
npm start

# 3. Configure reverse proxy (nginx/apache) to your domain
```

## 📝 **Environment Variables to Set**

Copy these to your hosting platform:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://djmjlquqzperhuxtyrqx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
LLAMA_3_3_8B_INSTRUCT_FREE_API_KEY=your-llama-key
MISTRAL_7B_INSTRUCT_FREE_API_KEY=your-mistral-key
OPENROUTER_API_KEY=your-openrouter-key
```

## ✅ **Post-Deployment Testing**

1. **Test Authentication**:
   - Go to `https://yourdomain.com/sign-in`
   - Try GitHub OAuth login

2. **Test AI Generation**:
   - Create a new workflow
   - Generate agent behavior

3. **Test Database**:
   - Verify workflows save correctly
   - Check My Agents page

## 🔧 **Custom Domain-Specific Changes**

### For **yourdomain.com**, change these files:

#### 1. **Update `.env.production`**:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

#### 2. **Update Supabase settings**:
- Site URL: `https://yourdomain.com`
- Redirect URL: `https://yourdomain.com/auth/callback`

#### 3. **Update GitHub OAuth** (if used):
- Authorization callback URL: `https://yourdomain.com/auth/callback`

## 🚨 **Important Notes**

1. **HTTPS Required**: Make sure your custom domain has SSL certificate
2. **Environment Variables**: Set all variables in your hosting platform
3. **Database**: No changes needed - same Supabase instance works
4. **API Keys**: Same OpenRouter keys work for production

## 📞 **Need Help?**

Common issues:
- **Auth not working**: Check redirect URLs in Supabase/GitHub
- **AI not working**: Verify OpenRouter API keys are set
- **Database errors**: Check Supabase connection and RLS policies

---

**Ready to deploy?** Just change the domain URLs and deploy! 🚀
