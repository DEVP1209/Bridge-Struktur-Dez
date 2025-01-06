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

