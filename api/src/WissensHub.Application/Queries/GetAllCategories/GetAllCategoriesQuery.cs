namespace WissensHub.Application.Queries.GetAllCategories;

using MediatR;
using WissensHub.Application.Commands.CreateCategory;
using WissensHub.Application.Common;
using WissensHub.Application.Common.Attributes;

[RequireGroup("WissensHub Owners")]
public record GetAllCategoriesQuery() : IRequest<ApiResponse<List<CategoryDto>>>;
