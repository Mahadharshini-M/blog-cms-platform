export function postImage(post, width = 800, height = 450) {
  return post.image_url || `https://picsum.photos/seed/${post.slug}/${width}/${height}`;
}
