namespace WissensHub.Application.Queries.GetAdminReports;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Common.Attributes;

[RequireGroup("WissensHub Owners")]
public record GetAdminReportsQuery() : IRequest<ApiResponse<AdminReportDto>>;
