namespace WissensHub.Application.Queries.GetFlaggedArticles;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Common.Attributes;

[RequireGroup("WissensHub Reviewers")]
public record GetFlaggedArticlesQuery() : IRequest<ApiResponse<List<FlaggedArticleDto>>>;
