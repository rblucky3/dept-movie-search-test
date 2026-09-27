namespace MovieSearchCase.WebApi.Models.Movies;

/// <summary>
/// API response shape for a single movie's detail view, including its trailer.
/// </summary>
public record MovieDetail : Movie
{
    public string? Tagline { get; init; }

    /// <summary>Runtime in minutes.</summary>
    public int? Runtime { get; init; }

    public IReadOnlyList<string> Genres { get; init; } = [];

   
    public string? YouTubeTrailerKey { get; init; }
}
