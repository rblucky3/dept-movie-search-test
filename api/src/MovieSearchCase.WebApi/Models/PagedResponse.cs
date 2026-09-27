namespace MovieSearchCase.WebApi.Models;

/// <summary>
/// Generic paged API response. Wraps results together with the pagination metadata
/// </summary>
public record PagedResponse<T>
{
  
    public required int Page { get; init; }

    public required int TotalPages { get; init; }

    public required int TotalResults { get; init; }
   
    public required IReadOnlyList<T> Results { get; init; }
}
