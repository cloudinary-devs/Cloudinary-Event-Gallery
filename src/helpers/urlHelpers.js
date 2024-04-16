export const getLastPartOfUrl = () => {
    const parts = window.location.href.split("/");
    const lastPart = parts[parts.length - 1];
    return lastPart;
}

export const getEventIdFromUrl = (urlPath) => {
    return urlPath
    .split("/")
    .filter((segment) => segment !== "")[1];
}