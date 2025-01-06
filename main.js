const handlePaginationClick = (event) => {
    const page = event.target.getAttribute("data-page");
    const url = lastQuery ? `?page=${page}&${lastQuery}` : `?page=${page}`;
    window.history.pushState({}, "", url);
    loadFData(null, true);
  };


  const getQuery = () => {
    let lastQuery = window.location.href.includes("page=") ? window.location.href.split("page=")[1].substring(2) : null;
    if (lastQuery === null) {
      lastQuery = window.location.href.includes("?") ? window.location.href.split("?")[1] : "";
    }
    return lastQuery;
  }


  async function fetchFilters() {
    try {
        const response = await fetch('https://bildzeitschrift.netlify.app/.netlify/functions/filters');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        return data
    } catch (error) {
        console.error('Failed to fetch filters:', error);
    }
}
fetchFilters();
// console.log(fetchFilters());