import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { UnreadBadgeHeader } from './components/UnreadBadgeHeader';
import { IUnreadArticle } from './models/IUnreadArticle';
import { MOCK_ARTICLES, MOCK_READ_CONFIRMATIONS } from '../../shared/services/__mocks__/mockData';

const LOG_SOURCE: string = 'UnreadBadgeApplicationCustomizer';

/**
 * Properties for the UnreadBadge Application Customizer.
 */
export interface IUnreadBadgeApplicationCustomizerProperties {
  // Reserved for future configuration
}

interface UnreadArticleDto {
  pageId: number;
  title: string;
  category: string;
  isMandatory: boolean;
  updatedAt: string;
}

/** Application Customizer that renders a notification bell with unread article count in the header. */
export default class UnreadBadgeApplicationCustomizer
  extends BaseApplicationCustomizer<IUnreadBadgeApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;
  private _articles: IUnreadArticle[] = [];
  private _isLoading: boolean = true;
  private _error: string | undefined;

  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'UnreadBadge Application Customizer initializing.');

    this._isLoading = true;
    this._articles = [];
    this._error = undefined;

    const siteUrl: string = this.context.pageContext.web.absoluteUrl;

    try {
      const aadClient: AadHttpClient = await this.context.aadHttpClientFactory.getClient(
        'api://{client-id-placeholder}'
      );
      const response: HttpClientResponse = await aadClient.get(
        siteUrl + '/api/articles/unread',
        AadHttpClient.configurations.v1
      );
      const data: UnreadArticleDto[] = await response.json();
      this._articles = data.map((dto: UnreadArticleDto) => ({
        pageId: dto.pageId,
        title: dto.title,
        category: dto.category,
        isMandatory: dto.isMandatory,
        updatedAt: new Date(dto.updatedAt),
        url: siteUrl + '/SitePages/' + dto.title.replace(/\s+/g, '-') + '.aspx',
      }));
    } catch (error) {
      Log.warn(LOG_SOURCE, 'AadHttpClient not available, using mock data: ' + String(error));

      // Fall back to mock data for workbench / local development
      const readPageIds: number[] = MOCK_READ_CONFIRMATIONS.map(r => r.pageId);
      this._articles = MOCK_ARTICLES
        .filter(a => a.status === 'Published' && readPageIds.indexOf(a.id) < 0)
        .map(a => ({
          pageId: a.id,
          title: a.title,
          category: a.category,
          isMandatory: a.isMandatory,
          updatedAt: a.modifiedDate,
          url: a.url,
        }));
    }

    this._isLoading = false;

    // Subscribe to placeholder availability changes
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceholder);

    // Try rendering immediately (placeholders may already be available)
    this._renderPlaceholder();

    return Promise.resolve();
  }

  private _renderPlaceholder(): void {
    if (this._topPlaceholder) {
      return;
    }

    this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
      PlaceholderName.Top,
      { onDispose: this._onDispose.bind(this) }
    );

    if (!this._topPlaceholder) {
      Log.warn(LOG_SOURCE, 'Top placeholder not available');
      return;
    }

    const element: React.ReactElement = React.createElement(UnreadBadgeHeader, {
      articles: this._articles,
      isLoading: this._isLoading,
      error: this._error,
      siteUrl: this.context.pageContext.web.absoluteUrl,
    });

    ReactDOM.render(element, this._topPlaceholder.domElement);
  }

  private _onDispose(): void {
    if (this._topPlaceholder && this._topPlaceholder.domElement) {
      ReactDOM.unmountComponentAtNode(this._topPlaceholder.domElement);
    }
  }
}
