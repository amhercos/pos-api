using Application.Dto;
using MediatR;

namespace Application.Features.Auth.Commands;

public record LoginUserCommand(
    string Username, 
    string Password) : IRequest<AuthResponseDTO>;