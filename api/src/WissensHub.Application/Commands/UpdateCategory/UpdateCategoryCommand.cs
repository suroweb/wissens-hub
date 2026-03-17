namespace WissensHub.Application.Commands.UpdateCategory;

using MediatR;
using WissensHub.Application.Commands.CreateCategory;
using WissensHub.Application.Common;
using WissensHub.Application.Common.Attributes;

[RequireGroup("WissensHub Owners")]
public record UpdateCategoryCommand(int Id, string Name, string? Description, bool IsActive)
    : IRequest<ApiResponse<CategoryDto>>;
