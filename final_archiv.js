let sort_random = "true";
const getQuery = () => {
  // let lastQuery = window.location.href.includes("page=")
  //   ? window.location.href.split("page=")[1].substring(2)
  //   : null;
  // if (lastQuery === null) {
  //   lastQuery = window.location.href.includes("?")
  //     ? window.location.href.split("?")[1]
  //     : "";
  // }
  const url = window.location.href;
  if (url.includes("page=")) {
    // Split by `&`, remove the first element (before or including `page=xyz`)
    return url.split("&").slice(1).join("&");
  } else {
    // If `page` is not present, return everything after the `?`
    return url.split("?")[1] || "";
  }
};
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
    const colList = document.getElementsByClassName("w-dyn-items w-row")[0];
    colList ? (colList.style.display = "block") : null;
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
      collection.remove();
    }
    collection = document.createElement("div");
    collection.className = "w-dyn-items w-row";
    let collections, plan;
    if (sessionStorage.getItem("auth") != null) {
      collections = await fetch(
        "https://bildzeitschrift.netlify.app/.netlify/functions/collection",
        {
          method: "GET",
          headers: {
            Authorization: sessionStorage.getItem("auth"),
          },
        }
      );
      collections = await collections.json();
      plan = collections.subscription || null;
      collections = collections.collections;

      sessionStorage.setItem(
        "collections",
        JSON.stringify(Array.from(collections))
      );
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
      productImgWrapper.id = q.SKU;
      productImgWrapper.style.zIndex = "0";
      productImgWrapper.style.position = "relative";
      //img element creation
      var img = document.createElement("img");
      img.className = "product-img";
      img.src =
        "https://res.cloudinary.com/wdy-bzs/image/upload/q_15/v1651695832/" +
        q.Images;
      img.loading = imgCount <= 10 ? "eager" : "lazy";
      imgCount++;
      img.alt = "product-img";
      let dropdown = "",
        save = "";

      // check if logged in
      if (
        sessionStorage.getItem("auth") &&
        plan != null &&
        plan.end_date > Math.floor(Date.now() / 1000) &&
        plan.plan == "Inspiration"
      ) {
        document.querySelector(".filter-info").style.display = "none";
        dropdown = document.createElement("button");
        dropdown.className = "btn-specihern left-btn";
        dropdown.innerText = "...";
        save = document.createElement("button");
        save.className = "btn-specihern";

        save.innerText = collections.some((obj) => obj.items.includes(q.SKU))
          ? "Gespeichert"
          : "Speichern";

        dropdown.addEventListener("click", (event) => {
          event.preventDefault(); // to stop link element from redirecting

          // open dropdown
          if (
            event.target.parentElement.querySelector(".container-mode") == null
          ) {
            // if there are any other open containers remove them
            if (document.querySelector("#container-main") != null)
              document.querySelector("#container-main").remove();
            const container = document.createElement("div");
            container.id = "container-main";
            container.className = "container-mode";
            let url = new URL(event.target.parentElement.href);
            container.setAttribute(
              "dropdown-key",
              new URLSearchParams(url.search).get("productId")
            );
            const search = document.createElement("input");
            search.placeholder = "Suchen ...";
            search.className = "collection-search";

            search.addEventListener("input", (event) => {
              const it =
                event.target.parentElement.querySelectorAll(".collections");
              if (event.target.value == "") {
                for (let i = 0; i < it.length - 1; i++) {
                  it[i].style.display = "flex";
                }
              }
              for (let i = 0; i < it.length - 1; i++) {
                if (
                  !it[i].innerText
                    .toLowerCase()
                    .startsWith(event.target.value.toLowerCase())
                ) {
                  it[i].style.display = "none";
                } else if (
                  it[i].innerText
                    .toLowerCase()
                    .startsWith(event.target.value.toLowerCase()) &&
                  it[i].style.display == "none"
                ) {
                  it[i].style.display = "flex";
                }
              }
            });

            container.appendChild(search);

            if (sessionStorage.getItem("collections")) {
              let collections = JSON.parse(
                sessionStorage.getItem("collections")
              );
              for (let i = 0; i < collections.length; i++) {
                const parentDiv = document.createElement("div");
                parentDiv.className = "collections";
                const childDiv = document.createElement("div");
                childDiv.className = "collection-name";
                childDiv.style.marginLeft = "10px";
                childDiv.innerText = collections[i].name;
                const btn = document.createElement("button");
                btn.className = "collection-btn";
                btn.style.visibility = "visible";
                btn.innerText = collections[i].items.includes(
                  event.target.parentElement.href.split("?productId=")[1]
                )
                  ? "saved"
                  : "+";
                btn.addEventListener("click", (event) => {
                  event.target.parentElement.parentElement.parentElement.querySelector(
                    ".btn-specihern.left-btn"
                  ).innerText = collections[i].name;

                  // save an item to collection
                  if (event.target.innerText == "+") {
                    var arry = collections.find(
                      (obj) =>
                        obj.name ==
                        event.target.parentElement.childNodes[0].innerText
                    );

                    fetch(
                      "https://bildzeitschrift.netlify.app/.netlify/functions/collection",
                      {
                        method: "PUT",
                        headers: {
                          Authorization: sessionStorage.getItem("auth"),
                        },
                        body: JSON.stringify({
                          name: event.target.parentElement.childNodes[0]
                            .innerText,
                          update: {
                            $addToSet: {
                              items:
                                event.target.parentElement.parentElement.getAttribute(
                                  "dropdown-key"
                                ),
                            },
                            ...(!arry.hasOwnProperty("cover")
                              ? {
                                  $set: {
                                    cover:
                                      event.target.parentElement.parentElement.parentElement
                                        .querySelector(".product-img")
                                        .src.split("/v1651695832/")[1],
                                  },
                                }
                              : {}),
                          },
                        }),
                      }
                    ).then((res) => {
                      // if it was saved to database only then update the state
                      if (res.status == 200) {
                        arry = collections.find(
                          (obj) =>
                            obj.name ==
                            event.target.parentElement.childNodes[0].innerText
                        );
                        if (arry.hasOwnProperty("cover")) {
                          arry["cover"] =
                            event.target.parentElement.parentElement.parentElement
                              .querySelector(".product-img")
                              .src.split("/v1651695832/")[1];
                        }
                        arry.items.push(
                          event.target.parentElement.parentElement.getAttribute(
                            "dropdown-key"
                          )
                        );
                        event.target.innerText = "saved";
                        sessionStorage.setItem(
                          "collections",
                          JSON.stringify(collections)
                        );

                        if (
                          collections.some((obj) =>
                            obj.items.includes(
                              event.target.parentElement.parentElement.getAttribute(
                                "dropdown-key"
                              )
                            )
                          )
                        ) {
                          event.target.parentElement.parentElement.parentElement.querySelector(
                            ".btn-specihern"
                          ).innerText = "Gespeichert";
                        } else {
                          event.target.parentElement.parentElement.parentElement.querySelector(
                            ".btn-specihern"
                          ).innerText = "Speichern";
                        }
                        document
                          .querySelectorAll(".btn-specihern.left-btn")
                          .forEach((e) => {
                            e.innerText =
                              event.target.parentElement.childNodes[0].innerText;
                          });
                      }
                    });
                  }
                  // delete an item from collection
                  else {
                    fetch(
                      "https://bildzeitschrift.netlify.app/.netlify/functions/collection",
                      {
                        method: "PUT",
                        headers: {
                          Authorization: sessionStorage.getItem("auth"),
                        },
                        body: JSON.stringify({
                          name: event.target.parentElement.childNodes[0]
                            .innerText,
                          update: {
                            $pull: {
                              items:
                                event.target.parentElement.parentElement.getAttribute(
                                  "dropdown-key"
                                ),
                            },
                          },
                        }),
                      }
                    ).then((res) => {
                      // if it was deleted from database only then update the state
                      if (res.status == 200) {
                        let arry = collections.find(
                          (obj) =>
                            obj.name ==
                            event.target.parentElement.childNodes[0].innerText
                        );
                        const index = arry.items.indexOf(
                          event.target.parentElement.parentElement.getAttribute(
                            "dropdown-key"
                          )
                        );

                        if (index > -1) {
                          arry.items.splice(index, 1);
                          sessionStorage.setItem(
                            "collections",
                            JSON.stringify(collections)
                          );
                        }
                        event.target.innerText = "+";
                        if (
                          collections.some((obj) =>
                            obj.items.includes(
                              event.target.parentElement.parentElement.getAttribute(
                                "dropdown-key"
                              )
                            )
                          )
                        ) {
                          event.target.parentElement.parentElement.parentElement.querySelector(
                            ".btn-specihern"
                          ).innerText = "Gespeichert";
                        } else {
                          event.target.parentElement.parentElement.parentElement.querySelector(
                            ".btn-specihern"
                          ).innerText = "Speichern";
                        }
                      }
                    });
                  }
                });
                parentDiv.appendChild(childDiv);
                parentDiv.appendChild(btn);
                container.appendChild(parentDiv);
              }
            }

            const createCollection = document.createElement("div");
            createCollection.className = "collections";
            const btn = document.createElement("button");
            btn.innerText = "+";
            btn.className = "collection-btn";
            btn.style.visibility = "visible";

            btn.addEventListener("click", async (event) => {
              let output = await Swal.fire({
                title: "Neue Kollektion",
                input: "text",
                inputLabel: "Name",
                inputPlaceholder: "Name deiner neuen Kollektion",
                confirmButtonText: "Erstellen",
                showCloseButton: true,
                inputValidator: (value) => {
                  if (!value) {
                    return "Name cannot be empty";
                  }
                },
              });
              let collections = JSON.parse(
                sessionStorage.getItem("collections")
              );
              // check if collection already exists
              if (
                !collections.some((obj) => obj.name == output.value) &&
                output.value != undefined
              ) {
                // create new collection in database
                fetch(
                  "https://bildzeitschrift.netlify.app/.netlify/functions/collection",
                  {
                    method: "POST",
                    headers: {
                      Authorization: sessionStorage.getItem("auth"),
                    },
                    body: JSON.stringify({
                      name: output.value,
                      item: event.target.parentElement.parentElement.getAttribute(
                        "dropdown-key"
                      ),
                    }),
                  }
                ).then((res) => {
                  if (res.status == 200) {
                    const obj = {
                      name: output.value,
                      items: [],
                      cover: event.target.parentElement.parentElement
                        .getAttribute("dropdown-key")
                        .replaceAll("-", "_")
                        .replaceAll("(", "")
                        .replaceAll(")", ""),
                    };
                    obj.items.push(
                      event.target.parentElement.parentElement.getAttribute(
                        "dropdown-key"
                      )
                    );
                    document
                      .getElementById(
                        `${event.target.parentElement.parentElement.getAttribute(
                          "dropdown-key"
                        )}`
                      )
                      .querySelector(".btn-specihern").innerText = "Gerettet";
                    document
                      .querySelectorAll(".btn-specihern.left-btn")
                      .forEach((e) => {
                        e.innerText = output.value;
                      });

                    collections.push(obj);
                    sessionStorage.setItem(
                      "collections",
                      JSON.stringify(collections)
                    );
                  }
                });
              }
            });

            const label = document.createElement("div");
            label.className = "collection-name";
            label.innerText = "Kollektion erstellen";
            label.style.marginLeft = "10px";

            createCollection.appendChild(btn);
            createCollection.appendChild(label);
            container.appendChild(createCollection);

            container.addEventListener("click", (event) => {
              event.preventDefault();
            });

            event.target.insertAdjacentElement("afterend", container);
          }
          // to close dropdown
          else {
            event.target.parentElement
              .querySelector(".container-mode")
              .remove();
          }
        });

        document.addEventListener("click", (event) => {
          if (
            !event.target.closest("#container-main") &&
            document.querySelector("#container-main") != null &&
            event.target.className != "btn-specihern left-btn"
          ) {
            document.querySelector("#container-main").remove();
          }
        });

        save.addEventListener("click", (event) => {
          event.preventDefault();
        });

        productImgWrapper.addEventListener("mouseover", () => {
          dropdown.style.visibility = "visible";
          save.style.visibility = "visible";
        });

        productImgWrapper.addEventListener("mouseout", () => {
          dropdown.style.visibility = "hidden";
          save.style.visibility = "hidden";
        });
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
      if (q.Bewertung == "Special") {
        const special_img = document.createElement("img");
        special_img.src =
          "https://res.cloudinary.com/wdy-bzs/image/upload/v1661106376/asset/special_icon";
        special_img.className = "special-img";
        productImgWrapper.append(special_img);
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
      ).catch();
    }
    return plan;
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
      window.scrollTo({ top: 0, behavior: "smooth" });
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
        leftArrowImage.className = "pagination-arrow left disabled-clicks";
        leftArrowButton.style.marginRight = "0px";
        leftArrowButton.style.paddingRight = "0px";
        leftArrowButton.style.cursor = "pointer";
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
      leftArrowImage.className = "pagination-arrow left disabled-clicks";
      leftArrowButton.style.cursor = "pointer";
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
        pageDiv.className = "disabled-clicks";
        pageButton.style.cursor = "pointer";
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
          pageButton.style.cursor = "pointer";
          const pageDiv = document.createElement("div");
          pageDiv.className = "disabled-clicks";
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

        const pageDots = document.createElement("div");
        pageDots.textContent = "...";
        pageDots.className = "pagination-dots-button";
        pageDots.style.cursor = "pointer";
        pageFragment.append(pageDots);
        

        const lastPageButton = document.createElement("div");
        lastPageButton.style.cursor = "pointer";
        const lastPageDiv = document.createElement("div");
        lastPageDiv.className = "disabled-clicks";
        lastPageDiv.textContent = pageCount;
        lastPageButton.className = "pagination-page-button w-inline-block";
        lastPageButton.setAttribute("data-page", pageCount);
        lastPageButton.addEventListener("click", handlePaginationClick);

        lastPageButton.append(lastPageDiv);
        pageFragment.append(lastPageButton);
        paginationWrapper.append(pageFragment);
      } else if (currentPage >= 5 && currentPage <= pageCount - 4) {
        const firstPageButton = document.createElement("div");
        firstPageButton.style.cursor = "pointer";
        const firstPageDiv = document.createElement("div");
        firstPageDiv.className = "disabled-clicks";
        firstPageDiv.textContent = "1";
        firstPageButton.className = "pagination-page-button w-inline-block";
        firstPageButton.setAttribute("data-page", 1);
        firstPageButton.addEventListener("click", handlePaginationClick);
        firstPageButton.append(firstPageDiv);
        pageFragment.append(firstPageButton);

        const pageDots = document.createElement("div");
        pageDots.textContent = "...";
        pageDots.className = "pagination-dots-button disabled-clicks";
        pageDots.style.cursor = "pointer";
        pageFragment.append(pageDots);
        var j = currentPage - 1;
        for (i = 0; i < 3; i++) {
          const pageButton = document.createElement("div");
          pageButton.style.cursor = "pointer";
          const pageDiv = document.createElement("div");
          pageDiv.className = "disabled-clicks";
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
        midPageDots.className = "pagination-dots-button disabled-clicks";
        midPageDots.style.cursor = "pointer";
        pageFragment.append(midPageDots);

        const lastPageButton = document.createElement("div");
        const lastPageDiv = document.createElement("div");
        lastPageDiv.className = "disabled-clicks";
        lastPageDiv.textContent = pageCount;
        lastPageButton.className = "pagination-page-button w-inline-block";
        lastPageButton.setAttribute("data-page", pageCount); // Check here , maybe i
        lastPageButton.addEventListener("click", handlePaginationClick);
        lastPageButton.append(lastPageDiv);
        lastPageButton.style.cursor = "pointer";
        pageFragment.append(lastPageButton);
        paginationWrapper.append(pageFragment);
      } else {
        const firstPageButton = document.createElement("div");
        firstPageButton.style.cursor = "pointer";
        const firstPageDiv = document.createElement("div");
        firstPageDiv.className = "disabled-clicks";
        firstPageDiv.textContent = "1";
        firstPageButton.className = "pagination-page-button w-inline-block";
        firstPageButton.setAttribute("data-page", 1);
        firstPageButton.addEventListener("click", handlePaginationClick);

        firstPageButton.append(firstPageDiv);
        pageFragment.append(firstPageButton);

        const pageDots = document.createElement("div");
        pageDots.textContent = "...";
        pageDots.className = "pagination-dots-button";
        pageDots.style.cursor = "pointer";
        pageFragment.append(pageDots);

        for (i = pageCount - 4; i <= pageCount; i++) {
          const pageButton = document.createElement("div");
          pageButton.style.cursor = "pointer";  
          const pageDiv = document.createElement("div");
          pageDiv.className = "disabled-clicks";
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
      rightArrowButton.style.cursor = "pointer";
      rightArrowImage.width = "45";
      rightArrowImage.loading = "lazy";
      rightArrowImage.src =
        "https://res.cloudinary.com/wdy-bzs/image/upload/v1651849092/asset/Arrow.svg";
      rightArrowImage.className = "pagination-arrow right disabled-clicks";
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
        rightArrowButton.style.cursor = "pointer";
        rightArrowImage.width = "45";
        rightArrowButton.style.marginLeft = "0px";
        rightArrowImage.loading = "lazy";
        rightArrowImage.src =
          "https://res.cloudinary.com/wdy-bzs/image/upload/v1661106376/asset/Group_42_1.svg";
        rightArrowImage.className = "pagination-arrow right disabled-clicks";
        rightArrowButton.append(rightArrowImage);
        rightArrowButton.setAttribute("data-page", Number(currentPage) + 10);
        rightArrowButton.addEventListener("click", handlePaginationClick);
        paginationWrapper.append(rightArrowButton);
      }
    }
    list.append(paginationWrapper);
  }
}

