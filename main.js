const handlePaginationClick = (event) => {
    const page = event.target.getAttribute("data-page");
    const url = lastQuery ? `?page=${page}&${lastQuery}` : `?page=${page}`;
    window.history.pushState({}, "", url);
    loadFData(null, true);
  };
