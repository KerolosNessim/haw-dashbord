/** One blog tag with SEO flags for `/blogs/tag/{name}` archive pages. */
export type BlogTagFormValue = {
  name: string;
  /** Allow search engines to index the tag archive page. */
  index: boolean;
  /** Allow search engines to follow links on the tag archive page. */
  follow: boolean;
};
