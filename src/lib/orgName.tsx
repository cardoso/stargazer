let search = window.location.search;
let params = new URLSearchParams(search);
export default params.get('query') || "getstream";