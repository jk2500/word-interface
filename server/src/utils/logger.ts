/**
 * Logger utility for the application
 */

interface LogData {
  message: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
  [key: string]: any;
}

class Logger {
  // Default log level based on environment
  private logLevel: 'debug' | 'info' | 'warn' | 'error';
  
  constructor() {
    // Set log level based on environment
    this.logLevel = (process.env.LOG_LEVEL as any) || 
      (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
  }
  
  /**
   * Formats a log entry
   */
  private formatLog(data: LogData): string {
    const timestamp = new Date().toISOString();
    const level = data.level || 'info';
    const { message, ...rest } = data;
    
    // Format as JSON for machine parsing
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...rest
    });
  }
  
  /**
   * Log at info level
   */
  info(data: string | LogData): void {
    if (['debug', 'info', 'warn', 'error'].includes(this.logLevel)) {
      const logData = typeof data === 'string' ? { message: data } : data;
      console.log(this.formatLog({ ...logData, level: 'info' }));
    }
  }
  
  /**
   * Log at debug level
   */
  debug(data: string | LogData): void {
    if (['debug'].includes(this.logLevel)) {
      const logData = typeof data === 'string' ? { message: data } : data;
      console.log(this.formatLog({ ...logData, level: 'debug' }));
    }
  }
  
  /**
   * Log at warn level
   */
  warn(data: string | LogData): void {
    if (['debug', 'info', 'warn', 'error'].includes(this.logLevel)) {
      const logData = typeof data === 'string' ? { message: data } : data;
      console.warn(this.formatLog({ ...logData, level: 'warn' }));
    }
  }
  
  /**
   * Log at error level
   */
  error(data: string | LogData): void {
    if (['debug', 'info', 'warn', 'error'].includes(this.logLevel)) {
      const logData = typeof data === 'string' ? { message: data } : data;
      console.error(this.formatLog({ ...logData, level: 'error' }));
    }
  }
}

// Export singleton instance
export default new Logger();