namespace WissensHub.Application.Queries.GetUnreadArticles;

using MediatR;
using WissensHub.Application.Common;

public record GetUnreadArticlesQuery() : IRequest<ApiResponse<List<UnreadArticleDto>>>;
