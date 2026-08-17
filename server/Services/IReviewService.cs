using server.Models;
using server.Models.DTOs;

namespace server.Services;

public interface IReviewService
{
    Task<ServiceResult<int>> SubmitReviewAsync(SubmitReviewRequest request, string clientIpHash, CancellationToken cancellationToken = default);
    Task<List<ReviewDto>> GetApprovedReviewsAsync(CancellationToken cancellationToken = default);
    Task<List<ReviewAdminDto>> GetAdminReviewsAsync(ReviewStatus? status, CancellationToken cancellationToken = default);
    Task<ServiceResult> UpdateReviewStatusAsync(int id, ReviewStatus status, CancellationToken cancellationToken = default);
    Task<ServiceResult> DeleteReviewAsync(int id, CancellationToken cancellationToken = default);
}
