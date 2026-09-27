using System.Globalization;
using MovieSearchCase.Domain.Entities;

namespace MovieSearchCase.Infrastructure.Clients;

internal static class TmdbMovieMapper
{
      /// <summary>
    /// TMDB rejects any page above 500, regardless of what total_pages reports.
    /// </summary>
    public const int MaxPage = 500;
    
    public static Movie ToDomainModel(this TmdbMovie tmdbMovie) => new()
    {
        Id = tmdbMovie.Id,
        Title = tmdbMovie.Title,
        Overview = tmdbMovie.Overview,
        PosterPath = tmdbMovie.PosterPath,
        BackdropPath = tmdbMovie.BackdropPath,
        VoteAverage = tmdbMovie.VoteAverage,
        ReleaseDate = DateOnly.TryParseExact(
            tmdbMovie.ReleaseDate,
            "yyyy-MM-dd",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var releaseDate)
            ? releaseDate
            : null,
    };

    public static PagedResults<Movie> ToDomainModel(this TmdbPagedResponse<TmdbMovie> response) => new()
    {
        Results = response.Results.Select(ToDomainModel).ToList(),
        Page = response.Page,
        TotalPages = Math.Min(response.TotalPages, MaxPage),
        TotalResults = response.TotalResults,
    };

      public static MovieDetail ToDomainModel(this TmdbMovieDetails tmdbMovie) => new()
    {
        Id = tmdbMovie.Id,
        Title = tmdbMovie.Title,
        Overview = tmdbMovie.Overview,
        PosterPath = tmdbMovie.PosterPath,
        BackdropPath = tmdbMovie.BackdropPath,
        VoteAverage = tmdbMovie.VoteAverage,
        ReleaseDate = ParseReleaseDate(tmdbMovie.ReleaseDate),
        Tagline = string.IsNullOrWhiteSpace(tmdbMovie.Tagline) ? null : tmdbMovie.Tagline,
        Runtime = tmdbMovie.Runtime is > 0 ? tmdbMovie.Runtime : null,
        Genres = tmdbMovie.Genres.Select(genre => genre.Name).ToList(),
        YouTubeTrailerKey = PickTrailer(tmdbMovie.Videos?.Results ?? [])?.Key,
    };

    /// <summary>
    /// Prefers an official YouTube trailer, then any YouTube trailer, then a YouTube teaser.
    /// </summary>
    internal static TmdbVideo? PickTrailer(IReadOnlyList<TmdbVideo> videos) =>
        videos
            .Where(video => video.Site.Equals("YouTube", StringComparison.OrdinalIgnoreCase))
            .Where(video => video.Type is "Trailer" or "Teaser")
            .OrderBy(video => video.Type == "Trailer" ? 0 : 1)
            .ThenBy(video => video.Official ? 0 : 1)
            .FirstOrDefault();

    private static DateOnly? ParseReleaseDate(string? releaseDate) =>
        DateOnly.TryParseExact(
            releaseDate,
            "yyyy-MM-dd",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var parsed)
            ? parsed
            : null;

}
