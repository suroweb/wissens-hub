import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

export interface ITelemetryService {
  trackEvent(name: string, properties?: Record<string, string>): void;
  trackException(error: Error, properties?: Record<string, string>): void;
  trackPageView(name: string): void;
}

export class ConsoleTelemetryService implements ITelemetryService {
  public trackEvent(name: string, properties?: Record<string, string>): void {
    console.log('[Telemetry] Event:', name, properties);
  }

  public trackException(error: Error, properties?: Record<string, string>): void {
    console.error('[Telemetry] Exception:', error.message, properties);
  }

  public trackPageView(name: string): void {
    console.log('[Telemetry] PageView:', name);
  }
}

export class AppInsightsTelemetryService implements ITelemetryService {
  private appInsights: ApplicationInsights;

  public constructor(connectionString: string) {
    const reactPlugin = new ReactPlugin();
    this.appInsights = new ApplicationInsights({
      config: {
        connectionString,
        extensions: [reactPlugin],
        disableFetchTracking: true,
        disableAjaxTracking: true,
        disableExceptionTracking: false,
        autoTrackPageVisitTime: false,
        enableAutoRouteTracking: false,
      }
    });
    this.appInsights.loadAppInsights();
  }

  public trackEvent(name: string, properties?: Record<string, string>): void {
    this.appInsights.trackEvent({ name }, properties);
  }

  public trackException(error: Error, properties?: Record<string, string>): void {
    this.appInsights.trackException({ exception: error }, properties);
  }

  public trackPageView(name: string): void {
    this.appInsights.trackPageView({ name });
  }
}

export function createTelemetryService(connectionString: string): ITelemetryService {
  if (!connectionString) {
    return new ConsoleTelemetryService();
  }
  return new AppInsightsTelemetryService(connectionString);
}
