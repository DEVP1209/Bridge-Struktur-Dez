function getC(cName) {
  const name = cName + "=";
  const cDecoded = document.cookie; //to be careful
  const cArr = cDecoded.split("; ");
  let res = "";
  cArr.forEach((val) => {
    if (val.indexOf(name) === 0) res = val.substring(name.length);
  });
  return res;
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
    const lastQuery = getC("lastQuery");
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

    const lastQuery = getC("lastQuery");

    const pageFragment = document.createDocumentFragment();
    if (currentPage != 1) {
      if (currentPage > 10) {
        const leftArrowButton = document.createElement("a");
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
        if (lastQuery != "")
          leftArrowButton.href =
            "?page=" + (currentPage - 10) + ("&" + lastQuery);
        else leftArrowButton.href = "?page=" + (currentPage - 10);
      }
      const leftArrowButton = document.createElement("a");
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
      if (lastQuery != "")
        leftArrowButton.href = "?page=" + (currentPage - 1) + ("&" + lastQuery);
      else leftArrowButton.href = "?page=" + (currentPage - 1);
    }
    if (pageCount <= 7) {
      for (i = 1; i <= pageCount; i++) {
        const pageButton = document.createElement("a");
        const pageDiv = document.createElement("div");
        pageDiv.textContent = i;
        pageButton.className = "pagination-page-button w-inline-block";

        if (lastQuery != "") pageButton.href = "?page=" + i + ("&" + lastQuery);
        else pageButton.href = "?page=" + i;

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
          const pageButton = document.createElement("a");
          const pageDiv = document.createElement("div");
          pageDiv.textContent = i;
          pageButton.className = "pagination-page-button w-inline-block";

          if (lastQuery != "") {
            pageButton.href = "?page=" + i + ("&" + lastQuery);
          } else {
            pageButton.href = "?page=" + i;
          }
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

        const lastPageButton = document.createElement("a");
        const lastPageDiv = document.createElement("div");
        lastPageDiv.textContent = pageCount;
        lastPageButton.className = "pagination-page-button w-inline-block";
        if (lastQuery != "")
          lastPageButton.href = "?page=" + pageCount + ("&" + lastQuery);
        else lastPageButton.href = "?page=" + pageCount;
        lastPageButton.append(lastPageDiv);
        pageFragment.append(lastPageButton);
        paginationWrapper.append(pageFragment);
      } else if (currentPage >= 5 && currentPage <= pageCount - 4) {
        const firstPageButton = document.createElement("a");
        const firstPageDiv = document.createElement("div");
        firstPageDiv.textContent = "1";
        firstPageButton.className = "pagination-page-button w-inline-block";
        if (lastQuery != "")
          firstPageButton.href = "?page=" + "1" + ("&" + lastQuery);
        else firstPageButton.href = "?page=" + "1";
        firstPageButton.append(firstPageDiv);
        pageFragment.append(firstPageButton);

        const pageDots = document.createElement("div");
        pageDots.textContent = "...";
        pageDots.className = "pagination-dots-button";
        pageFragment.append(pageDots);
        var j = currentPage - 1;
        for (i = 0; i < 3; i++) {
          const pageButton = document.createElement("a");
          const pageDiv = document.createElement("div");

          pageDiv.textContent = j;
          pageButton.className = "pagination-page-button w-inline-block";
          if (lastQuery != "")
            pageButton.href = "?page=" + j + ("&" + lastQuery);
          else pageButton.href = "?page=" + j;
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

        const lastPageButton = document.createElement("a");
        const lastPageDiv = document.createElement("div");
        lastPageDiv.textContent = pageCount;
        lastPageButton.className = "pagination-page-button w-inline-block";
        if (lastQuery != "")
          lastPageButton.href = "?page=" + i + ("&" + lastQuery);
        else lastPageButton.href = "?page=" + i;
        lastPageButton.append(lastPageDiv);
        pageFragment.append(lastPageButton);
        paginationWrapper.append(pageFragment);
      } else {
        const firstPageButton = document.createElement("a");
        const firstPageDiv = document.createElement("div");
        firstPageDiv.textContent = "1";
        firstPageButton.className = "pagination-page-button w-inline-block";
        if (lastQuery != "")
          firstPageButton.href = "?page=" + "1" + ("&" + lastQuery);
        else firstPageButton.href = "?page=" + "1";
        firstPageButton.append(firstPageDiv);
        pageFragment.append(firstPageButton);

        const pageDots = document.createElement("div");
        pageDots.textContent = "...";
        pageDots.className = "pagination-dots-button";
        pageFragment.append(pageDots);

        for (i = pageCount - 4; i <= pageCount; i++) {
          const pageButton = document.createElement("a");
          const pageDiv = document.createElement("div");
          pageDiv.textContent = i;
          pageButton.className = "pagination-page-button w-inline-block";
          if (lastQuery != "")
            pageButton.href = "?page=" + i + ("&" + lastQuery);
          else pageButton.href = "?page=" + i;

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

      const rightArrowButton = document.createElement("a");
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
      if (lastQuery != "")
        rightArrowButton.href =
          "?page=" + parseInt(Number(currentPage) + 1) + ("&" + lastQuery);
      else rightArrowButton.href = "?page=" + parseInt(Number(currentPage) + 1);
      paginationWrapper.append(rightArrowButton);
      if (pageCount - currentPage >= 10) {
        const rightArrowButton = document.createElement("a");
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
        if (lastQuery != "")
          rightArrowButton.href =
            "?page=" + parseInt(Number(currentPage) + 10) + ("&" + lastQuery);
        else
          rightArrowButton.href = "?page=" + parseInt(Number(currentPage) + 10);
        paginationWrapper.append(rightArrowButton);
      }
    }
    list.append(paginationWrapper);
  }
}

async function loadFData(e) {
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
      let searchValue = (document.getElementsByClassName(
        "search-field w-input"
      )[0].value = String(currentUrl.searchParams.get("search")));
    }
  }
  setTimeout(async () => {
    await (async () => {
      const url = window.location.href;
      const getQuery = url.split("?")[1];
      let queryCookie = "";

      if (getQuery) {
        if (getQuery.includes("page")) {
          const queries = getQuery.split("&");
          queryCookie = queries.slice(1).join("&");
        } else {
          queryCookie = getQuery;
        }
      }

      document.cookie = "lastQuery=" + queryCookie;

      try {
        let data;
        if (url.split("?").length > 1) {
          const randomNumber = getC("randomNumber");
          const sortToggle = getC("sort_random");
          const selection_exclude = getC("selection_exclude")
          const response = await fetch(
            `https://bildzeitschrift.netlify.app/.netlify/functions/loadData?randomNumber=${randomNumber}&sort_toggle=${sortToggle}&selectExcl=${selection_exclude}&${getQuery}`, {
            headers: {
              Authorization: sessionStorage.getItem("auth")
            }
          }
          );
          data = await response.json();
        } else {
          const sortToggle = getC("sort_random");
          const randomOrder = getC("randomOrder");
          const selection_exclude = getC("selection_exclude")
          const response = await fetch(
            `https://bildzeitschrift.netlify.app/.netlify/functions/loadData?page=1&sort_toggle=${sortToggle}&selectExcl=${selection_exclude}&randomOrder=${randomOrder}`, {
            headers: {
              Authorization: sessionStorage.getItem("auth")
            }
          }
          );
          data = await response.json();
        }

        if (data.count === 0) {
          const colList = document.getElementsByClassName("w-dyn-items w-row")[0];
          colList.style.display = "none";

          const resCount = document.getElementsByClassName("results-count")[0];
          resCount.innerHTML = "";
          const span = document.createElement("span");
          span.textContent = `${data.count} Ergebnisse von `;
          const span2 = document.createElement("span");
          span2.textContent = data.totalCount;
          resCount.append(span, span2);

          const noResultsFound = document.getElementsByClassName("no-results-wrapper")[0];
          noResultsFound.style.display = "block";

          const pagination = document.getElementsByClassName("w-pagination-wrapper pagination")[0];
          pagination.style.display = "none";
        } else {
          let plan = await renderData(data);

          if (data.currentPage > data.pageCount) {
            const button = document.getElementsByClassName("pagination-page-button w-inline-block")[0];
            button.click();
          }
          if(false){
          // if (plan == null || plan.end_date < Math.floor(Date.now() / 1000) ) {
            const search = document.getElementsByClassName("search-field w-input")[0];
            search.remove()
            const dropdowns = document.querySelectorAll(".w-dropdown-toggle")
            const single_dropdowns = document.querySelectorAll(".filter-dropdown.single")
            for (let i = 6; i < dropdowns.length; i++) {
              const node = dropdowns[i].cloneNode(true)
              node.style.color = "rgba(43, 42, 42, 0.5)";
              dropdowns[i].parentElement.replaceChild(node, dropdowns[i])
            }
            for (let j = 10; j < single_dropdowns.length; j++) {
              const node = single_dropdowns[j].cloneNode(true)
              node.childNodes[0].removeChild(node.childNodes[0].childNodes[1])
              node.style.color = "rgba(43, 42, 42, 0.5)";
              single_dropdowns[j].parentElement.replaceChild(node, single_dropdowns[j])
            }
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }

    })()
  }, 100);
}
document.addEventListener("DOMContentLoaded", async function () {
  let sort_random = "true";
  let selection_excluding = "false"
  const sortToggle = document.getElementsByClassName("random-switch")[0];
  // const selectionExclude = document.getElementsByClassName("random-switch")[1];
  document.querySelector(".results-tag_wrapper").addEventListener("mouseup", loadFData)
  const toggle = document.getElementsByClassName("toggle")[0];
  
  if (getC("sort_random") != "") {
    sort_random = getC("sort_random");
  } else {
    document.cookie = "sort_random=" + sort_random + ";";
  }

  
  // if(getC("selection_exclude")!= ""){
  //   selection_excluding = getC("selection_exclude")
  // } else {
  //   document.cookie = "selection_exclude=" +  selection_excluding + ";"
  // }


  if (sort_random == "false") {
    sortToggle.click();
  } 
  // if(selection_excluding == "true"){
  //   selectionExclude.click()
  // }

  const currentTime = new Date().getTime();
  const cookieExpire = new Date(currentTime + 600000);
  var randomNumber = Math.floor(Math.random() * (4 - 0 + 1));
  var randomOrder = Math.floor(Math.random() * (1 - 0 + 1));
  var randomOrderFinal = randomOrder == 0 ? -1 : 1;
  if (getC("randomOrder") == "" && getC("randomNumber") == "") {
    document.cookie =
      "randomOrder=" +
      randomOrderFinal +
      ";path=/;expires=" +
      cookieExpire.toUTCString();
    document.cookie =
      "randomNumber=" +
      randomNumber +
      ";path=/;expires=" +
      cookieExpire.toUTCString();
  }
  await loadFData();
  
  



  // Example async function


  const individualReset = document.getElementsByClassName(
    "reset-btn w-inline-block"
  );
  for (x of individualReset) {
    x.addEventListener("mouseup", loadFData);
  }

  const selectAllBtn = document.getElementsByClassName("dropdown-btn-wrapper");
  for (s of selectAllBtn) {
    s.addEventListener("mouseup", loadFData);
  }

  const singleDropdown = document.querySelectorAll(".filter-dropdown.single")
  for(ind of singleDropdown){
    ind.addEventListener("mouseup", loadFData)
  }
  const checkboxWrappers = document.getElementsByClassName(
    "checkbox-element-wrapper"
  );
  const resetAllButton = document.getElementsByClassName("reset-all-btn")[0];

  resetAllButton.addEventListener("mouseup", () => {
    let currentUrl = new URL(window.location.href);
    window.location.assign(currentUrl.origin + currentUrl.pathname);
  });
  resetAllButton.href = "#";


  for (q of checkboxWrappers) {
    q.addEventListener("mouseup", loadFData);
  }
  const search = document.getElementsByClassName("search-field w-input")[0];
  search.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
      loadFData(event);
    }

  });
  sortToggle.addEventListener("click", () => {
    if (sort_random == "false") {
      sort_random = "true";
    } else {
      sort_random = "false";
    }
    document.cookie = "sort_random=" + sort_random + ";";
    loadFData();
  });

  // selectionExclude.addEventListener("click", () => {
  //   if (selection_excluding == "false") {
  //     selection_excluding = "true";
  //   } else {
  //     selection_excluding = "false";
  //   }
  //   document.cookie = "selection_exclude=" + selection_excluding + ";";
  //   loadFData();
  // });

});
