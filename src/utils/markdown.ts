export const getMarkdownPreview = (
  content: string,
  maxLength: number = 150
): string => {
  const withoutMarkdown = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*{1,3}|_{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/>\s/g, '')
    .trim();

  if (withoutMarkdown.length <= maxLength) {
    return withoutMarkdown;
  }

  return withoutMarkdown.slice(0, maxLength) + '...';
};
