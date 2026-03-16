namespace WissensHub.Application.Queries.GetArticleStatus;

using MediatR;
using WissensHub.Application.Common;

public record GetArticleStatusQuery(int PageId) : IRequest<ApiResponse<ArticleStatusDto>>;
