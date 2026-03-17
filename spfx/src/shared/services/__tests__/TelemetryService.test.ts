import { ConsoleTelemetryService, createTelemetryService } from '../TelemetryService';

describe('TelemetryService', () => {
  describe('ConsoleTelemetryService', () => {
    let service: ConsoleTelemetryService;
    let logSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
      service = new ConsoleTelemetryService();
      logSpy = jest.spyOn(console, 'log').mockImplementation();
      errorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      logSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it('trackEvent logs to console', () => {
      service.trackEvent('test_event', { key: 'value' });
      expect(logSpy).toHaveBeenCalledWith('[Telemetry] Event:', 'test_event', { key: 'value' });
    });

    it('trackException logs error to console', () => {
      const error = new Error('test error');
      service.trackException(error, { context: 'unit-test' });
      expect(errorSpy).toHaveBeenCalledWith('[Telemetry] Exception:', 'test error', { context: 'unit-test' });
    });

    it('trackPageView logs page name to console', () => {
      service.trackPageView('Dashboard');
      expect(logSpy).toHaveBeenCalledWith('[Telemetry] PageView:', 'Dashboard');
    });

    it('trackEvent works without properties', () => {
      service.trackEvent('no_props');
      expect(logSpy).toHaveBeenCalledWith('[Telemetry] Event:', 'no_props', undefined);
    });
  });

  describe('createTelemetryService', () => {
    it('returns ConsoleTelemetryService when connection string is empty', () => {
      const service = createTelemetryService('');
      expect(service).toBeInstanceOf(ConsoleTelemetryService);
    });
  });
});
