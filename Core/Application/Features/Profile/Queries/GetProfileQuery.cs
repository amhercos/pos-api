using Application.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Profile.Queries
{
    public record GetProfileQuery(Guid UserId) : IRequest<UserProfileResponseDto?>;
}
