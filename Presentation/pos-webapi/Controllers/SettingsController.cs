using Application.Dto;
using Application.Features.Auth.Commands;
using Application.Features.Profile.Command;
using Application.Features.Profile.Queries;
using Application.Features.Store.Command;
using Application.Features.Store.Queries;
using Application.Interfaces.Repositories;
using Infrastructure.Repositories;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace pos_webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SettingsController(
        IMediator mediator) : ControllerBase
    {

        [HttpPut("store")]
        [Authorize(Roles = "StoreOwner")]
        public async Task<IActionResult> UpdateStore([FromBody] UpdateStoreSettingsDto dto)
        {
            var storeIdClaim = User.FindFirst("StoreId")?.Value;
            if (!Guid.TryParse(storeIdClaim, out var storeId)) return Unauthorized();

            var result = await mediator.Send(new UpdateStoreCommand(storeId, dto));
            return result ? Ok(new { message = "Store updated" }) : BadRequest();
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

            var result = await mediator.Send(new UpdateProfileCommand(userId, dto.FullName, dto.UserName));
            return result ? Ok(new { message = "Profile updated" }) : BadRequest("Could not update profile");
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

            var result = await mediator.Send(new ChangePasswordCommand(userId, dto.CurrentPassword, dto.NewPassword));

            if (result.Succeeded) return Ok(new { message = "Password changed" });
            return BadRequest(result.Errors);
        }


        [HttpGet("store")]
        public async Task<IActionResult> GetStoreSettings()
        {
            var storeIdClaim = User.FindFirst("StoreId")?.Value;
            if (!Guid.TryParse(storeIdClaim, out var storeId)) return Unauthorized();

            var result = await mediator.Send(new GetStoreSettingsQuery(storeId));
            return result != null ? Ok(result) : NotFound();
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

            var result = await mediator.Send(new GetProfileQuery(userId));
            return result != null ? Ok(result) : NotFound();
        }

    }
}