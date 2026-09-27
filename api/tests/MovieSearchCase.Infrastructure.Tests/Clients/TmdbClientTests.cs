using System.Net;
using System.Text;
using FluentAssertions;
using MovieSearchCase.Domain.Exceptions;
using MovieSearchCase.Infrastructure.Clients;
using Xunit;

namespace MovieSearchCase.Infrastructure.Tests.Clients;

public class TmdbClientTests
{
    [Fact]
    public async Task SearchMoviesAsyncShouldEncodeQueryAndMapPagedResponse()
    {
        var handler = new StubHandler(HttpStatusCode.OK, """
            {
              "page": 3,
              "total_pages": 812,
              "total_results": 16230,
              "results": [
                { "id": 1, "title": "Love & Death", "vote_average": 7.1, "release_date": "1975-06-10" },
                { "id": 2, "title": "Undated", "vote_average": 0, "release_date": "" }
              ]
            }
            """);
        var client = CreateClient(handler);

        var result = await client.SearchMoviesAsync("love & death", 3, CancellationToken.None);

        handler.LastRequestUri!.PathAndQuery.Should().Be("/3/search/movie?query=love%20%26%20death&page=3&include_adult=false");
        result.Page.Should().Be(3);
        result.TotalResults.Should().Be(16230);
        result.TotalPages.Should().Be(500, "TMDB rejects pages above 500, so we never advertise more");
        result.Results.Should().HaveCount(2);
        result.Results[0].ReleaseDate.Should().Be(new DateOnly(1975, 6, 10));
        result.Results[1].ReleaseDate.Should().BeNull();
    }

    [Fact]
    public async Task SearchMoviesAsyncShouldThrowUpstreamUnavailableWhenTmdbFails()
    {
        var client = CreateClient(new StubHandler(HttpStatusCode.InternalServerError, "{}"));

        var act = () => client.SearchMoviesAsync("matrix", 1, CancellationToken.None);

        (await act.Should().ThrowAsync<MovieException>())
            .Which.ErrorCode.Should().Be(ErrorType.UpstreamServiceUnavailable);
    }

    [Fact]
    public async Task GetMovieDetailsAsyncShouldPickOfficialYouTubeTrailer()
    {
        var handler = new StubHandler(HttpStatusCode.OK, """
            {
              "id": 603,
              "title": "The Matrix",
              "tagline": "Welcome to the Real World.",
              "runtime": 136,
              "genres": [{ "id": 28, "name": "Action" }],
              "videos": {
                "results": [
                  { "key": "teaser", "site": "YouTube", "type": "Teaser", "official": true },
                  { "key": "vimeo", "site": "Vimeo", "type": "Trailer", "official": true },
                  { "key": "fan-trailer", "site": "YouTube", "type": "Trailer", "official": false },
                  { "key": "official-trailer", "site": "YouTube", "type": "Trailer", "official": true }
                ]
              }
            }
            """);
        var client = CreateClient(handler);

        var result = await client.GetMovieDetailsAsync(603, CancellationToken.None);

        handler.LastRequestUri!.PathAndQuery.Should().Be("/3/movie/603?append_to_response=videos");
        result.Tagline.Should().Be("Welcome to the Real World.");
        result.Runtime.Should().Be(136);
        result.Genres.Should().Equal("Action");
        result.YouTubeTrailerKey.Should().Be("official-trailer");
    }

    [Fact]
    public async Task GetMovieDetailsAsyncShouldThrowNotFoundWhenTmdbReturns404()
    {
        var client = CreateClient(new StubHandler(HttpStatusCode.NotFound, "{}"));

        var act = () => client.GetMovieDetailsAsync(999999999, CancellationToken.None);

        (await act.Should().ThrowAsync<MovieException>())
            .Which.ErrorCode.Should().Be(ErrorType.EntityNotFound);
    }

    private static TmdbClient CreateClient(HttpMessageHandler handler) =>
        new(new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") });

    private sealed class StubHandler : HttpMessageHandler
    {
        private readonly HttpStatusCode _statusCode;
        private readonly string _body;

        public StubHandler(HttpStatusCode statusCode, string body)
        {
            _statusCode = statusCode;
            _body = body;
        }

        public Uri? LastRequestUri { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            LastRequestUri = request.RequestUri;

            return Task.FromResult(new HttpResponseMessage(_statusCode)
            {
                Content = new StringContent(_body, Encoding.UTF8, "application/json"),
            });
        }
    }
}
