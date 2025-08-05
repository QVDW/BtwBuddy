# Auto-Updater Testing Guide

This guide will help you test and debug the auto-updater functionality in BtwBuddy.

## 🔧 Enhanced Features Added

### 1. Comprehensive Logging
- All auto-updater events are now logged to `%APPDATA%/BtwBuddy/logs/auto-updater.log`
- Detailed error information including stack traces
- Network connectivity and API response logging

### 2. Update Debugger Component
- Accessible via Settings → Developer Tools → Update Debugger
- Real-time status monitoring
- Manual update testing
- Log viewing and clearing
- Debug information display

### 3. Enhanced Error Handling
- Better error messages for users
- Network connectivity checks
- GitHub API error handling
- Graceful fallbacks

## 🧪 Testing Steps

### Step 1: Build and Test in Development
```bash
# Build the application
npm run build

# Test in development mode
npm run dev
```

### Step 2: Test the Update Debugger
1. Open the application
2. Go to Settings (gear icon)
3. Click "Open Debugger" in the Developer Tools section
4. Use the debugger to:
   - View current update status
   - Test manual update checks
   - View detailed logs
   - Clear logs for fresh testing

### Step 3: Test in Release Mode
```bash
# Build release version
npm run dist:win

# Install the release version
# The installer will be in the release/ directory
```

### Step 4: Simulate Update Scenarios

#### Scenario A: No Updates Available
1. Install version 1.0.2
2. Open Update Debugger
3. Click "Test Update Check"
4. Verify logs show "Update not available"

#### Scenario B: Update Available
1. Create a new GitHub release with version 1.0.3
2. Install version 1.0.2
3. Open Update Debugger
4. Click "Test Update Check"
5. Verify update detection and download

#### Scenario C: Network Issues
1. Disconnect internet
2. Open Update Debugger
3. Click "Test Update Check"
4. Verify error handling and user notification

## 🔍 Common Issues and Solutions

### Issue 1: "Failed to check for updates"
**Possible Causes:**
- Network connectivity issues
- GitHub API rate limiting
- Firewall blocking requests
- Invalid repository configuration

**Solutions:**
1. Check internet connection
2. Verify GitHub repository settings
3. Check firewall settings
4. Review logs in Update Debugger

### Issue 2: "Update downloaded but not installing"
**Possible Causes:**
- Insufficient permissions
- Antivirus blocking installation
- Corrupted download

**Solutions:**
1. Run as administrator
2. Temporarily disable antivirus
3. Clear update cache
4. Check logs for specific errors

### Issue 3: "No logs available"
**Possible Causes:**
- Log directory not created
- Permission issues
- Application not running

**Solutions:**
1. Check if logs directory exists: `%APPDATA%/BtwBuddy/logs/`
2. Run as administrator
3. Restart application
4. Check file permissions

## 📋 Debugging Checklist

### Before Testing
- [ ] Internet connection is stable
- [ ] GitHub repository is public
- [ ] Latest release is properly tagged
- [ ] Application is running with proper permissions

### During Testing
- [ ] Update Debugger shows current status
- [ ] Logs are being written
- [ ] Error messages are descriptive
- [ ] User notifications appear correctly

### After Testing
- [ ] Review all logs for errors
- [ ] Check network requests in browser dev tools
- [ ] Verify GitHub API responses
- [ ] Test on different network conditions

## 🛠️ Manual Testing Commands

### Check Logs Manually
```bash
# Windows
type "%APPDATA%\BtwBuddy\logs\auto-updater.log"

# Or open in Notepad
notepad "%APPDATA%\BtwBuddy\logs\auto-updater.log"
```

### Clear Logs Manually
```bash
# Windows
del "%APPDATA%\BtwBuddy\logs\auto-updater.log"
```

### Check Application Data Directory
```bash
# Windows
explorer "%APPDATA%\BtwBuddy"
```

## 🔧 Advanced Debugging

### Enable Verbose Logging
The auto-updater now includes detailed logging for:
- Network requests
- GitHub API responses
- File operations
- Error stack traces
- User interactions

### Monitor Network Traffic
Use browser dev tools or network monitoring tools to:
- Check GitHub API requests
- Verify download URLs
- Monitor response times
- Identify network issues

### Test Different Scenarios
1. **Fresh Installation**: Test on a clean system
2. **Update from Previous Version**: Test upgrade path
3. **Network Interruption**: Test during download
4. **Permission Issues**: Test with limited permissions
5. **Antivirus Interference**: Test with antivirus active

## 📊 Expected Log Output

### Successful Update Check
```
[2024-01-15T10:30:00.000Z] Initializing auto updater
[2024-01-15T10:30:00.100Z] Feed URL set successfully
[2024-01-15T10:30:03.000Z] Manual check for updates initiated
[2024-01-15T10:30:03.100Z] INFO Checking for updates...
[2024-01-15T10:30:03.500Z] INFO Update not available
```

### Error Scenario
```
[2024-01-15T10:30:00.000Z] Initializing auto updater
[2024-01-15T10:30:00.100Z] Feed URL set successfully
[2024-01-15T10:30:03.000Z] Manual check for updates initiated
[2024-01-15T10:30:03.100Z] ERROR Network error: ENOTFOUND
[2024-01-15T10:30:03.200Z] Auto updater error | Data: {"message":"Network error","code":"ENOTFOUND"}
```

## 🚀 Next Steps

1. **Test in Release Environment**: Build and test the actual release version
2. **Monitor Real Usage**: Deploy and monitor real user experiences
3. **Collect Feedback**: Use the debugger to help users report issues
4. **Iterate**: Improve based on real-world testing results

## 📞 Support

If you encounter issues:
1. Use the Update Debugger to collect logs
2. Check the troubleshooting section above
3. Review GitHub repository settings
4. Test on different network conditions
5. Verify release configuration

The enhanced logging and debugging tools should help identify and resolve most auto-updater issues quickly. 