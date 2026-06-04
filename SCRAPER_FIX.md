# Scraper Fix Guide

## Common Issues & Solutions

### Issue: "Failed to create scrape job"

**Possible Causes:**

1. **API Server Not Running**
   - Check: `curl http://localhost:3001/health`
   - Fix: Start API server with `cd apps/api && pnpm dev`

2. **Validation Error**
   - The DTO validation might be rejecting the request
   - Check browser console for exact error message
   - The endpoint now has better error handling

3. **Database Connection**
   - Prisma might not be connected
   - Check API logs for database errors

4. **CORS Issues**
   - Make sure frontend origin is allowed
   - Check `apps/api/src/main.ts` CORS config

## Testing the Scraper

### Test with curl:
```bash
curl -X POST http://localhost:3001/scraper/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "sourceUrl": "https://toflx.com/movies/one-battle-after-another-2025",
    "config": {
      "apiHeaders": {
        "Cookie": "pip=ap4kt4641myj; si2=1759548421; ..."
      }
    }
  }'
```

### Check API Logs:
```bash
# If running in background
tail -f /tmp/api-server.log

# Or check the terminal where you started the API
```

### Verify Endpoint:
```bash
curl http://localhost:3001/scraper/scrape -X POST \
  -H "Content-Type: application/json" \
  -d '{"sourceUrl":"https://example.com"}'
```

## Debug Steps

1. **Check API is running:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check endpoint exists:**
   ```bash
   curl -X POST http://localhost:3001/scraper/scrape \
     -H "Content-Type: application/json" \
     -d '{"sourceUrl":"https://example.com"}'
   ```

3. **Check browser console:**
   - Open DevTools (F12)
   - Go to Network tab
   - Try scraping again
   - Check the request/response

4. **Check API logs:**
   - Look for error messages
   - Check for validation errors
   - Check for database connection issues

## Fixed Issues

✅ Better error handling in controller
✅ More lenient DTO validation
✅ Clearer error messages
