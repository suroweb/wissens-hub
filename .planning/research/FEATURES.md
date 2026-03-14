# Feature Landscape

**Domain:** SharePoint-based Enterprise Knowledge Management
**Researched:** 2026-03-14
**Confidence:** MEDIUM (based on training data -- web search tools were unavailable for verification against latest market data)

## Domain Context

Enterprise knowledge management (KM) on SharePoint is a mature domain with well-established patterns. Solutions range from out-of-the-box SharePoint features (site pages, search, metadata) to full custom SPFx solutions with external data stores. The competitive landscape includes Microsoft Viva (successor to SharePoint knowledge features), third-party tools (Guru, Confluence, Notion), and custom-built intranet solutions. WissensHub sits in the "custom SPFx solution" category -- purpose-built for a specific workflow (article authoring, approval, read confirmation, compliance tracking).

The German enterprise market in particular values **Lesebestaetigung** (read confirmations) and **Freigabe-Workflows** (approval workflows) due to regulatory compliance requirements (ISO 9001, quality management systems). This is a genuine business need, not a portfolio-project invention.

## Table Stakes

Features users expect from any SharePoint knowledge management solution. Missing any of these makes the product feel incomplete or unprofessional.

| Feature | Why Expected | Complexity | Spec Coverage | Notes |
|---------|-------------|------------|---------------|-------|
| **Article browsing/discovery** | Core purpose -- users need to find knowledge | Medium | YES -- Dashboard with card/list view, filters, search | Well-specified |
| **Search** | Users won't browse -- they search | Medium | YES -- Debounced search across titles and content | Title + content search is standard; full-text search across page body requires SharePoint search API integration |
| **Category/tag filtering** | Knowledge bases without taxonomy are unusable | Low | YES -- Admin-configurable categories, filter by category | Admin-configurable is a strength over hardcoded |
| **Role-based access** | Different users have different needs and permissions | Medium | YES -- 4 roles (Reader, Editor, Reviewer, Admin) mapped to SP Groups | Comprehensive role model |
| **Content authoring** | Users need to create/edit knowledge | Low (leverages SP) | YES -- SharePoint Modern Pages = full rich editor | Smart decision to use native SP pages vs custom editor |
| **Article metadata** | Category, author, date, status -- users need context | Low | YES -- Article Sidebar displays all metadata | Well-specified with sidebar web part |
| **Approval workflow** | Knowledge must be reviewed before publishing | High | YES -- Draft -> InReview -> Published -> Archived | Standard 4-state workflow, approve/reject with comments |
| **Responsive design** | Users on different devices/screen sizes | Medium | YES -- Full-width, 2/3, 1/3 column zones | SPFx-standard responsive zones |
| **Loading states** | Users need feedback during data fetches | Low | YES -- Fluent UI Shimmer skeletons | Better than spinners; professional UX |
| **Error handling** | Graceful failures, not blank screens | Medium | YES -- Result pattern, Error Boundaries, toast notifications | Three-layer strategy is thorough |
| **Localization (i18n)** | German enterprise market requires native language | Medium | YES -- German default, English secondary | Essential for target market |

**Spec coverage assessment:** All table stakes are covered. No gaps identified.

## Differentiators

Features that set WissensHub apart from generic SharePoint KM setups. Not every KM solution has these, but they add significant value.

