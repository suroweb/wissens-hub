namespace WissensHub.Application.Queries.GetAllCategories;

using MediatR;
using WissensHub.Application.Commands.CreateCategory;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class GetAllCategoriesHandler(
    ICurrentUser currentUser,
    ICategoryRepository categoryRepo)
    : IRequestHandler<GetAllCategoriesQuery, ApiResponse<List<CategoryDto>>>
{
    public async Task<ApiResponse<List<CategoryDto>>> Handle(
        GetAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await categoryRepo.GetAllAsync(cancellationToken);

        var dtos = categories
            .Select(c => new CategoryDto(c.Id, c.Name, c.Description, c.IsActive))
            .ToList();

        return ApiResponse<List<CategoryDto>>.Ok(dtos);
    }
}
