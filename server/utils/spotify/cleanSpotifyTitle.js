export const cleanTitle = (title) => {
  return title
    .replace(/\s*\(.*?\)/g, "") // remove (...)
    .replace(/\s*-\s*.*$/g, "") // remove - From "..."
    .replace(/\s*\[.*?\]/g, "") // remove [...]
    .trim();
};
