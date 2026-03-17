namespace WissensHub.Application.Commands.CreateTargetGroup;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;
using WissensHub.Domain.Entities;

public class CreateTargetGroupHandler(
    ICurrentUser currentUser,
    ITargetGroupRepository targetGroupRepo,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CreateTargetGroupCommand, ApiResponse<TargetGroupDto>>
{
    public async Task<ApiResponse<TargetGroupDto>> Handle(
        CreateTargetGroupCommand request, CancellationToken cancellationToken)
    {
        var entity = new TargetGroup
        {
            Name = request.Name,
            SharePointGroupName = request.SharePointGroupName,
            IsActive = true,
        };

        await targetGroupRepo.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<TargetGroupDto>.Ok(
            new TargetGroupDto(entity.Id, entity.Name, entity.SharePointGroupName, entity.IsActive));
    }
}
