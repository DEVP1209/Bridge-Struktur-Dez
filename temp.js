// State management instead of cookies
let sortRandom = true;
let selectionExcluding = false;
let currentPage = 1;

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
