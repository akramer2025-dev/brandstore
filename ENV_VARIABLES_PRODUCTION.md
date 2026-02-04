# 🔐 Environment Variables for Production

## Copy these to Vercel Dashboard

### 1. Database
```
DATABASE_URL=postgresql://neondb_owner:npg_maJHy8UkQ9qP@ep-lucky-frost-ahx6zz7q.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. NextAuth
```
NEXTAUTH_SECRET=dPJmbxjVNQHfR03jS22yl9jVY2DOsiQQmSHBJv/xZms=
NEXTAUTH_URL=https://brandstore.com
```

### 3. OpenAI (Optional)
```
OPENAI_API_KEY=your-openai-api-key-here
```

---

## ⚠️ Important Security Notes

### Generate New NEXTAUTH_SECRET for Production!

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Git Bash / Linux / Mac:**
```bash
openssl rand -base64 32
```

### Update NEXTAUTH_URL

Replace with your actual domain:
- Production: `https://brandstore.com`
- Staging: `https://brandstore-staging.vercel.app`

---

## 📝 How to Add in Vercel

1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable:
   - Name: `DATABASE_URL`
   - Value: [paste value]
   - Environment: Production (and Preview if needed)
4. Click "Save"
5. Redeploy after adding all variables

---

## ✅ Verification Checklist

After deployment, verify:
- [ ] Database connection works (check logs)
- [ ] Authentication works
- [ ] Images load properly
- [ ] Orders can be created
- [ ] Admin panel accessible

---

## 🔄 Update Variables

To update environment variables:
1. Settings → Environment Variables
2. Edit → Save
3. Redeploy from Deployments tab