window.loadFData = async function (e) {
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
  // if (!e || e.key == "Enter") {
  //   var currentUrl = new URL(window.location.href);
  //   if (currentUrl.searchParams.get("search")) {
  //     let searchValue = (document.getElementsByClassName(
  //       "search-field w-input"
  //     )[0].value = String(currentUrl.searchParams.get("search")));
  //   }
  // }
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
          const sortToggle = sort_random.toString();
          const selection_exclude = "";
          const response = await fetch(
            `https://bildzeitschrift.netlify.app/.netlify/functions/loadData?sort_toggle=${sortToggle}&selectExcl=${selection_exclude}&${getQuery}`,
            {
              headers: {
                Authorization: sessionStorage.getItem("auth"),
              },
            }
          );
          data = await response.json();
        } else {
          const sortToggle = sort_random.toString();
          const randomOrder = 1;
          const selection_exclude = "";
          const response = await fetch(
            `https://bildzeitschrift.netlify.app/.netlify/functions/loadData?page=1&sort_toggle=${sortToggle}&selectExcl=${selection_exclude}&randomOrder=${randomOrder}`,
            {
              headers: {
                Authorization: sessionStorage.getItem("auth"),
              },
            }
          );
          data = await response.json();
        }

        if (data.count === 0) {
          const colList =
            document.getElementsByClassName("w-dyn-items w-row")[0];
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
          if(pagination){
          pagination.style.display = "none";
          }
        } else {
          let plan = await renderData(data);

          if (data.currentPage > data.pageCount) {
            const button = document.getElementsByClassName(
              "pagination-page-button w-inline-block"
            )[0];
            button.click();
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    })();
  }, 100);
};
async function updatePagination(newPage) {
  currentPage = newPage;
  await loadFData();
}

