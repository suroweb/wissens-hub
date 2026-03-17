namespace WissensHub.Application.Commands.CreateCategory;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;
using WissensHub.Domain.Entities;

public class CreateCategoryHandler(
    ICurrentUser currentUser,
    ICategoryRepository categoryRepo,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CreateCategoryCommand, ApiResponse<CategoryDto>>
{
    public async Task<ApiResponse<CategoryDto>> Handle(
        CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = new Category
        {
            Name = request.Name,
            Description = request.Description,
            IsActive = true,
        };

        await categoryRepo.AddCategoryAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<CategoryDto>.Ok(
            new CategoryDto(entity.Id, entity.Name, entity.Description, entity.IsActive));
    }
}
