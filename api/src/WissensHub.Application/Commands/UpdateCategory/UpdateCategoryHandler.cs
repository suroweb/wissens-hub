namespace WissensHub.Application.Commands.UpdateCategory;

using MediatR;
using WissensHub.Application.Commands.CreateCategory;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class UpdateCategoryHandler(
    ICurrentUser currentUser,
    ICategoryRepository categoryRepo,
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateCategoryCommand, ApiResponse<CategoryDto>>
{
    public async Task<ApiResponse<CategoryDto>> Handle(
        UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await categoryRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Category with Id {request.Id} not found");

        entity.Name = request.Name;
        entity.Description = request.Description;
        entity.IsActive = request.IsActive;

        categoryRepo.UpdateCategory(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<CategoryDto>.Ok(
            new CategoryDto(entity.Id, entity.Name, entity.Description, entity.IsActive));
    }
}
