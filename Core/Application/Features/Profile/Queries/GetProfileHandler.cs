using Application.Dto;
using Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Profile.Queries
{
    public class GetProfileHandler(IUserRepository userRepository) : IRequestHandler<GetProfileQuery, UserProfileResponseDto?>
    {
        public async Task<UserProfileResponseDto?> Handle(GetProfileQuery request, CancellationToken ct)
        {
            var user = await userRepository.GetByIdAsync(request.UserId);
            if (user == null) return null;
            return new UserProfileResponseDto(user.FullName, user.UserName);
        }
    }
}
