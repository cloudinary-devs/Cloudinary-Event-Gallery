/**
 * Extract the last part of the string after the last "/"
 * of a URL.
 * @returns the last part of a url
 */
export const getLastPartOfUrl = () => {
    const parts = window.location.href.split("/");
    const lastPart = parts[parts.length - 1];
    return lastPart;
}

/**
 * Function to extract the EventId from the Apps URL
 * @param {*} urlPath 
 * @returns Event Id
 */
export const getEventIdFromUrl = (urlPath) => {
    return urlPath
    .split("/")
    .filter((segment) => segment !== "")[1];
}