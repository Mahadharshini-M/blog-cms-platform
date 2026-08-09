import { useEffect, useReducer, useCallback } from "react";
import { fetchPosts } from "../api/posts.js";
import { useDebouncedValue } from "./useDebouncedValue.js";

const initialState = {
  posts: [],
  pagination: null,
  status: "loading",
  errorMessage: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, status: "loading", errorMessage: "" };
    case "FETCH_SUCCESS":
      return { ...state, status: "success", posts: action.posts, pagination: action.pagination };
    case "FETCH_ERROR":
      return { ...state, status: "error", errorMessage: action.message };
    default:
      return state;
  }
}

export function usePosts({ search = "", category = "", status = "", page = 1, limit = 6, admin = false, sort = "" } = {}) {
  const debouncedSearch = useDebouncedValue(search, 400);
  const [state, dispatch] = useReducer(reducer, initialState);

  const load = useCallback(() => {
    let cancelled = false;
    dispatch({ type: "FETCH_START" });

    fetchPosts({ search: debouncedSearch, category, status, page, limit, admin, sort })
      .then((res) => {
        if (cancelled) return;
        dispatch({ type: "FETCH_SUCCESS", posts: res.data, pagination: res.pagination });
      })
      .catch((err) => {
        if (cancelled) return;
        dispatch({ type: "FETCH_ERROR", message: err.message });
      });

    return () => { cancelled = true; };
  }, [debouncedSearch, category, status, page, limit, admin]);

  useEffect(load, [load]);

  return { ...state, reload: load };
}
