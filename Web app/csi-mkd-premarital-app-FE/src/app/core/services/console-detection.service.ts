import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsoleDetectionService {
  private isConsoleOpen = false;
  private messageShown = false;

  initializeConsoleDetection(): void {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    this.detectConsoleOpening();
    this.showWelcomeMessage();
  }

  private detectConsoleOpening(): void {
    // Method 1: Check for devtools using timing
    let devtools = { open: false };
    const threshold = 160;

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          this.onConsoleOpen();
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // Method 2: Override console methods
    this.overrideConsoleMethods();

    // Method 3: Check for console object properties
    this.checkConsoleProperties();
  }

  private overrideConsoleMethods(): void {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    // Override console methods to detect usage
    console.log = (...args: any[]) => {
      this.onConsoleOpen();
      return originalLog.apply(console, args);
    };

    console.error = (...args: any[]) => {
      this.onConsoleOpen();
      return originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      this.onConsoleOpen();
      return originalWarn.apply(console, args);
    };

    console.info = (...args: any[]) => {
      this.onConsoleOpen();
      return originalInfo.apply(console, args);
    };
  }

  private checkConsoleProperties(): void {
    // Check if console is being accessed
    let consoleCheck = () => {
      if (!this.messageShown) {
        this.onConsoleOpen();
      }
    };

    // Trigger on F12 key press
    document.addEventListener('keydown', (event) => {
      if (event.key === 'F12' || 
          (event.ctrlKey && event.shiftKey && event.key === 'I') ||
          (event.ctrlKey && event.shiftKey && event.key === 'C') ||
          (event.ctrlKey && event.shiftKey && event.key === 'J')) {
        setTimeout(consoleCheck, 100);
      }
    });

    // Trigger on right-click inspect
    document.addEventListener('contextmenu', () => {
      setTimeout(consoleCheck, 100);
    });
  }

  private onConsoleOpen(): void {
    if (!this.messageShown && !this.isConsoleOpen) {
      this.isConsoleOpen = true;
      this.showDeveloperMessage();
    }
  }

  private showWelcomeMessage(): void {
    // Show a simple welcome message immediately
    setTimeout(() => {
      if (!this.messageShown) {
        this.showDeveloperMessage();
      }
    }, 2000);
  }

  private showDeveloperMessage(): void {
    if (this.messageShown) return;
    
    this.messageShown = true;

    // CSS for styling
    const styles = `
      color: #1976d2;
      font-size: 20px;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      padding: 10px;
      border: 2px solid #1976d2;
      border-radius: 8px;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    `;

    const messageStyle = `
      color: #333;
      font-size: 14px;
      font-weight: normal;
      margin-top: 10px;
      line-height: 1.6;
    `;

    const emailStyle = `
      color: #1976d2;
      font-weight: bold;
      text-decoration: underline;
    `;

    // eslint-disable-next-line no-console
    console.log('%c🚀 Hello Developer!', styles);
    
    // eslint-disable-next-line no-console
    console.log(
      '%cLooks like you\'re exploring our code! 👨‍💻👩‍💻\n\n' +
      '🤝 We welcome contributions from fellow developers!\n' +
      '🐛 Found an issue? We\'d love to hear about it!\n' +
      '💡 Have suggestions? We\'re all ears!\n\n' +
      '📧 Email us at: %ccsimkdmarry@gmail.com\n\n' +
      '🌟 CSI Madhya Kerala Diocese Premarital Counselling Centre\n' +
      '💻 Built with Angular 20 & .NET 9\n\n' +
      'Happy coding! ⚡️',
      messageStyle,
      emailStyle
    );

    // eslint-disable-next-line no-console
    console.log(
      '%cTech Stack Info:\n' +
      '• Frontend: Angular 20 with Standalone Components\n' +
      '• Backend: .NET 9 ASP.NET Core Minimal APIs\n' +
      '• Database: PostgreSQL + Azure Cosmos DB\n' +
      '• Hosting: Azure Static Web Apps + Container Apps\n' +
      '• UI: Angular Material + TailwindCSS',
      'color: #666; font-size: 12px; font-family: monospace;'
    );
  }
}