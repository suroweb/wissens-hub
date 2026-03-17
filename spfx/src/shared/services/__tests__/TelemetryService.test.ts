describe('TelemetryService', () => {
  describe('ConsoleTelemetryService', () => {
    it.todo('trackEvent logs to console');
    it.todo('trackException logs error to console');
    it.todo('trackPageView logs page name to console');
  });

  describe('AppInsightsTelemetryService', () => {
    it.todo('initializes ApplicationInsights with connection string');
    it.todo('sets disableFetchTracking and disableAjaxTracking to true');
    it.todo('trackEvent calls appInsights.trackEvent');
    it.todo('trackException calls appInsights.trackException');
  });

  describe('createTelemetryService', () => {
    it.todo('returns ConsoleTelemetryService when connection string is empty');
    it.todo('returns AppInsightsTelemetryService when connection string is provided');
  });
});
