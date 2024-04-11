export const imageOptimization = (url, optimization) => {
  const uploadIndex = url.indexOf("upload/");
  const modifiedUrl = `${url.slice(
    0,
    uploadIndex + 7
  )}${optimization}/${url.slice(uploadIndex + 7)}`;
  return modifiedUrl;
};