////////// Checkbox Click logic
 function handleQueryParamChange() {
  // Get the current URL and its search parameters
  const url = new URL(window.location.href);
  let params = new URLSearchParams(url.search);
  // Remove the 'page' parameter if it exists
  params.delete("page");
  // Iterate over each parameter in the URL
  params.forEach((values, category) => {
    // Split the values by comma in case there are multiple values for a category
    const valueArray = values.split(",");
    // Iterate over the values and call toggleTag for each
    valueArray.forEach((value) => {
      toggleTag(category, value);
      
      // Add 'w--redirected-checked' class to the corresponding checkbox
      if (value.startsWith("-")) {
        const currentDiv = document.getElementById(`${category}__${value.toLowerCase().substring(1)}-minus`);
        if (currentDiv) {
          currentDiv.classList.add("w--redirected-checked");
        }
      } else {
        const currentDiv = document.getElementById(`${category}__${value.toLowerCase()}`);
        if (currentDiv) {
          currentDiv.classList.add("w--redirected-checked");
        }
      }
    });
  });
}
function updateQueryParam(category, value) {
  // Get the current URL and its search parameters
  const url = new URL(window.location.href);
  let params = new URLSearchParams(url.search);
  params.delete("page");
  // Get the existing values for the category, if any
  const existingValues = params.get(category)
    ? params.get(category).split(",")
    : [];

  if (existingValues.includes(value)) {
    // Remove the value if it already exists
    const updatedValues = existingValues.filter((v) => v !== value);
    if (updatedValues.length > 0) {
      params.set(category, updatedValues.join(","));
    } else {
      // Remove the category if no values remain
      params.delete(category);
    }
  } else {
    // Add the value if it doesn't exist
    existingValues.push(value);
    params.set(category, existingValues.join(","));
  }

  // Update the URL without reloading the page
  const newUrl = params.toString() ? `${url.pathname}?${params.toString()}` : url.pathname;
  window.history.pushState({}, "", newUrl);
}
function toggleTag(category, value) {
  // Find the result-wrapper container
  const container = document.querySelector(".results-tag_wrapper");
  if (!container) {
    console.error("Result wrapper not found");
    return;
  }

  // Check if the tag with the specific value exists
  const existingTag = Array.from(
    container.querySelectorAll('[fs-cmsfilter-element="tag-template"]')
  ).find(
    (tag) =>
      tag
        .querySelector('[fs-cmsfilter-element="tag-text"]')
        .textContent.trim() === value
  );

  if (existingTag) {
    // Remove the tag if it exists
    existingTag.remove();
  } else {
    // Create a new tag element
    const newTag = document.createElement("div");
    newTag.setAttribute("fs-cmsfilter-element", "tag-template");
    newTag.className = "tag_wrap";
    newTag.innerHTML = `
      <div fs-cmsfilter-element="tag-text">${value}</div>
      <img src="https://cdn.prod.website-files.com/6235c6aa0b614c4ab6ba68bb/661784b0cad022727b38036c_Vector.svg" loading="lazy" alt="" class="tag-remove">
    `;
    newTag.addEventListener("click", () => {
      handleToggleClick(category, value);
    });
    // Append the new tag to the container
    if(value.charAt(0) == "-"){
      newTag.setAttribute('style', 'background-color: #bf8563 !important');
    }
    container.appendChild(newTag);
  }
}
function handleToggleClick(category, value) {
  updateQueryParam(category, value);
  toggleTag(category, value);
  if(category != "search"){
  if (value.charAt(0) == "-") {
    const currentDiv = document.querySelector(`div[data-name="${value}"]`);
    currentDiv.classList.remove("w--redirected-checked");
  } else {
    const currentDiv = document.querySelector(
      `#${category}__${value.toLowerCase()}`
    );
    currentDiv.classList.remove("w--redirected-checked");
  }
}
  loadFData();
}
// Get the results wrapper element
function handleCheckboxClick(event) {
  const checkbox = event.target;
  const category = checkbox.getAttribute("id").split("__")[0];
  const value = checkbox.getAttribute("data-name");
  updateQueryParam(category, value);
  toggleTag(category, value);
  loadFData();
}
function handleCheckboxReversal(event) {
  const checkbox = event.target;
  const category = checkbox.getAttribute("id").split("__")[0];
  const value = checkbox.getAttribute("data-name");
  if (value.charAt(0) == "-") {
    let otherCheckbox = document.querySelector(`div[data-name="${value.substring(1)}"]`)
    if(otherCheckbox.classList.contains("w--redirected-checked")){
      let value2 = value.substring(1);
      updateQueryParam(category, value2);
      toggleTag(category, value2);
      otherCheckbox.classList.remove("w--redirected-checked");
  }
}
else{
  let otherCheckbox = document.querySelector(`div[data-name="-${value}"]`)
  if(otherCheckbox.classList.contains("w--redirected-checked")){
    let value2 = `-${value}`;
    updateQueryParam(category, value2);
    toggleTag(category, value2);
    otherCheckbox.classList.remove("w--redirected-checked");
  }
}
handleCheckboxClick(event);
}
function toTitleCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function createMainDropdowns(data) {
  const mainCategories = Object.keys(data["1 NEU"]);
  const form = document.getElementById("email-form"); // Get the existing form

  mainCategories.forEach((category) => {
    const categoryData = data["1 NEU"][category];
    const dropdownSection = createDropdownSection(
      toTitleCase(category),
      categoryData
    );
    // Insert before the form's closing tag
    form.insertBefore(dropdownSection, form.querySelector(".w-form-done"));
  });
}
function createDropdownSection(title, categoryData) {
  const mainWrap = document.createElement("div");
  mainWrap.className = "main-cat-wrap first";

  // Create accordion trigger
  const accordionTrigger = document.createElement("div");
  accordionTrigger.className = "main-accordion-trigger";

  const label = document.createElement("label");
  label.className = "main-cat-title";
  label.setAttribute("for", "name");
  label.textContent = title;

  const indicatorWrap = document.createElement("div");
  indicatorWrap.className = "indicator-wrap";

  const mainIndicatorTxt = document.createElement("div");
  mainIndicatorTxt.className = "main-indicator-txt";

  const mainIndicator = document.createElement("span");
  mainIndicator.className = "main-indicator";
  mainIndicator.textContent = "0";

  const plusWrapper = document.createElement("div");
  plusWrapper.className = "plus-wrapper";

  const plusLine1 = document.createElement("div");
  plusLine1.className = "plus-line _1";
  plusLine1.style.transform =
    "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(90deg) skew(0deg, 0deg)";
  plusLine1.style.transformStyle = "preserve-3d";

  const plusLine2 = document.createElement("div");
  plusLine2.className = "plus-line";

  // Create accordion content
  const accordionContent = document.createElement("div");
  accordionContent.className = "main-accordion-content";
  accordionContent.style.opacity = "0";
  accordionContent.style.display = "none";

  // Assemble the structure
  plusWrapper.appendChild(plusLine1);
  plusWrapper.appendChild(plusLine2);
  mainIndicatorTxt.appendChild(mainIndicator);
  indicatorWrap.appendChild(mainIndicatorTxt);
  indicatorWrap.appendChild(plusWrapper);
  accordionTrigger.appendChild(label);
  accordionTrigger.appendChild(indicatorWrap);
  mainWrap.appendChild(accordionTrigger);
  mainWrap.appendChild(accordionContent);

  // Process nested content using the new function
  processNestedContent(title, categoryData, accordionContent);

  // Add click handler for accordion
  accordionTrigger.addEventListener("click", () => {
    const isCollapsed = accordionContent.style.display === "none";
    let openDropdowns = document.querySelectorAll(".w--open");
    for (let i = 0; i < openDropdowns.length; i++) {
        openDropdowns[i].classList.remove("w--open");
      }
    if (isCollapsed) {
      accordionContent.style.display = "flex";
      accordionContent.offsetHeight;
      accordionContent.style.transition = "opacity 0.3s ease-in, height 0.3s ease-in";
      plusLine1.style.transform =
        "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)";
      plusLine1.style.transition = "200ms ease-in";
      accordionContent.style.opacity = "1";
    } else {
      accordionContent.style.transition = "opacity 0.3s ease-in-out, height 0.3s ease-in-out";
      accordionContent.style.opacity = "0";
      plusLine1.style.transform =
        "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(90deg) skew(0deg, 0deg)";
      plusLine1.style.transition = "200ms ease-in-out";
      setTimeout(() => {
        accordionContent.style.display = "none";
      }, 300);
    }

    plusWrapper.classList.toggle("active");
  });

  return mainWrap;
}

