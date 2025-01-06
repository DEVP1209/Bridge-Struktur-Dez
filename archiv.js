// State management instead of cookies
let sortRandom = true;
let selectionExcluding = false;
let currentPage = 1;
const getQuery = () => {
  let lastQuery = window.location.href.includes("page=") ? window.location.href.split("page=")[1].substring(2) : (window.location.href.split("?")[1] ? window.location.href.split("?")[1] : "");
  return lastQuery;
}
const randomMags = async (array) => {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  };
  async function renderData(data) {
    if (data.count == 0) {
      const colList = document.getElementsByClassName(
        "collection-list w-dyn-items w-row"
      )[0];
      colList.style.display = "none";
      const noResultsFound =
        document.getElementsByClassName("no-results-wrapper")[0];
      noResultsFound.style.display = "block";
    } else {
      const colList = document.getElementsByClassName(
        "w-dyn-items w-row"
      )[0];
      colList ? colList.style.display = "block" : null
      const noResultsFound =
        document.getElementsByClassName("no-results-wrapper")[0];
      noResultsFound.style.display = "none";
  
      const resultsCount = document.getElementsByClassName("results-count")[0];
  
      const replaceResultsCount = document.createElement("div");
      replaceResultsCount.className = "results-count";
      const span = document.createElement("span");
      span.textContent = data.count + " Ergebnisse von ";
      const span2 = document.createElement("span");
      span2.textContent = data.totalCount;
      replaceResultsCount.append(span, span2);
      resultsCount.replaceWith(replaceResultsCount);
  
      //fragment creation to enhance load speed
      let fragment = document.createDocumentFragment();
  
      //grabbing collection elements to later add fragment
      const list = document.getElementsByClassName("w-dyn-list")[0];
  
      var collection;
      if (document.getElementsByClassName("w-dyn-items w-row")[0]) {
        collection = document.getElementsByClassName("w-dyn-items w-row")[0];
        collection.remove()
      }
      collection = document.createElement("div");
      collection.className = "w-dyn-items w-row";
      let collections, plan
      if (sessionStorage.getItem("auth") != null) {
        collections = await fetch("https://bildzeitschrift.netlify.app/.netlify/functions/collection", {
          method: "GET",
          headers: {
            Authorization: sessionStorage.getItem("auth"),
          },
        })
        collections = await collections.json()
        plan = collections.subscription || null
        collections = collections.collections
  
        sessionStorage.setItem("collections", JSON.stringify(Array.from(collections)))
      }
      let imgCount = 0;
      for (q of data.magazines) {
        // class_list.push('')
        let productWrapper = document.createElement("div");
        productWrapper.className = "archive-col-item w-dyn-item w-col w-col-3";
        //image wraper link creation
        var productImgWrapper = document.createElement("a");
        productImgWrapper.href =
          new URL(document.baseURI).origin + "/magazine?productId=" + q.SKU;
        productImgWrapper.className = "produvt-img-wrapper w-inline-block";
        productImgWrapper.id = q.SKU
        productImgWrapper.style.zIndex = "0"
        productImgWrapper.style.position = "relative"
        //img element creation
        var img = document.createElement("img");
        img.className = "product-img";
        img.src =
          "https://res.cloudinary.com/wdy-bzs/image/upload/q_15/v1651695832/" +
          q.Images;
        img.loading = imgCount <= 10 ? "eager" : "lazy";
        imgCount++;
        img.alt = "product-img";
        let dropdown = "", save = ""
  
  
        // check if logged in 
        if (sessionStorage.getItem("auth") && plan != null && plan.end_date > Math.floor(Date.now() / 1000) && plan.plan == "Inspiration") {
          document.querySelector(".filter-info").style.display = "none"
          dropdown = document.createElement("button");
          dropdown.className = "btn-specihern left-btn"
          dropdown.innerText = "..."
          save = document.createElement("button");
          save.className = "btn-specihern"
  
          save.innerText = collections.some(obj => obj.items.includes(q.SKU)) ? "Gespeichert" : "Speichern"
  
  
          dropdown.addEventListener("click", (event) => {
            event.preventDefault() // to stop link element from redirecting
  
            // open dropdown 
            if (event.target.parentElement.querySelector(".container-mode") == null) {
              // if there are any other open containers remove them
              if (document.querySelector("#container-main") != null) document.querySelector("#container-main").remove()
              const container = document.createElement("div")
              container.id = "container-main"
              container.className = "container-mode"
              let url = new URL(event.target.parentElement.href)
              container.setAttribute("dropdown-key", new URLSearchParams(url.search).get("productId"))
              const search = document.createElement("input")
              search.placeholder = "Suchen ..."
              search.className = "collection-search"
  
              search.addEventListener("input", (event) => {
                const it = event.target.parentElement.querySelectorAll(".collections")
                if (event.target.value == '') {
  
                  for (let i = 0; i < it.length - 1; i++) {
                    it[i].style.display = "flex"
  
                  }
  
                }
                for (let i = 0; i < it.length - 1; i++) {
                  if (!it[i].innerText.toLowerCase().startsWith(event.target.value.toLowerCase())) {
                    it[i].style.display = "none"
                  } else if (it[i].innerText.toLowerCase().startsWith(event.target.value.toLowerCase()) && it[i].style.display == "none") {
                    it[i].style.display = "flex"
                  }
                }
              })
  
              container.appendChild(search)
  
              if (sessionStorage.getItem("collections")) {
                let collections = JSON.parse(sessionStorage.getItem("collections"))
                for (let i = 0; i < collections.length; i++) {
                  const parentDiv = document.createElement("div")
                  parentDiv.className = "collections"
                  const childDiv = document.createElement("div")
                  childDiv.className = "collection-name"
                  childDiv.style.marginLeft = "10px"
                  childDiv.innerText = collections[i].name
                  const btn = document.createElement("button")
                  btn.className = "collection-btn"
                  btn.style.visibility = "visible"
                  btn.innerText = collections[i].items.includes(event.target.parentElement.href.split("?productId=")[1]) ? "saved" : "+"
                  btn.addEventListener("click", (event) => {
                    event.target
                      .parentElement
                      .parentElement
                      .parentElement
                      .querySelector(".btn-specihern.left-btn")
                      .innerText = collections[i].name
  
                    // save an item to collection
                    if (event.target.innerText == "+") {
  
                      var arry = collections.find(obj => obj.name == event.target.parentElement.childNodes[0].innerText)
  
                      fetch("https://bildzeitschrift.netlify.app/.netlify/functions/collection", {
                        method: "PUT",
                        headers: {
                          Authorization: sessionStorage.getItem("auth")
                        },
                        body: JSON.stringify({
                          name: event.target.parentElement.childNodes[0].innerText,
                          update: {
                            $addToSet: {
                              items: event.target.parentElement.parentElement.getAttribute("dropdown-key")
                            },
                            ...(!arry.hasOwnProperty("cover") ? {
                              $set: { cover: event.target.parentElement.parentElement.parentElement.querySelector(".product-img").src.split("/v1651695832/")[1] }
  
                            } : {})
                          }
                        })
                      }).then((res) => {
                        // if it was saved to database only then update the state
                        if (res.status == 200) {
                          arry = collections.find(obj => obj.name == event.target.parentElement.childNodes[0].innerText)
                          if (arry.hasOwnProperty("cover")) {
                            arry["cover"] = event.target.parentElement.parentElement.parentElement.querySelector(".product-img").src.split("/v1651695832/")[1]
                          }
                          arry.items.push(event.target.parentElement.parentElement.getAttribute("dropdown-key"))
                          event.target.innerText = "saved"
                          sessionStorage.setItem("collections", JSON.stringify(collections))
  
  
  
                          if (collections.some(obj => obj.items.includes(event.target.parentElement.parentElement.getAttribute("dropdown-key")))) {
                            event.target.parentElement.parentElement.parentElement.querySelector(".btn-specihern").innerText = "Gespeichert"
                          } else {
                            event.target.parentElement.parentElement.parentElement.querySelector(".btn-specihern").innerText = "Speichern"
                          }
                          document.querySelectorAll(".btn-specihern.left-btn").forEach((e) => {
                            e.innerText = event.target.parentElement.childNodes[0].innerText
                          })
                        }
                      })
  
  
  
                    }
                    // delete an item from collection 
                    else {
  
                      fetch("https://bildzeitschrift.netlify.app/.netlify/functions/collection", {
                        method: "PUT",
                        headers: {
                          Authorization: sessionStorage.getItem("auth")
                        },
                        body: JSON.stringify({
                          name: event.target.parentElement.childNodes[0].innerText,
                          update: {
                            $pull: {
                              items: event.target.parentElement.parentElement.getAttribute("dropdown-key")
                            }
                          }
                        })
                      }).then((res) => {
                        // if it was deleted from database only then update the state
                        if (res.status == 200) {
                          let arry = collections.find(obj => obj.name == event.target.parentElement.childNodes[0].innerText)
                          const index = arry.items.indexOf(event.target.parentElement.parentElement.getAttribute("dropdown-key"));
  
                          if (index > -1) {
                            arry.items.splice(index, 1);
                            sessionStorage.setItem("collections", JSON.stringify(collections))
                          }
                          event.target.innerText = "+"
                          if (collections.some(obj => obj.items.includes(event.target.parentElement.parentElement.getAttribute("dropdown-key")))) {
                            event.target.parentElement.parentElement.parentElement.querySelector(".btn-specihern").innerText = "Gespeichert"
                          } else {
                            event.target.parentElement.parentElement.parentElement.querySelector(".btn-specihern").innerText = "Speichern"
                          }
                        }
                      })
  
  
                    }
  
  
  
  
  
  
                  })
                  parentDiv.appendChild(childDiv)
                  parentDiv.appendChild(btn)
                  container.appendChild(parentDiv)
                }
              }
  
  
  
              const createCollection = document.createElement("div")
              createCollection.className = "collections"
              const btn = document.createElement("button")
              btn.innerText = "+"
              btn.className = "collection-btn"
              btn.style.visibility = "visible"
  
              btn.addEventListener("click", async (event) => {
  
                let output = await Swal.fire({
                  title: "Neue Kollektion",
                  input: "text",
                  inputLabel: "Name",
                  inputPlaceholder: "Name deiner neuen Kollektion",
                  confirmButtonText: "Erstellen",
                  showCloseButton : true,
                  inputValidator: (value) => {
                    if (!value) {
                      return "Name cannot be empty";
                    }
                  },
                });
                let collections = JSON.parse(sessionStorage.getItem("collections"))
                // check if collection already exists
                if (!collections.some(obj => obj.name == output.value) && output.value != undefined) {
                  // create new collection in database 
                  fetch("https://bildzeitschrift.netlify.app/.netlify/functions/collection", {
                    method: "POST",
                    headers: {
                      Authorization: sessionStorage.getItem("auth")
                    },
                    body: JSON.stringify({
                      name: output.value,
                      item: event.target.parentElement.parentElement.getAttribute("dropdown-key")
                    })
                  }).then((res) => {
                    if (res.status == 200) {
                      const obj = { name: output.value, items: [], cover: event.target.parentElement.parentElement.getAttribute("dropdown-key").replaceAll("-", "_").replaceAll("(", "").replaceAll(")", "") }
                      obj.items.push(event.target.parentElement.parentElement.getAttribute("dropdown-key"))
                      document.getElementById(`${event.target.parentElement.parentElement.getAttribute("dropdown-key")}`).querySelector(".btn-specihern").innerText = "Gerettet"
                      document.querySelectorAll(".btn-specihern.left-btn").forEach((e) => {
                        e.innerText = output.value
                      })
  
  
                      collections.push(obj)
                      sessionStorage.setItem("collections", JSON.stringify(collections))
  
  
                    }
                  })
  
  
  
                }
  
  
  
  
  
              })
  
  
              const label = document.createElement("div")
              label.className = "collection-name"
              label.innerText = "Kollektion erstellen"
              label.style.marginLeft = "10px"
  
              createCollection.appendChild(btn)
              createCollection.appendChild(label)
              container.appendChild(createCollection)
  
              container.addEventListener("click", (event) => {
                event.preventDefault()
              })
  
              event.target.insertAdjacentElement("afterend", container)
  
            }
            // to close dropdown
            else {
              event.target.parentElement.querySelector(".container-mode").remove()
            }
  
  
          })
  
          document.addEventListener("click", (event) => {
            if (!event.target.closest("#container-main") && document.querySelector("#container-main") != null && event.target.className != "btn-specihern left-btn") {
              document.querySelector("#container-main").remove()
            }
          })
  
  
          save.addEventListener("click", (event) => {
            event.preventDefault()
          })
  
  
  
          productImgWrapper.addEventListener("mouseover", () => {
            dropdown.style.visibility = "visible"
            save.style.visibility = "visible"
          })
  
          productImgWrapper.addEventListener("mouseout", () => {
            dropdown.style.visibility = "hidden"
            save.style.visibility = "hidden"
          })
        }
  
  
  
        //product titel creation
        var title = document.createElement("div");
        title.className = "product-title";
        if (q.Name.length > 21) title.innerText = q.Name.slice(0, 18) + "...";
        else title.innerText = q.Name;
  
        title.setAttribute("fs-cmsfilter-field", "Titel");
  
        var issueWrapper = document.createElement("div");
        issueWrapper.className = "issue-wrapper";
  
        //issue wrapper children elements
        var month = document.createElement("div");
        month.className = "month";
        month.innerText = q.Monat + " | ";
        var dateDivider = document.createElement("div");
        dateDivider.className = "date-divider";
        var year = document.createElement("div");
        year.className = "year";
        year.innerText = " " + q.Jahr + " Ausgabe " + q.Ausgabe;
        var decade = document.createElement("div");
        decade.className = "decade";
  
        issueWrapper.append(month, dateDivider, year, decade);
        if(q.Bewertung == "Special"){
          const special_img = document.createElement("img")
          special_img.src = "https://res.cloudinary.com/wdy-bzs/image/upload/v1661106376/asset/special_icon";
          special_img.className = "special-img"
          productImgWrapper.append(special_img)
        }
        productImgWrapper.append(img, save, dropdown, title, issueWrapper);
        
        productWrapper.append(productImgWrapper);
        productWrapper.setAttribute("role", "listitem");
        fragment.append(productWrapper);
      }
      collection.append(fragment);
      list.prepend(collection);
      await pagination();
      const lastQuery = getQuery();
      if (lastQuery == "") {
        fetch(
          "https://bildzeitschrift.netlify.app/.netlify/functions/randomize"
        ).catch()
      }
      return plan
    }
  
    async function pagination() {
      const list = document.getElementsByClassName("w-dyn-list")[0];
      var paginationWrapper;
      
      const handlePaginationClick = (event) => {
        const lastQuery = getQuery();
        const page = event.target.getAttribute("data-page");
        const url = lastQuery ? `?page=${page}&${lastQuery}` : `?page=${page}`;
        window.history.pushState({}, "", url);
        updatePagination(page);
      };
      if (document.getElementsByClassName("w-pagination-wrapper pagination")[0]) {
        paginationWrapper = document.getElementsByClassName(
          "w-pagination-wrapper pagination"
        )[0];
        paginationWrapper.remove();
      }
      paginationWrapper = document.createElement("div");
      paginationWrapper.className = "w-pagination-wrapper pagination";
      paginationWrapper.style.display = "flex";
  
  
      const pageCount = data.pageCount;
      const currentPage = data.currentPage || 1;
  
      const pageFragment = document.createDocumentFragment();
      if (currentPage != 1) {
        if (currentPage > 10) {
          const leftArrowButton = document.createElement("div");
          leftArrowButton.className =
            "w-pagination-previous pagination-button-left keep-params 10xarrow";
          leftArrowButton.setAttribute("aria-label", "Previous Page");
          leftArrowButton.style.marginRight = 0;
          const leftArrowImage = document.createElement("img");
          leftArrowImage.width = "45";
          leftArrowImage.loading = "lazy";
          leftArrowImage.src =
            "https://res.cloudinary.com/wdy-bzs/image/upload/v1661106376/asset/Group_42_1.svg";
          leftArrowImage.className = "pagination-arrow left";
          leftArrowButton.style.marginRight = "0px";
          leftArrowButton.style.paddingRight = "0px";
          leftArrowButton.append(leftArrowImage);
          pageFragment.append(leftArrowButton);
          leftArrowButton.setAttribute("data-page", currentPage - 10);
          leftArrowButton.addEventListener("click", handlePaginationClick);
        }
        const leftArrowButton = document.createElement("div");
        leftArrowButton.className =
          "w-pagination-previous pagination-button-left keep-params 10xarrow";
        leftArrowButton.setAttribute("aria-label", "Previous Page");
        const leftArrowImage = document.createElement("img");
        leftArrowImage.width = "45";
        leftArrowImage.loading = "lazy";
        leftArrowImage.src =
          "https://res.cloudinary.com/wdy-bzs/image/upload/v1651849092/asset/Arrow.svg";
        leftArrowImage.className = "pagination-arrow left";
        leftArrowButton.style.paddingLeft = "0px";
        leftArrowButton.style.paddingRight = "0px";
        leftArrowButton.append(leftArrowImage);
        pageFragment.append(leftArrowButton);
        leftArrowButton.setAttribute("data-page", currentPage - 1);
        leftArrowButton.addEventListener("click", handlePaginationClick);
      }
      if (pageCount <= 7) {
        for (i = 1; i <= pageCount; i++) {
          const pageButton = document.createElement("div");
          const pageDiv = document.createElement("div");
          pageDiv.textContent = i;
          pageButton.className = "pagination-page-button w-inline-block";
          pageButton.setAttribute("data-page", i);
          pageButton.addEventListener("click", handlePaginationClick);
          pageButton.append(pageDiv);
          pageFragment.append(pageButton);
          if (i == currentPage) {
            pageButton.className =
              "pagination-page-button w-inline-block w--current";
          }
        }
        paginationWrapper.append(pageFragment);
      } else {
        if (currentPage < 5) {
          for (i = 1; i <= 5; i++) {
            const pageButton = document.createElement("div");
            const pageDiv = document.createElement("div");
            pageDiv.textContent = i;
            pageButton.className = "pagination-page-button w-inline-block";
            pageButton.setAttribute("data-page", i);
            pageButton.addEventListener("click", handlePaginationClick);
            ;
            pageButton.append(pageDiv);
            pageFragment.append(pageButton);
            if (i == currentPage) {
              pageButton.className =
                "pagination-page-button w-inline-block w--current";
            }
          }
  
          const pageDots = document.createElement("div");
          pageDots.textContent = "...";
          pageDots.className = "pagination-dots-button";
          pageFragment.append(pageDots);
  
          const lastPageButton = document.createElement("div");
          const lastPageDiv = document.createElement("div");
          lastPageDiv.textContent = pageCount;
          lastPageButton.className = "pagination-page-button w-inline-block";
          lastPageButton.setAttribute("data-page", pageCount);
          lastPageButton.addEventListener("click", handlePaginationClick);
  
          lastPageButton.append(lastPageDiv);
          pageFragment.append(lastPageButton);
          paginationWrapper.append(pageFragment);
        } else if (currentPage >= 5 && currentPage <= pageCount - 4) {
          const firstPageButton = document.createElement("div");
          const firstPageDiv = document.createElement("div");
          firstPageDiv.textContent = "1";
          firstPageButton.className = "pagination-page-button w-inline-block";
          firstPageButton.setAttribute("data-page", 1);
          firstPageButton.addEventListener("click", handlePaginationClick);
          firstPageButton.append(firstPageDiv);
          pageFragment.append(firstPageButton);
  
          const pageDots = document.createElement("div");
          pageDots.textContent = "...";
          pageDots.className = "pagination-dots-button";
          pageFragment.append(pageDots);
          var j = currentPage - 1;
          for (i = 0; i < 3; i++) {
            const pageButton = document.createElement("div");
            const pageDiv = document.createElement("div");
  
            pageDiv.textContent = j;
            pageButton.className = "pagination-page-button w-inline-block";
            pageButton.setAttribute("data-page", j);
            pageButton.addEventListener("click", handlePaginationClick);
            pageButton.append(pageDiv);
            pageFragment.append(pageButton);
            if (j == currentPage) {
              pageButton.className =
                "pagination-page-button w-inline-block w--current";
            }
            j = j + 1;
          }
          const midPageDots = document.createElement("div");
          midPageDots.textContent = "...";
          midPageDots.className = "pagination-dots-button";
          pageFragment.append(midPageDots);
  
          const lastPageButton = document.createElement("div");
          const lastPageDiv = document.createElement("div");
          lastPageDiv.textContent = pageCount;
          lastPageButton.className = "pagination-page-button w-inline-block";
          lastPageButton.setAttribute("data-page", pageCount);   // Check here , maybe i 
          lastPageButton.addEventListener("click", handlePaginationClick);
          lastPageButton.append(lastPageDiv);
          pageFragment.append(lastPageButton);
          paginationWrapper.append(pageFragment);
        } else {
          const firstPageButton = document.createElement("div");
          const firstPageDiv = document.createElement("div");
          firstPageDiv.textContent = "1";
          firstPageButton.className = "pagination-page-button w-inline-block";
          firstPageButton.setAttribute("data-page", 1);
          firstPageButton.addEventListener("click", handlePaginationClick);
  
          firstPageButton.append(firstPageDiv);
          pageFragment.append(firstPageButton);
  
          const pageDots = document.createElement("div");
          pageDots.textContent = "...";
          pageDots.className = "pagination-dots-button";
          pageFragment.append(pageDots);
  
          for (i = pageCount - 4; i <= pageCount; i++) {
            const pageButton = document.createElement("div");
            const pageDiv = document.createElement("div");
            pageDiv.textContent = i;
            pageButton.className = "pagination-page-button w-inline-block";
            pageButton.setAttribute("data-page", i);
            pageButton.addEventListener("click", handlePaginationClick);
  
            pageButton.append(pageDiv);
            pageFragment.append(pageButton);
            if (i == currentPage) {
              pageButton.className =
                "pagination-page-button w-inline-block w--current";
            }
            j++;
          }
          paginationWrapper.append(pageFragment);
        }
      }
      if (currentPage != pageCount) {
  
        const rightArrowButton = document.createElement("div");
        rightArrowButton.className =
          "w-pagination-right pagination-button-next keep-params 10xarrow";
        rightArrowButton.setAttribute("aria-label", "Next Page");
        const rightArrowImage = document.createElement("img");
        rightArrowButton.style.marginLeft = 10;
        rightArrowImage.width = "45";
        rightArrowImage.loading = "lazy";
        rightArrowImage.src =
          "https://res.cloudinary.com/wdy-bzs/image/upload/v1651849092/asset/Arrow.svg";
        rightArrowImage.className = "pagination-arrow right";
        rightArrowButton.append(rightArrowImage);
        rightArrowButton.setAttribute("data-page", Number(currentPage) + 1);
        rightArrowButton.addEventListener("click", handlePaginationClick);
        paginationWrapper.append(rightArrowButton);
        if (pageCount - currentPage >= 10) {
          const rightArrowButton = document.createElement("div");
          rightArrowButton.className =
            "w-pagination-right pagination-button-next keep-params 10xarrow";
          rightArrowButton.setAttribute("aria-label", "Next Page");
          const rightArrowImage = document.createElement("img");
          rightArrowImage.style;
          rightArrowImage.width = "45";
          rightArrowButton.style.marginLeft = "0px";
          rightArrowImage.loading = "lazy";
          rightArrowImage.src =
            "https://res.cloudinary.com/wdy-bzs/image/upload/v1661106376/asset/Group_42_1.svg";
          rightArrowImage.className = "pagination-arrow right";
          rightArrowButton.append(rightArrowImage);
          rightArrowButton.setAttribute("data-page", Number(currentPage) + 10);
          rightArrowButton.addEventListener("click", handlePaginationClick);
          paginationWrapper.append(rightArrowButton);
        }
      }
      list.append(paginationWrapper);
    }
  }
