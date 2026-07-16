export const formatFileSize = (bytes) => {
  if (bytes === 0 || !bytes) return '0.0 KB';
  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  }
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
