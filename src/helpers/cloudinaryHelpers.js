/**
 * Creates a URL with optimization for the image
 * E.g q_auto
 * @param {*} url 
 * @param {*} optimization 
 * @returns a new string url
 */
export const imageOptimizationUrl = (url, optimization) => {
  const uploadIndex = url.indexOf("upload/");
  const modifiedUrl = `${url.slice(
    0,
    uploadIndex + 7
  )}${optimization}/${url.slice(uploadIndex + 7)}`;
  return modifiedUrl;
};
