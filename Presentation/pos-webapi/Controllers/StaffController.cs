using Application.Dto;
using Microsoft.AspNetCore.Authorization;
using MediatR;  
using Microsoft.AspNetCore.Mvc;
using Application.Features.Staff.Queries;

namespace pos_webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly IMediator _mediator;

        public StaffController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize(Roles = "StoreOwner")]
        [HttpGet("my-staff")]
        public async Task<ActionResult<IEnumerable<StaffDto>>> GetMyStaff()
        {
            return Ok(await _mediator.Send(new GetStaffQuery()));
        }
    }
}
