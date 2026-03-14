import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';

const LOG_SOURCE: string = 'UnreadBadgeApplicationCustomizer';

/**
 * Properties for the UnreadBadge Application Customizer.
 * React component for badge UI will be added in Phase 8.
 */
export interface IUnreadBadgeApplicationCustomizerProperties {
  // Reserved for future configuration
}

/** Application Customizer shell for the unread article badge notification. */
export default class UnreadBadgeApplicationCustomizer
  extends BaseApplicationCustomizer<IUnreadBadgeApplicationCustomizerProperties> {

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'UnreadBadge Application Customizer initialized.');
    console.log('UnreadBadge Application Customizer initialized.');
    return Promise.resolve();
  }
}
