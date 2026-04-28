using Application.Dto;
using MediatR;

namespace Application.Features.CustomerCredits.Queries;

public record GetCreditStatsQuery(string Period = "all") : IRequest<CreditStatsDto>;