| Feature | Value Proposition | Complexity | Spec Coverage | Notes |
|---------|-------------------|------------|---------------|-------|
| **Read confirmations** | Compliance tracking -- "who read what, when" | High | YES -- Full tracking with Azure SQL, mark-as-read UI, admin reports | This is the killer feature. Most SharePoint KM solutions do NOT have this. Requires external DB (correctly specced with Azure SQL). |
| **Mandatory article tracking** | IsMandatory flag + unread badge = compliance enforcement | Medium | YES -- IsMandatory column, unread badges, dashboard stats | Distinct from optional reading. Critical for quality management (ISO 9001). |
| **Unread badge header (Application Customizer)** | Persistent notification across entire hub site | Medium | YES -- SPFx Application Customizer in header placeholder | Rare in KM solutions. Shows unread count on every page in the hub. Drives compliance without nagging. |
| **Flagging outdated content** | Users can signal content is stale | Medium | YES -- Flag as outdated with reason, reviewers see flags, resolve workflow | Content freshness is a known KM problem. User-driven flagging is better than time-based-only staleness checks. |
| **Favorites** | Personal bookmarking for quick access | Low | YES -- Star/unstar toggle, stored in Azure SQL, favorites view | Nice-to-have but expected by users familiar with modern apps |
| **Content freshness alerts** | Articles not reviewed in X days get flagged | Medium | YES -- Freigabecenter shows freshness alerts | Proactive content quality management |
| **Approval center (Freigabecenter)** | Dedicated reviewer workspace | Medium | YES -- Dedicated web part for pending approvals, flagged content, freshness | Separating the reviewer workflow into its own web part is smart UX |
| **Admin panel with configuration** | Categories and target groups configurable without code | Medium | YES -- Admin Panel web part for categories, target groups, reminders | Admin self-service reduces developer dependency |
| **Exportable reports** | Compliance evidence for audits | Medium | YES -- CSV/Excel export of read confirmation data | Critical for regulated industries. Auditors need evidence. |
| **Target group distribution** | Articles assigned to specific audiences | Medium | YES -- Target groups mapped to SP groups, admin-configurable | Enables "this IT policy applies to Engineering department only" |
| **Optimistic UI updates** | Instant feedback for mark-as-read and favorites | Low | YES -- Optimistic updates with background sync | Professional UX detail |
| **Multi-layer caching** | Performance across slow SharePoint + Azure APIs | High | YES -- PnPjs session cache, in-memory TTL cache, stale-while-revalidate | Three-layer strategy with invalidation. Impressive for portfolio. |
| **Two-layer data architecture** | SP for content, Azure SQL for tracking | High | YES -- SharePoint Site Pages + Azure SQL via Azure Functions | Correct architectural decision. Avoids 5000-item threshold. |
| **Clean Architecture (frontend + backend)** | Demonstrates senior engineering | High | YES -- Interfaces, services, hooks, CQRS on both sides | Portfolio differentiator. Real-world pattern. |
| **Application Insights telemetry** | Production observability | Medium | YES -- Single instance, cost-safe config, custom events only | The cost-awareness (disabling auto-dependency tracking) demonstrates real-world experience. |
| **Infrastructure as Code (Bicep)** | Reproducible deployments | Medium | YES -- Full Bicep modules for all Azure resources | Portfolio differentiator for DevOps skills |
| **CI/CD pipelines** | Professional development workflow | Medium | YES -- GitHub Actions for CI (PR) and CD (merge to main) | Table stakes for portfolio projects claiming "production-grade" |
| **PnP PowerShell provisioning** | One-command site setup | Medium | YES -- Script creates site, groups, columns, pages, navigation, sample data | Reduces setup friction, demonstrates SharePoint admin skills |
| **Docker Compose local dev** | Developer experience | Low | YES -- Azure SQL Edge container | Professional local development story |

**Spec coverage assessment:** The spec is comprehensive on differentiators. The read confirmation + mandatory tracking + target groups combination is the core value proposition and is well-specified.

## Anti-Features

