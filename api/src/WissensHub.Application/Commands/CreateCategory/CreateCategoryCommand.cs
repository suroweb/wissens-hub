namespace WissensHub.Application.Commands.CreateCategory;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Common.Attributes;

[RequireGroup("WissensHub Owners")]
public record CreateCategoryCommand(string Name, string? Description)
    : IRequest<ApiResponse<CategoryDto>>;

public record CategoryDto(int Id, string Name, string? Description, bool IsActive);