async function loadFData(e, preservePage = false) {
  if (e?.key == "Enter") {
    let searchValue = document
      .getElementsByClassName("search-field w-input")[0]
      .value.trim();
    var currentUrl = new URL(window.location.href);
    searchValue == "" || searchValue == null
      ? currentUrl.searchParams.delete("search")
      : currentUrl.searchParams.set("search", searchValue);
    window.history.replaceState({}, document.title, currentUrl.href);
  }

  if (!e || e.key == "Enter") {
    var currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.get("search")) {
      document.getElementsByClassName("search-field w-input")[0].value = String(
        currentUrl.searchParams.get("search")
      );
    }
  }

  setTimeout(async () => {
    const url = window.location.href;
    const getQuery = url.split("?")[1] || "";

    try {
      let data;
      if (!preservePage) {
        currentPage = 1; // Reset to page 1 on filter changes
      }

      // Build query parameters
      const params = new URLSearchParams(getQuery);
      params.set("page", currentPage.toString());
      params.set("sort_toggle", sortRandom.toString());
      params.set("selectExcl", selectionExcluding.toString());

      const response = await fetch(
        `https://bildzeitschrift.netlify.app/.netlify/functions/loadData?${params.toString()}`,
        {
          headers: {
            Authorization: sessionStorage.getItem("auth"),
          },
        }
      );
      data = await response.json();

      if (data.count === 0) {
        handleNoResults(data);
      } else {
        let plan = await renderData(data);
        handlePlanRestrictions(plan);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }, 100);
}

function handleNoResults(data) {
  const colList = document.getElementsByClassName("w-dyn-items w-row")[0];
  colList.style.display = "none";

  const resCount = document.getElementsByClassName("results-count")[0];
  resCount.innerHTML = "";
  const span = document.createElement("span");
  span.textContent = `${data.count} Ergebnisse von `;
  const span2 = document.createElement("span");
  span2.textContent = data.totalCount;
  resCount.append(span, span2);

  const noResultsFound =
    document.getElementsByClassName("no-results-wrapper")[0];
  noResultsFound.style.display = "block";

  const pagination = document.getElementsByClassName(
    "w-pagination-wrapper pagination"
  )[0];
  pagination.style.display = "none";
}

function handlePlanRestrictions(plan) {
  if (plan == null || plan.end_date < Math.floor(Date.now() / 1000)) {
    const search = document.getElementsByClassName("search-field w-input")[0];
    search?.remove();

    const dropdowns = document.querySelectorAll(".w-dropdown-toggle");
    const single_dropdowns = document.querySelectorAll(
      ".filter-dropdown.single"
    );

    // Handle dropdowns
    for (let i = 6; i < dropdowns.length; i++) {
      const node = dropdowns[i].cloneNode(true);
      node.style.color = "rgba(43, 42, 42, 0.5)";
      dropdowns[i].parentElement.replaceChild(node, dropdowns[i]);
    }

    // Handle single dropdowns
    for (let j = 10; j < single_dropdowns.length; j++) {
      const node = single_dropdowns[j].cloneNode(true);
      node.childNodes[0].removeChild(node.childNodes[0].childNodes[1]);
      node.style.color = "rgba(43, 42, 42, 0.5)";
      single_dropdowns[j].parentElement.replaceChild(node, single_dropdowns[j]);
    }
  }
}

// Event Listeners Setup
document.addEventListener("DOMContentLoaded", async function () {
  const sortToggle = document.getElementsByClassName("random-switch")[0];
  document
    .querySelector(".results-tag_wrapper")
    .addEventListener("mouseup", () => loadFData(null, false));

  // Handle individual reset buttons
  const individualReset = document.getElementsByClassName(
    "reset-btn w-inline-block"
  );
  for (const reset of individualReset) {
    reset.addEventListener("mouseup", () => loadFData(null, false));
  }

  // Handle select all buttons
  const selectAllBtn = document.getElementsByClassName("dropdown-btn-wrapper");
  for (const btn of selectAllBtn) {
    btn.addEventListener("mouseup", () => loadFData(null, false));
  }

  // Handle single dropdowns
  const singleDropdown = document.querySelectorAll(".filter-dropdown.single");
  for (const dropdown of singleDropdown) {
    dropdown.addEventListener("mouseup", () => loadFData(null, false));
  }

  const resetAllButton = document.getElementsByClassName("reset-all-btn")[0];
  resetAllButton.addEventListener("mouseup", () => {
    // Remove all active filters without page reload
    document.querySelectorAll(".fs-cmsfilter_active").forEach((filter) => {
      filter.classList.remove("fs-cmsfilter_active");
    });
    document.querySelectorAll(".w--redirected-checked").forEach((filter) => {
      filter.classList.remove("w--redirected-checked");
    });
    // Reset URL without reload
    const currentUrl = new URL(window.location.href);
    window.history.pushState({}, "", currentUrl.origin + currentUrl.pathname);
    loadFData(null, false);
  });
  resetAllButton.href = "#";

  // Handle checkboxes
  const checkboxWrappers = document.getElementsByClassName(
    "checkbox-element-wrapper"
  );
  for (const checkbox of checkboxWrappers) {
    checkbox.addEventListener("mouseup", () => loadFData(null, false));
  }

  // Handle search
  const search = document.getElementsByClassName("search-field w-input")[0];
  search.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
      loadFData(event, false);
    }
  });

  // Handle sort toggle
  sortToggle.addEventListener("click", () => {
    sortRandom = !sortRandom;
    loadFData(null, false);
  });

  // Initial load
  await loadFData();
});

// Update pagination to work without page reload
async function updatePagination(newPage) {
  currentPage = newPage;
  await loadFData(null, true);
}


