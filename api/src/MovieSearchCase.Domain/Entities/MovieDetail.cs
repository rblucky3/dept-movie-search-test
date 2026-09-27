namespace MovieSearchCase.Domain.Entities;

public class MovieDetail : Movie
{
    public string? Tagline { get; init; }

    public int? Runtime { get; init; }

    public IReadOnlyList<string> Genres { get; init; } = [];

    /// <summary>
    /// YouTube video key of the movie's trailer, if TMDB has one.
    /// </summary>
    public string? YouTubeTrailerKey { get; init; }
}
