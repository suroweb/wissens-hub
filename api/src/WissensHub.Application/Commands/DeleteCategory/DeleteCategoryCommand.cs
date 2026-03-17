namespace WissensHub.Application.Commands.DeleteCategory;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Common.Attributes;

[RequireGroup("WissensHub Owners")]
public record DeleteCategoryCommand(int Id) : IRequest<ApiResponse<bool>>;
