import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";
import ReactPaginate from "react-paginate";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { type Movie } from "../../types/movie";
import { fetchMovies, type TMDBResponse } from "../../services/movieService";
import css from "./App.module.css";

const TMDB_TOKEN = import.meta.env.VITE_API_KEY;

const App: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, TMDB_TOKEN, page),
    enabled: !!query,
    placeholderData: (previousData) => previousData,
    onSuccess: (data: TMDBResponse) => {
      if (data.results.length === 0) {
        toast("No movies found for your request.");
      }
    },
    onError: (error: unknown) => {
      console.error(error);
      toast.error("An error occurred while fetching movies.");
    },
  }) as UseQueryResult<TMDBResponse, Error>;

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  return (
    <>
      <SearchBar onSubmit={handleSearch} />
      <Toaster />
      <main>
        {isLoading && <Loader />}
        {isError && <ErrorMessage />}
        {data && data.results.length > 0 && (
          <>
            <MovieGrid movies={data.results} onSelect={handleSelectMovie} />

            {data.total_pages > 1 && (
              <ReactPaginate
                pageCount={data.total_pages}
                pageRangeDisplayed={5}
                marginPagesDisplayed={1}
                onPageChange={({ selected }) => setPage(selected + 1)}
                forcePage={page - 1}
                containerClassName={css.pagination}
                activeClassName={css.active}
                nextLabel="→"
                previousLabel="←"
              />
            )}
          </>
        )}
      </main>

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default App;
