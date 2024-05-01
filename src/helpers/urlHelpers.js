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