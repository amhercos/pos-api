using Application.Dto;
using MediatR;

namespace Application.Features.Staff.Queries;

public record GetStaffQuery() : IRequest<IEnumerable<StaffDto>>;

