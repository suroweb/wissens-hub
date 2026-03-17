namespace WissensHub.Application.Commands.UpdateTargetGroup;

using MediatR;
using WissensHub.Application.Commands.CreateTargetGroup;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class UpdateTargetGroupHandler(
    ICurrentUser currentUser,
    ITargetGroupRepository targetGroupRepo,
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateTargetGroupCommand, ApiResponse<TargetGroupDto>>
{
    public async Task<ApiResponse<TargetGroupDto>> Handle(
        UpdateTargetGroupCommand request, CancellationToken cancellationToken)
    {
        var entity = await targetGroupRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"TargetGroup with Id {request.Id} not found");

        entity.Name = request.Name;
        entity.IsActive = request.IsActive;

        targetGroupRepo.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<TargetGroupDto>.Ok(
            new TargetGroupDto(entity.Id, entity.Name, entity.SharePointGroupName, entity.IsActive));
    }
}