function processNestedContent(title, categoryData, accordionContent) {
  for (const key in categoryData) {
    // Check if the value is an object (and not an array)
    if (
      typeof categoryData[key] === "object" &&
      !Array.isArray(categoryData[key])
    ) {
      let hasNestedObject = false;

      // Check if the object has any keys that are also objects (nested)
      for (const nestedKey in categoryData[key]) {
        if (categoryData[key].hasOwnProperty(nestedKey)) {
          if (
            typeof categoryData[key][nestedKey] === "object" &&
            !Array.isArray(categoryData[key][nestedKey])
          ) {
            hasNestedObject = true;
            break; // Stop the loop as we found a nested object
          }
        }
      }
      // If it has nested object-type values (like "Gesellschaft")
      if (hasNestedObject) {
        const nestedDropdown = createDropdownStructure(
          title,
          key,
          categoryData[key]
        );
        accordionContent.appendChild(nestedDropdown);
      } else if (categoryData[key] !== null) {
        const dropdown = createDropdown(
          title,
          toTitleCase(key),
          categoryData[key].values || []
        );
        accordionContent.appendChild(dropdown);
      }
    } else {
      if (key === "values" && Array.isArray(categoryData[key])) {
        categoryData[key].forEach((item, index) => {
          const singleCheckbox = createSingleCheckboxElement(
            title,
            item,
            `single-${index}`
          );
          accordionContent.appendChild(singleCheckbox);
        });
      }
    }
  }
}
function createSingleCheckboxElement(title, value, id) {
  const wrapper = document.createElement("div");
  wrapper.className = "filter-dropdown single";
  const label = document.createElement("label");
  label.className = "w-checkbox checkbox-field single";
  const checkbox = document.createElement("div");
  checkbox.className =
    "w-checkbox-input w-checkbox-input--inputType-custom checkbox";
  checkbox.id = `${title
    .replace(/\//g, "-")
    .toLowerCase()}__${value.toLowerCase()}`;
  checkbox.setAttribute("data-name", value);
  checkbox.addEventListener("click", handleCheckboxReversal);
  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = id;
  input.name = id;
  input.setAttribute("data-name", id);
  input.style.opacity = "0";
  input.style.position = "absolute";
  input.style.zIndex = "-1";
  // Create the "minus" label
  const minusLabel = document.createElement("label");
  minusLabel.className = "w-checkbox checkbox-field is-minus";
  const minusCheckbox = document.createElement("div");
  minusCheckbox.className =
    "w-checkbox-input w-checkbox-input--inputType-custom checkbox is-minus";
  minusCheckbox.id = `${title
    .replace(/\//g, "-")
    .toLowerCase()}__${value.toLowerCase()}-minus`;
  minusCheckbox.setAttribute("data-name", `-${value}`);
  minusCheckbox.addEventListener("click", handleCheckboxReversal);
  const minusInput = document.createElement("input");
  minusInput.type = "checkbox";
  minusInput.id = `${id}-minus`;
  minusInput.name = `${id}-minus`;
  minusInput.style.opacity = "0";
  minusInput.style.position = "absolute";
  minusInput.style.zIndex = "-1";

  const minusSpan = document.createElement("span");
  minusSpan.className = "filter-element-label is-hidden w-form-label";
  minusSpan.setAttribute("for", `${id}-minus`);
  minusSpan.setAttribute(
    "fs-cmsfilter-field",
    `${title.replace(/\//g, "-").toLowerCase()}`
  );
  minusSpan.textContent = `-${value}`;

  // Append minus checkbox elements
  minusLabel.appendChild(minusCheckbox);
  minusLabel.appendChild(minusInput);
  minusLabel.appendChild(minusSpan);

  // Append minus label to the wrapper

  const span = document.createElement("span");
  span.className = "filter-element-label single w-form-label";
  span.setAttribute("for", id);
  span.setAttribute(
    "fs-cmsfilter-field",
    `${title.replace(/\//g, "-").toLowerCase()}`
  );
  span.textContent = value;

  label.appendChild(checkbox);
  label.appendChild(input);
  label.appendChild(span);
  wrapper.appendChild(label);
  wrapper.appendChild(minusLabel);
  return wrapper;
}
// Function to create individual dropdown
function createDropdown(main_title, title, values) {
  const dropdown = document.createElement("div");
  dropdown.className = "dropdown w-dropdown";

  const trigger = document.createElement("div");
  trigger.className = "filter-dropdown w-dropdown-toggle";
  trigger.setAttribute("id", `w-dropdown-toggle-${title.toLowerCase()}`);
  trigger.setAttribute(
    "aria-controls",
    `w-dropdown-list-${title.toLowerCase()}`
  );
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("role", "button");
  trigger.setAttribute("tabindex", "0");

  const titleDiv = document.createElement("div");
  titleDiv.textContent = title;

  const arrowWrap = document.createElement("div");
  arrowWrap.className = "arrow-indicator-wrap";

  const filterIndicator = document.createElement("div");
  filterIndicator.className = "filter-indicator";

  const countWrapper = document.createElement("div");
  const countSpan = document.createElement("span");
  countSpan.className = "filter-span";
  countSpan.id = title;
  countSpan.textContent = "0";

  const arrow = document.createElement("img");
  arrow.src =
    "https://cdn.prod.website-files.com/6235c6aa0b614c4ab6ba68bb/62379155dbd5b4285817ec0d_Dropdown%20Arrow.svg";
  arrow.className = "dropdown-arrow";
  arrow.setAttribute("loading", "lazy");
  arrow.setAttribute("alt", "");

  // Create dropdown list
  const dropdownList = document.createElement("nav");
  dropdownList.className = "dropdown-list w-dropdown-list";
  dropdownList.id = `w-dropdown-list-${title.toLowerCase()}`;
  dropdownList.setAttribute(
    "aria-labelledby",
    `w-dropdown-toggle-${title.toLowerCase()}`
  );

  const checkboxWrapper = document.createElement("div");
  checkboxWrapper.className = "checkbox-wrapper";

  // Add checkbox elements
  values.forEach((value, index) => {
    const checkboxElement = createCheckboxElement(
      main_title,
      title,
      value,
      `${title}-${index}`
    );
    checkboxWrapper.appendChild(checkboxElement);
  });

  // Add reset button
  const resetBtn = document.createElement("a");
  resetBtn.href = "#";
  resetBtn.className = "reset-btn w-inline-block";
  resetBtn.addEventListener("click", handleResetClick);
  resetBtn.setAttribute("tabindex", "0");
  resetBtn.textContent = "Zurücksetzen";
  checkboxWrapper.appendChild(resetBtn);

  // Assemble the dropdown
  countWrapper.appendChild(countSpan);
  filterIndicator.appendChild(countWrapper);
  arrowWrap.appendChild(filterIndicator);
  arrowWrap.appendChild(arrow);
  trigger.appendChild(titleDiv);
  trigger.appendChild(arrowWrap);
  dropdownList.appendChild(checkboxWrapper);
  dropdown.appendChild(trigger);
  dropdown.appendChild(dropdownList);

  // Add click handlers
  trigger.addEventListener("click", () => {
    const isExpanded = dropdownList.classList.contains("w--open");
    let openDropdowns = document.querySelectorAll(".w--open");
    for (let i = 0; i < openDropdowns.length; i++) {
      openDropdowns[i].classList.remove("w--open");
    }
    if (!isExpanded) {
    dropdownList.classList.add("w--open");
    }else{
      dropdownList.classList.remove("w--open");
    }
    trigger.setAttribute("aria-expanded", !isExpanded);
  });

  resetBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const checkboxes = dropdownList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    countSpan.textContent = "0";
  });

  return dropdown;
}
// Function to create checkbox elements with minus label
function createCheckboxElement(main_title, title, value, id) {
  const wrapper = document.createElement("div");
  wrapper.className = "checkbox-element-wrapper";
  // wrapper.onclick = () => {
  //   loadFData();
  // };
  // Create the regular label
  const label = document.createElement("label");
  label.className = "w-checkbox checkbox-field";

  const checkbox = document.createElement("div");
  checkbox.className =
    "w-checkbox-input w-checkbox-input--inputType-custom checkbox";
  let currentIdPrefix = (main_title == "Datum" || title == "Titelseite" || title == "Titel") ?  "" : `${main_title.toLowerCase().charAt(0)}_`
  checkbox.id = `${currentIdPrefix}${title.replace(
    /\//g,
    "-"
  ).toLowerCase()}__${value.toLowerCase()}`;
  checkbox.setAttribute("data-name", value);
  checkbox.addEventListener("click", handleCheckboxReversal);
  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = id;
  input.name = id;
  input.style.opacity = "0";
  input.style.position = "absolute";
  input.style.zIndex = "-1";

  const span = document.createElement("span");
  span.className = "filter-element-label w-form-label";
  span.setAttribute("for", id);
  span.setAttribute(
    "fs-cmsfilter-field",
    `${main_title.toLowerCase().charAt(0)}_${title.replace(/\//g, "-").toLowerCase()}`
  );
  span.textContent = value;

  // Create the "minus" label
  const minusLabel = document.createElement("label");
  minusLabel.className = "w-checkbox checkbox-field is-minus";

  const minusCheckbox = document.createElement("div");
  minusCheckbox.className =
    "w-checkbox-input w-checkbox-input--inputType-custom checkbox is-minus";
  minusCheckbox.id = `${currentIdPrefix}${title.replace(
    /\//g,
    "-"
  ).toLowerCase()}__${value.toLowerCase()}-minus`;
  minusCheckbox.setAttribute("data-name", `-${value}`);
  minusCheckbox.addEventListener("click", handleCheckboxReversal);
  const minusInput = document.createElement("input");
  minusInput.type = "checkbox";
  minusInput.id = `${id}-minus`;
  minusInput.name = `${id}-minus`;
  minusInput.style.opacity = "0";
  minusInput.style.position = "absolute";
  minusInput.style.zIndex = "-1";

  const minusSpan = document.createElement("span");
  minusSpan.className = "filter-element-label is-hidden w-form-label";
  minusSpan.setAttribute("for", `${id}-minus`);
  minusSpan.setAttribute(
    "fs-cmsfilter-field",
    `${main_title.toLowerCase().charAt(0)}_${title.replace(/\//g, "-")}`
  );
  minusSpan.textContent = `-${value}`;

  // Append regular checkbox elements
  label.appendChild(checkbox);
  label.appendChild(input);
  label.appendChild(span);

  // Append minus checkbox elements
  minusLabel.appendChild(minusCheckbox);
  minusLabel.appendChild(minusInput);
  minusLabel.appendChild(minusSpan);

  // Append both labels to the wrapper
  wrapper.appendChild(label);
  wrapper.appendChild(minusLabel);

  // Add change handler to update counter
  input.addEventListener("change", () => {
    const parentDropdown = wrapper.closest(".dropdown");
    const counter = parentDropdown.querySelector(".filter-span");
    const checkedBoxes = parentDropdown.querySelectorAll(
      'input[type="checkbox"]:checked'
    ).length;
    counter.textContent = checkedBoxes;
  });

  return wrapper;
}

