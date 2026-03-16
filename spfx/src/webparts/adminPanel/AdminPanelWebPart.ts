import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  type IPropertyPaneGroup,
  PropertyPaneTextField,
  PropertyPaneDropdown
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { AadHttpClient } from '@microsoft/sp-http';

import * as strings from 'AdminPanelWebPartStrings';
import AdminPanel from './components/AdminPanel';
import { IAdminPanelProps } from './components/IAdminPanelProps';
import { WissensHubProvider } from '../../shared/context';
import { getSP } from '../../shared/context/pnpSetup';
import { UserRole } from '../../shared/models/domain/types';

export interface IAdminPanelWebPartProps {
  description: string;
  apiBaseUrl: string;
  mockRole: UserRole;
}

export default class AdminPanelWebPart extends BaseClientSideWebPart<IAdminPanelWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private _apiClient: AadHttpClient | undefined;

  public render(): void {
    const child: React.ReactElement<IAdminPanelProps> = React.createElement(AdminPanel, {
      description: this.properties.description,
      isDarkTheme: this._isDarkTheme,
      environmentMessage: this._environmentMessage,
      hasTeamsContext: !!this.context.sdks.microsoftTeams,
      userDisplayName: this.context.pageContext.user.displayName,
    });

    const element: React.ReactElement = React.createElement(
      WissensHubProvider,
      {
        spContext: this.context,
        aadClient: this._apiClient,
        apiBaseUrl: this.properties.apiBaseUrl || 'https://{function-app-placeholder}.azurewebsites.net',
        mockRole: this.properties.mockRole as UserRole,
        children: child,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    this._environmentMessage = await this._getEnvironmentMessage();

    // Initialize PnPjs singleton
    getSP(this.context);

    // Try AadHttpClient (fails gracefully in workbench)
    try {
      this._apiClient = await this.context.aadHttpClientFactory.getClient('api://{client-id-placeholder}');
    } catch (error) {
      console.warn('AadHttpClient not available (workbench mode):', error);
    }
  }



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const groups: IPropertyPaneGroup[] = [
      {
        groupName: strings.BasicGroupName,
        groupFields: [
          PropertyPaneTextField('description', {
            label: strings.DescriptionFieldLabel
          }),
          PropertyPaneTextField('apiBaseUrl', {
            label: 'API Base URL'
          })
        ]
      }
    ];

    // Show Mock Role dropdown only when in workbench (mock mode)
    if (this._apiClient === undefined) {
      groups.push({
        groupName: 'Development',
        groupFields: [
          PropertyPaneDropdown('mockRole', {
            label: 'Mock Role',
            options: [
              { key: 'reader', text: 'Reader' },
              { key: 'editor', text: 'Editor' },
              { key: 'reviewer', text: 'Reviewer' },
              { key: 'admin', text: 'Admin' }
            ],
            selectedKey: this.properties.mockRole || 'reader'
          })
        ]
      });
    }

    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups
        }
      ]
    };
  }
}
