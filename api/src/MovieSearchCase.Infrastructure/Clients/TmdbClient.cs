using System.Net;
using System.Net.Http.Json;
using MovieSearchCase.Domain.Entities;
using MovieSearchCase.Domain.Exceptions;
using MovieSearchCase.Domain.Interfaces.Clients;

namespace MovieSearchCase.Infrastructure.Clients;

public class TmdbClient : ITmdbClient
{
    private readonly HttpClient _httpClient;

    public TmdbClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<IReadOnlyList<Movie>> GetTrendingMoviesAsync(CancellationToken cancellationToken)
    {
        TmdbPagedResponse<TmdbMovie>? response;

        try
        {
            response = await _httpClient.GetFromJsonAsync<TmdbPagedResponse<TmdbMovie>>(
                "trending/movie/week",
                cancellationToken);
        }
        catch (HttpRequestException)
        {
            throw new MovieException(
                MovieException.ExceptionTitle,
                ErrorType.UpstreamServiceUnavailable,
                "TMDB did not return trending movies.");
        }

        if (response is null)
        {
            throw new MovieException(
                MovieException.ExceptionTitle,
                ErrorType.UpstreamServiceUnavailable,
                "TMDB returned an empty trending movies response.");
        }

        return response.Results.Select(TmdbMovieMapper.ToDomainModel).ToList();
    }


     public async Task<PagedResults<Movie>> SearchMoviesAsync(string query, int page, CancellationToken cancellationToken)
    {
        TmdbPagedResponse<TmdbMovie>? response;

        try
        {
            response = await _httpClient.GetFromJsonAsync<TmdbPagedResponse<TmdbMovie>>(
                $"search/movie?query={Uri.EscapeDataString(query)}&page={page}&include_adult=false",
                cancellationToken);
        }
        catch (HttpRequestException)
        {
            throw new MovieException(
                MovieException.ExceptionTitle,
                ErrorType.UpstreamServiceUnavailable,
                "TMDB did not return search results.");
        }

        if (response is null)
        {
            throw new MovieException(
                MovieException.ExceptionTitle,
                ErrorType.UpstreamServiceUnavailable,
                "TMDB returned an empty search response.");
        }

        return response.ToDomainModel();
    }

public async Task<MovieDetails> GetMovieDetailsAsync(int id, CancellationToken cancellationToken)
    {
        TmdbMovieDetails? response;

        try
        {
            response = await _httpClient.GetFromJsonAsync<TmdbMovieDetails>(
                $"movie/{id}?append_to_response=videos",
                cancellationToken);
        }
        catch (HttpRequestException exception) when (exception.StatusCode == HttpStatusCode.NotFound)
        {
            throw new MovieException(
                MovieException.ExceptionTitle,
                ErrorType.EntityNotFound,
                $"Movie with id {id} was not found.");
        }
        catch (HttpRequestException)
        {
            throw new MovieException(
                MovieException.ExceptionTitle,
                ErrorType.UpstreamServiceUnavailable,
                "TMDB did not return movie details.");
        }

        if (response is null)
        {
            throw new MovieException(
                MovieException.ExceptionTitle,
                ErrorType.UpstreamServiceUnavailable,
                "TMDB returned an empty movie details response.");
        }

        return response.ToDomainModel();
    }

}