function createDropdownStructure(main_title, title, data) {
  const dropdown = document.createElement("div");
  dropdown.className = "dropdown gesellschaft w-dropdown";
  dropdown.setAttribute("data-hover", "false");
  dropdown.setAttribute("data-delay", "200");

  // Create main toggle
  const toggleBtn = document.createElement("div");
  toggleBtn.className = "filter-dropdown w-dropdown-toggle";
  toggleBtn.id = "w-dropdown-toggle-12";
  toggleBtn.setAttribute("aria-controls", "w-dropdown-list-12");
  toggleBtn.setAttribute("aria-haspopup", "menu");
  toggleBtn.setAttribute("aria-expanded", "false");
  toggleBtn.setAttribute("role", "button");
  toggleBtn.setAttribute("tabindex", "0");

  toggleBtn.innerHTML = `
    <div>${toTitleCase(title)}</div>
    <div class="arrow-indicator-wrap">
      <div class="filter-indicator">
        <div><span id="t_${title.toLowerCase()}" class="filter-span">0</span></div>
      </div>
      <img src="https://cdn.prod.website-files.com/6235c6aa0b614c4ab6ba68bb/62379155dbd5b4285817ec0d_Dropdown%20Arrow.svg" loading="lazy" alt="" class="dropdown-arrow">
    </div>
  `;

  // Create main dropdown list
  const dropdownList = document.createElement("nav");
  dropdownList.className = `dropdown-list gesellschaft min-height w-dropdown-list`;
  dropdownList.id = "w-dropdown-list-12";
  dropdownList.setAttribute("aria-labelledby", "w-dropdown-toggle-12");

  toggleBtn.addEventListener("click", () => {
    const isExpanded = dropdownList.classList.contains("w--open");
    let openDropdowns = document.querySelectorAll(".w--open");
    for (let i = 0; i < openDropdowns.length; i++) {
      openDropdowns[i].classList.remove("w--open");
    }
    if(!isExpanded){
    dropdownList.classList.add("w--open");
    }else{
      dropdownList.classList.remove("w--open");
    }
    toggleBtn.setAttribute("aria-expanded", !isExpanded);
  });
  // Add nested category dropdowns
  let categoryIndex = 13;
  let currentIdPrefix = (title == "Titelseite" || title == "Titel") ?  "" : `${main_title.toLowerCase().charAt(0)}_`
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "values") {
      const categoryDiv = document.createElement("div");
      categoryDiv.className = `dropdown-gesellschaft-div`;

      const categoryName = key;
      const options = value.values;

      categoryDiv.innerHTML = `
        <div class="dropdown-wrapper-gs">
          <div class="dropdown-indicator-line"></div>
          <div data-hover="false" data-delay="200" class="dropdown inner w-dropdown">
            <div class="filter-dropdown w-dropdown-toggle" id="w-dropdown-toggle-${categoryIndex}" 
                 aria-controls="w-dropdown-list-${categoryIndex}" aria-haspopup="menu" 
                 aria-expanded="false" role="button" tabindex="0">
              <div>${categoryName}</div>
              <div class="arrow-indicator-wrap">
                <div class="filter-indicator">
                  <div><span id="${main_title
                    .charAt(0)
                    .toLowerCase()}_${title.toLowerCase()}_${categoryName
        .toLowerCase()
        .replace(/[/]/g, "-")}" class="filter-span">0</span></div>
                </div>
                <img src="https://cdn.prod.website-files.com/6235c6aa0b614c4ab6ba68bb/62379155dbd5b4285817ec0d_Dropdown%20Arrow.svg" loading="lazy" alt="" class="dropdown-arrow">
              </div>
            </div>
            <nav class="dropdown-list w-dropdown-list" id="w-dropdown-list-${categoryIndex}" 
                 aria-labelledby="w-dropdown-toggle-${categoryIndex}">
              <div class="select-all">
                ${options
                  .map(
                    (option, idx) => `
                  <div class="checkbox-element-wrapper${
                    idx === options.length - 1 ? " last" : ""
                  }">
                    <label fs-mirrorclick-element="target-3" class="w-checkbox checkbox-field">
                      <div class="w-checkbox-input w-checkbox-input--inputType-custom checkbox" data-name="${option}" id="${currentIdPrefix}${title.toLowerCase()}_${categoryName
                      .toLowerCase()
                      .replace(/[/]/g, "-")}__${option.toLowerCase()}"></div>
                      <input type="checkbox" id="checkbox-${categoryIndex}-${idx}" 
                             name="checkbox-${categoryIndex}-${idx}" 
                             data-name="Checkbox ${categoryIndex}-${idx}" 
                             style="opacity:0;position:absolute;z-index:-1">
                      <span class="filter-element-label w-form-label" 
                            for="checkbox-${categoryIndex}-${idx}" fs-cmsfilter-field="${main_title
                      .toLowerCase()
                      .charAt(0)}_${title.replace(/\//g, "-")}_${categoryName
                      .toLowerCase()
                      .replace(/[/]/g, "-")}">${option}</span>
                    </label>
                    <label fs-mirrorclick-element="trigger-50" class="w-checkbox checkbox-field is-minus">
                      <div class="w-checkbox-input w-checkbox-input--inputType-custom checkbox is-minus" data-name="-${option}" id="${currentIdPrefix}${title.toLowerCase()}_${categoryName
                      .toLowerCase()
                      .replace(
                        /[/]/g,
                        "-"
                      )}__${option.toLowerCase()}-minus"></div>
                      <input type="checkbox" id="checkbox-${categoryIndex}-${idx}-minus" 
                             name="checkbox-${categoryIndex}-${idx}-minus" 
                             data-name="Checkbox ${categoryIndex}-${idx}" 
                             style="opacity:0;position:absolute;z-index:-1">
                      <span class="filter-element-label is-hidden w-form-label" 
                            for="checkbox-${categoryIndex}-${idx}-minus" fs-cmsfilter-field="${main_title
                      .toLowerCase()
                      .charAt(0)}_${title.replace(/\//g, "-")}_${categoryName
                      .toLowerCase()
                      .replace(/[/]/g, "-")}">-${option}</span>
                    </label>
                  </div>
                `
                  )
                  .join("")}
                <div class="dropdown-btn-wrapper">
                  <a fs-mirrorclick-element="trigger-3" href="#" class="select-all-btn w-inline-block">
                    <div>Alle auswählen</div>
                  </a>
                  <a fs-cmsfilter-element="reset" href="#" class="reset-btn w-inline-block">
                    <div>Zurücksetzen</div>
                  </a>
                </div>
              </div>
            </nav>
          </div>
        </div>
      `;
      categoryDiv
        .querySelectorAll(".checkbox-element-wrapper")
        .forEach((wrapper) => {
          // wrapper.addEventListener("click", () => {
          //   loadFData();
          // });
        });

      const toggleButtons =
        categoryDiv.getElementsByClassName("w-dropdown-toggle");
      for (let toggleButton of toggleButtons) {
        const dropdownList = toggleButton.nextElementSibling;
        if (
          dropdownList &&
          dropdownList.classList.contains("w-dropdown-list")
        ) {
          toggleButton.addEventListener("click", () => {
            const isExpanded = dropdownList.classList.contains("w--open");
            let openDropdowns = document.querySelectorAll(".dropdown.inner.w-dropdown .w-dropdown-list.w--open");
            for (let i = 0; i < openDropdowns.length; i++) {
              openDropdowns[i].classList.remove("w--open");
            }
            if(!isExpanded){
            dropdownList.classList.add("w--open");
            }else{
              dropdownList.classList.remove("w--open");
            }
            toggleButton.setAttribute("aria-expanded", !isExpanded);
          });
        }
      }

      const checkboxes = categoryDiv.getElementsByClassName(
        "w-checkbox-input--inputType-custom"
      );
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener("click", handleCheckboxReversal);
      }
      const selectAllBtn = categoryDiv.getElementsByClassName("select-all-btn");
      for (let i = 0; i < selectAllBtn.length; i++) {
        selectAllBtn[i].addEventListener("click", handleSelectAllClick);
      }
      const resetBtn = categoryDiv.getElementsByClassName("reset-btn");
      for (let i = 0; i < resetBtn.length; i++) {
      resetBtn[i].addEventListener("click", handleStructuredResetClick);
      }
      dropdownList.appendChild(categoryDiv);
      categoryIndex++;
    }
  });

  // Add single value checkboxes
  if (data.values && data.values.length > 0) {
    data.values.forEach((value, index) => {
      const valueDiv = document.createElement("div");
      valueDiv.className =
        "dropdown-gesellschaft-div complex-dropdown-single-checkbox";

      valueDiv.innerHTML = `
        <div class="dropdown-wrapper-gs ${
          index === data.values.length - 1 ? " last" : ""
        }">
          <div class="dropdown-indicator-line"></div>
          ${
            index === data.values.length - 1
              ? '<div class="dropdown-indicator-line _2"></div>'
              : ""
          }
          <div class="filter-dropdown single complex-width ${
            index === data.values.length - 1 ? " last" : ""
          }" >
            
            <label class="w-checkbox checkbox-field single">
              <div class="w-checkbox-input w-checkbox-input--inputType-custom checkbox" data-name="${value}" id="${title.toLowerCase()}__${value.toLowerCase()}"></div>
              <input type="checkbox" id="checkbox-single-${index}" 
                     name="checkbox-single-${index}" 
                     data-name="Checkbox Single ${index}" 
                     style="opacity:0;position:absolute;z-index:-1">
              <span class="filter-element-label single w-form-label" 
                    for="checkbox-single-${index}" fs-cmsfilter-field="${title.toLowerCase()}">${value}</span>
            </label>
          <label class="w-checkbox checkbox-field is-minus">
            <div class="w-checkbox-input w-checkbox-input--inputType-custom checkbox is-minus" data-name="-${value}" id="${title.toLowerCase()}__${value.toLowerCase()}__${value.toLowerCase()}-minus"></div>
            <input type="checkbox" id="checkbox-single-${index}-minus" name="checkbox-single-${index}-minus" style="opacity:0;position:absolute;z-index:-1">
            <span class="filter-element-label is-hidden w-form-label" for="checkbox-single-${index}-minus" fs-cmsfilter-field="${title.toLowerCase()}">-${value}</span>
          </label>
          </div>
        </div>
      `;
      const closestDropdown = valueDiv.closest(".filter-dropdown.single");
      if (closestDropdown) {
        // closestDropdown.onclick = () => {
        //   loadFData();
        // };
      }
      const checkboxes = valueDiv.getElementsByClassName(
        "w-checkbox-input--inputType-custom"
      );
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener("click", handleCheckboxReversal);
      }
      dropdownList.appendChild(valueDiv);
    });
  }

  dropdown.appendChild(toggleBtn);
  dropdown.appendChild(dropdownList);

  return dropdown;
}
function handleSelectAllClick(event) {
  event.preventDefault();

  // Find the parent .select-all of the clicked select all button
  const selectAllWrapper = event.target.closest(".select-all");

  if (selectAllWrapper) {
    // Find all divs with class 'w-checkbox-input--inputType-custom'
    const customCheckboxDivs = selectAllWrapper.querySelectorAll(
      ".w-checkbox-input--inputType-custom:not(.is-minus):not(.w--redirected-checked)"
    );

    customCheckboxDivs.forEach((div) => {
      // Trigger a click event on the div itself
      div.click(); // This assumes the div has an event listener for 'click'
    });
  }
  loadFData();
}
function handleResetAllClick(event) {
  event.preventDefault();
  const selectedCheckboxes = document.querySelectorAll( '.w--redirected-checked' );
  selectedCheckboxes.forEach((checkbox) => {
    checkbox.classList.remove("w--redirected-checked");
  });
  document.querySelector(".results-tag_wrapper").innerHTML = "";
  const url = new URL(window.location.href);
  url.search = "";
  window.history.pushState({}, "", url.href);
  document.getElementsByClassName("search-field w-input")[0].value = "";
  loadFData();
}
function handleStructuredResetClick(event) {
      event.preventDefault();

      // Get the parent container of this "Reset" button
      const parentContainer = event.target.closest(".select-all");
      if(!parentContainer) return;
      // Get all checked checkboxes within this parent container
      const checkedCheckboxes = parentContainer.querySelectorAll(
        '.checkbox-element-wrapper .w-checkbox-input.w--redirected-checked'
      );

      // Simulate a click on each of those checkboxes to uncheck them
      checkedCheckboxes.forEach((checkbox) => {
        checkbox.click(); // This triggers the checkbox's event listener
      });
      loadFData();
}
function handleResetClick(event) {
  event.preventDefault();
  // Find the parent .checkbox-wrapper of the clicked reset button
  const checkboxWrapper = event.target.closest(".checkbox-wrapper");
  if (checkboxWrapper) {
    // Find all elements with the class "w--redirected-checked" within this specific checkbox-wrapper
    const checkedDivs = checkboxWrapper.querySelectorAll(
      ".w--redirected-checked"
    );

    checkedDivs.forEach((div) => {
      // Trigger a click event on the div itself
      div.click(); // This assumes the div has an event listener for 'click'
    });
  }
  loadFData();
}

