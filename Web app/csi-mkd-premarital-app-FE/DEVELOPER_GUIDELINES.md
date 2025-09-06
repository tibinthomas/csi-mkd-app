# Developer Guidelines

## Console Usage Policy

**IMPORTANT: Avoid console statements in production code.**

### ❌ Do NOT use console statements for:
- Debug information
- Development logging
- Informational messages
- Success confirmations
- Progress indicators

### ✅ ONLY use console statements for:
- Critical error logging (console.error)
- Important warnings that require developer attention (console.warn)

### ESLint Configuration
The project has `"no-console": "error"` configured in `.eslintrc.json` to prevent console usage.

### Best Practices

#### Instead of console.log for debugging:
```typescript
// ❌ Bad
console.log('User data:', userData);

// ✅ Good - Use Angular DevTools, browser debugger, or development environment checks
if (!environment.production) {
  // Development-only code can be conditionally executed
  debugger; // Use breakpoints instead
}
```

#### Error Handling:
```typescript
// ❌ Bad
try {
  // some operation
} catch (error) {
  console.log('Something went wrong');
}

// ✅ Good - Use proper error handling
try {
  // some operation
} catch (error) {
  // Only log critical errors that need developer attention
  console.error('Critical API failure:', error);
  
  // Show user-friendly messages
  this.snackBar.open('Operation failed. Please try again.', 'OK');
  
  // Handle error appropriately
  this.handleError(error);
}
```

### User Feedback
Instead of console messages, use:
- **Angular Material Snackbar** for user notifications
- **Dialog components** for confirmations
- **Loading indicators** for progress feedback
- **Form validation messages** for input errors

### Development Tools
For debugging, use:
- **Browser DevTools** debugger and breakpoints
- **Angular DevTools** extension
- **Network tab** for API debugging
- **Unit tests** for functionality verification

### Code Review
All pull requests will be checked for:
- Absence of unnecessary console statements
- Proper error handling
- User-friendly feedback mechanisms

## Console Detection Feature

The application includes a console detection service that automatically detects when a developer opens the browser console and displays a welcoming message with contribution information.

### How it works:
- Detects console opening through multiple methods (devtools detection, keyboard shortcuts, context menu)
- Shows a styled message in the console with contact information
- Includes technical stack information for interested developers
- Only triggers once per session to avoid spam

### Contact Information:
- **Email**: csimkdmarry@gmail.com
- **Purpose**: Bug reports, contributions, suggestions
- **Project**: CSI Madhya Kerala Diocese Premarital Counselling Centre

---

*This policy ensures clean production code and better user experience.*