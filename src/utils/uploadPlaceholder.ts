const truncate = (value: string, maxLength = 26) => {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}…`;
};

export const createUploadPlaceholder = (fileName?: string) => {
  const rawName = fileName?.trim();
  const displayName = truncate(rawName && rawName.length > 0 ? rawName : '이미지');
  const token = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const label = `${displayName} 업로드 중…`;

  return {
    token,
    label,
    markdown: `[${label}](#${token})`,
  };
};
