const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function handleResponse(res) {
  if (res.status === 204) return null;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = body.error || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.details = body.details;
    throw err;
  }
  return body;
}

/**
 * Fetch a paginated, filtered list of posts.
 * Pass `admin: true` to include Draft posts (author/admin view).
 */
export async function fetchPosts({
  search = "",
  category = "",
  status = "",
  page = 1,
  limit = 6,
  admin = false,
  sort = "",
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (status) params.set("status", status);
  if (sort) params.set("sort", sort);
  params.set("page", page);
  params.set("limit", limit);
  if (admin) params.set("admin", "true");

  const res = await fetch(`${API_URL}/posts?${params.toString()}`, {
    headers: admin ? { "x-admin": "true" } : {},
  });
  return handleResponse(res);
}

export async function fetchPost(idOrSlug, { admin = false } = {}) {
  const params = admin ? "?admin=true" : "";
  const res = await fetch(`${API_URL}/posts/${idOrSlug}${params}`, {
    headers: admin ? { "x-admin": "true" } : {},
  });
  return handleResponse(res);
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/posts/categories`);
  return handleResponse(res);
}

export async function createPost(payload) {
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin": "true" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updatePost(id, payload) {
  const res = await fetch(`${API_URL}/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-admin": "true" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deletePost(id) {
  const res = await fetch(`${API_URL}/posts/${id}`, {
    method: "DELETE",
    headers: { "x-admin": "true" },
  });
  return handleResponse(res);
}