async function fetchFilters() {
  try {
    const response = await fetch(
      "https://bildzeitschrift.netlify.app/.netlify/functions/filters"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    createMainDropdowns(data);
    return;
  } catch (error) {
    console.error("Failed to fetch filters:", error);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  await fetchFilters();
  handleQueryParamChange();
  await loadFData();
  //Reset All Button Handling
  const resetAllButton = document.getElementsByClassName("reset-all-btn")[0];
  resetAllButton.removeAttribute("href");
  resetAllButton.addEventListener("mouseup", handleResetAllClick);
  resetAllButton.href = "#";
   // Filter-label Handling
  const filterLabels = document.getElementsByClassName("filter-element-label");
  for (let i = 0; i < filterLabels.length; i++) {
    filterLabels[i].addEventListener("click", (event) => {
      const label = event.target.closest('.w-checkbox');
      if (label) {
        const checkbox = label.querySelector('.w-checkbox-input--inputType-custom');
        if (checkbox) {
          checkbox.click();
        }
      }
    });
  }
  //Search Input Hnalding
  const search = document.getElementsByClassName("search-field w-input")[0];
  search.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
      category = "search"
      value = search.value;
      updateQueryParam(category, value);
      toggleTag(category, value);
      search.value = "";
      loadFData();
    }
  });
  //Random Switch Logicc
  sort_random = "true";
  const sortToggle = document.getElementsByClassName("random-switch")[0];
  sortToggle.addEventListener("click", () => {
    if (sort_random == "false") {
      sort_random = "true";
      if (sortToggle.classList.contains("is--off")) {
        sortToggle.classList.remove("is--off");
        sortToggle.classList.add("is--on");
      }
    } else {
      sort_random = "false";
      if (sortToggle.classList.contains("is--on")) {
        sortToggle.classList.remove("is--on");
        sortToggle.classList.add("is--off");
      }
    }
    loadFData();
  });
});
