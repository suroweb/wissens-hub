namespace WissensHub.Application.Commands.DeleteTargetGroup;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class DeleteTargetGroupHandler(
    ICurrentUser currentUser,
    ITargetGroupRepository targetGroupRepo,
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteTargetGroupCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(
        DeleteTargetGroupCommand request, CancellationToken cancellationToken)
    {
        var entity = await targetGroupRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"TargetGroup with Id {request.Id} not found");

        if (entity.ArticleTargetGroups.Count > 0)
        {
            // Soft-delete: target group is associated with articles
            entity.IsActive = false;
            targetGroupRepo.Update(entity);
        }
        else
        {
            targetGroupRepo.Remove(entity);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Ok(true);
    }
}