Features to explicitly NOT build. The spec's "Out of Scope" section already covers most of these, but here is the full reasoning.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Custom rich text editor** | SharePoint Modern Pages already provide a world-class editor (web parts, sections, images, embeds). Building a custom editor is months of work for a worse result. | Use native SharePoint Site Pages. Editors create pages normally. SPFx web parts provide the management layer. (Spec does this correctly.) |
| **Real-time chat/comments** | Not relevant to knowledge management. Adds complexity without KM value. SharePoint already has page comments if needed. | Rely on SharePoint native page comments if discussion is needed. (Spec excludes this.) |
| **Video hosting** | Storage and bandwidth costs, transcoding complexity. Not needed for a text-focused KM solution. | Link to Stream/YouTube if video content is needed. (Spec excludes this.) |
| **Mobile app** | SharePoint responsive design + SPFx responsive web parts are sufficient. Native app development is a massive scope increase. | Ensure responsive design works on mobile browsers. (Spec excludes this.) |
| **AI-powered search/recommendations** | Massive scope increase. Azure AI Search or Copilot integration would overshadow the core KM features. Cool but not the point. | Use SharePoint search API for full-text search. Keep it simple. |
| **Notification emails/push** | Email notification systems are complex (batching, preferences, unsubscribe). SharePoint already has follow/alert features. | The Unread Badge Application Customizer provides in-app notification. Users see unread count when visiting the hub. For email, rely on SharePoint native alerts. |
| **Versioning/diff viewer** | SharePoint Site Pages already have version history built in. Building a custom diff viewer duplicates native functionality. | Link to SharePoint version history from the Article Sidebar. (Spec includes version history link.) |
| **Workflow engine/designer** | Custom workflow engines are enormous scope. The 4-state approval flow is sufficient. | Hardcode the Draft -> InReview -> Published -> Archived workflow. If more complex workflows are needed later, use Power Automate. |
| **SSO/identity management** | SharePoint and Azure AD/Entra ID handle this. Building custom auth is dangerous and unnecessary. | Use Entra ID tokens for API auth, SharePoint groups for roles. (Spec does this correctly.) |
| **Multi-tenant support** | Portfolio project targets a single tenant. Multi-tenant architecture adds massive complexity. | Single-tenant deployment. Each organization deploys their own instance. |
| **Offline mode / PWA** | SharePoint is inherently online. Offline mode for SPFx web parts is extremely complex and rarely needed for KM. | Accept online-only. Knowledge articles need to be current anyway. |

## Feature Dependencies

```
Admin Panel (configure categories) --> Dashboard (filter by category)
Admin Panel (configure target groups) --> Article metadata (assign target groups)
Article metadata (target groups) --> Dashboard (filter by target group)
Read Confirmations (mark as read) --> Dashboard (unread badges)
Read Confirmations (mark as read) --> Unread Badge Header (count)
Read Confirmations (mark as read) --> Admin Panel (exportable reports)
Approval Workflow (status changes) --> Dashboard (show only Published)
Approval Workflow (status changes) --> Freigabecenter (pending list)
Flagging (flag outdated) --> Freigabecenter (flagged articles list)
Azure Functions API --> Read Confirmations, Favorites, Flags, Approvals (all tracking)
Azure SQL database --> Azure Functions API (data store)
SharePoint Site Pages --> Dashboard (article source), Article Sidebar (page context)
SharePoint Groups --> Role-based access (all web parts)
WissensHubContext (shared context) --> All web parts (user, role, services)
Service Container (DI) --> All hooks (service access)
```

**Critical path:** Azure SQL + Azure Functions API must exist before any tracking feature works. SharePoint site + groups must exist before any SPFx component works. Therefore:

1. Infrastructure first (SP site, groups, columns, Azure SQL, Azure Functions skeleton)
2. Shared foundation (context, services, interfaces, models)
3. Read-path features (Dashboard browsing, Article Sidebar display)
4. Write-path features (mark as read, flag, favorite, approve/reject)
5. Admin features (configuration, reports)
6. Polish (caching, optimistic updates, telemetry, testing, CI/CD)

## Observations for User Review

These are observations about potential gaps or enhancements -- **NOT recommendations to change the spec**. The spec is the source of truth.

### Suggestion 1: Search scope clarification
The spec says "Search across page titles and content." Searching page *content* (body text) on SharePoint requires either the SharePoint Search API (`_api/search/query`) or the Microsoft Graph Search API, which is different from querying the Site Pages list items via PnPjs. List item queries only search metadata columns, not the full page body. The spec may already intend SharePoint Search API usage, but this could be clarified.

