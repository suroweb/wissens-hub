namespace WissensHub.Application.Commands.DeleteCategory;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class DeleteCategoryHandler(
    ICurrentUser currentUser,
    ICategoryRepository categoryRepo,
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteCategoryCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(
        DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await categoryRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Category with Id {request.Id} not found");

        if (entity.Articles.Count > 0)
        {
            // Soft-delete: category has articles, cannot hard-delete
            entity.IsActive = false;
            categoryRepo.UpdateCategory(entity);
        }
        else
        {
            categoryRepo.RemoveCategory(entity);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Ok(true);
    }
}
