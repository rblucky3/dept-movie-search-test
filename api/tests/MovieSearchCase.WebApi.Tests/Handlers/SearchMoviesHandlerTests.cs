using Moq;
using Xunit;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using MovieSearchCase.WebApi.Models;
using MovieSearchCase.Domain.Entities;
using MovieSearchCase.Domain.Exceptions;
using MovieSearchCase.WebApi.Handlers.Movies;
using MovieSearchCase.Domain.Interfaces.Services;
using ApiMovie = MovieSearchCase.WebApi.Models.Movies.Movie;

namespace MovieSearchCase.WebApi.Tests.Handlers;

public class SearchMoviesHandlerTests
{
    [Fact]
    public async Task HandleShouldReturnOkWithPagedMoviesWhenServiceSucceeds()
    {
        var searchResult = new PagedResults<Movie>
        {
            Results = [new Movie { Id = 7, Title = "Se7en", VoteAverage = 8.4 }],
            Page = 2,
            TotalPages = 5,
            TotalResults = 93,
        };

        var movieServiceMock = new Mock<IMovieService>();
        movieServiceMock
            .Setup(service => service.SearchAsync("seven", 2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(searchResult);

        var handler = new SearchMoviesHandler(movieServiceMock.Object, "seven", 2);

        var result = await handler.HandleAsync(new DefaultHttpContext().Request);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<PagedResponse<ApiMovie>>().Subject;
        response.Page.Should().Be(2);
        response.TotalPages.Should().Be(5);
        response.TotalResults.Should().Be(93);
        response.Results.Should().ContainSingle(movie => movie.Id == 7 && movie.Title == "Se7en");
    }

    [Theory]
    [InlineData("", 1)]
    [InlineData("   ", 1)]
    [InlineData("matrix", 0)]
    [InlineData("matrix", -3)]
    [InlineData("matrix", 501)]
    public async Task HandleShouldThrowInvalidRequestForInvalidParameters(string query, int page)
    {
        var movieServiceMock = new Mock<IMovieService>();
        var handler = new SearchMoviesHandler(movieServiceMock.Object, query, page);

        var act = () => handler.HandleAsync(new DefaultHttpContext().Request);

        (await act.Should().ThrowAsync<MovieException>())
            .Which.ErrorCode.Should().Be(ErrorType.InvalidRequest);
        movieServiceMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task HandleShouldThrowInvalidRequestForOverlongQuery()
    {
        var movieServiceMock = new Mock<IMovieService>();
        var handler = new SearchMoviesHandler(
            movieServiceMock.Object,
            new string('a', SearchMoviesHandler.MaxQueryLength + 1),
            1);

        var act = () => handler.HandleAsync(new DefaultHttpContext().Request);

        (await act.Should().ThrowAsync<MovieException>())
            .Which.ErrorCode.Should().Be(ErrorType.InvalidRequest);
    }
}