**Status:** Suggestion for user review. Does not change the spec.

### Suggestion 2: Read confirmation for article *updates*
The current spec tracks whether a user has read an article. But if an article is significantly updated after a user confirmed it, should their confirmation be reset (requiring re-reading)? This is common in compliance-heavy environments. The `ArticleMetadata.UpdatedAt` and `ReadConfirmations.ReadDate` timestamps could support this comparison, but the logic is not explicitly specced.

**Status:** Suggestion for user review. Does not change the spec.

### Suggestion 3: Reminder interval functionality
The Admin Panel mentions configuring "reminder intervals" but the spec does not detail how reminders are delivered. The Unread Badge Header shows counts, but are there time-based escalation reminders? This may be intentionally left vague, or it may refer to the freshness alerts in the Freigabecenter.

**Status:** Suggestion for user review. Does not change the spec.

## MVP Recommendation

Based on the dependency analysis and the fact that this is a portfolio project (needs to demonstrate breadth), the MVP should include:

**Prioritize (Phase 1-2):**
1. Infrastructure (SP site, Azure SQL, Azure Functions skeleton) -- everything depends on this
2. Dashboard with article browsing, filtering, search -- the "front door" to the solution
3. Article Sidebar with metadata display and mark-as-read -- the core KM interaction
4. Read confirmations tracking -- the differentiating feature
5. Approval workflow (basic Draft -> Published) -- content governance

**Phase 3:**
6. Unread Badge Application Customizer -- visible portfolio differentiator
7. Freigabecenter with pending approvals and flagged articles
8. Favorites toggle
9. Flagging outdated content

**Phase 4:**
10. Admin Panel with configuration and reports
11. Target group distribution
12. Exportable read confirmation reports

**Phase 5:**
13. Multi-layer caching (PnPjs, in-memory, stale-while-revalidate)
14. Optimistic UI updates
15. Application Insights telemetry
16. Full test coverage (Jest, .NET integration, Playwright E2E)

**Phase 6:**
17. CI/CD pipelines (GitHub Actions)
18. Bicep infrastructure as code
19. PnP PowerShell provisioning script
20. README with architecture diagram

**Defer (never for this project):** All anti-features listed above.

## Competitive Landscape Context

| Solution | Strengths | What WissensHub Does Better |
|----------|-----------|---------------------------|
| **Native SharePoint (no custom dev)** | Zero development cost, metadata columns, search, version history | Read confirmations, mandatory article tracking, approval workflow UI, compliance reports, target group distribution |
| **Microsoft Viva Topics (retired 2025)** | AI-powered topic discovery, knowledge cards | Viva Topics was retired. WissensHub provides explicit, structured KM vs AI-inferred topics. |
| **Confluence** | Rich editor, spaces, page trees, search | WissensHub stays within the Microsoft 365 ecosystem. Read confirmations and mandatory tracking are not native Confluence features. |
| **Guru** | Chrome extension, Slack integration, verification workflow | WissensHub integrates natively with SharePoint where the org already works. No additional SaaS cost. |
| **Custom SPFx KM solutions (competitors)** | Varies widely | The combination of read confirmations + mandatory tracking + target groups + approval workflow + admin reports in a single SPFx solution is rare. Most custom solutions do 1-2 of these. |

## Sources

- Training data knowledge of SharePoint Framework, enterprise KM patterns, Microsoft 365 ecosystem (MEDIUM confidence -- no web verification available)
- WissensHub spec (wissens-hub-spec.md) -- authoritative source for all feature decisions
- PROJECT.md -- project context and constraints
- Domain knowledge of ISO 9001 quality management requirements for read confirmations in German enterprise environments (MEDIUM confidence)

**Note:** Web search and web fetch tools were unavailable during this research session. All domain knowledge comes from training data. Confidence is MEDIUM overall. Feature categorizations (table stakes vs differentiator) are based on extensive training data covering the SharePoint and enterprise KM domain, but could not be verified against 2026 market data.
