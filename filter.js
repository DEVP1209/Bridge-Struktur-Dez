function createMainDropdowns(data) {
    const mainCategories = Object.keys(data['1 NEU']);
    const form = document.getElementById('email-form'); // Get the existing form

    mainCategories.forEach(category => {
        const categoryData = data['1 NEU'][category];
        const dropdownSection = createDropdownSection(category, categoryData);
        // Insert before the form's closing tag
        form.insertBefore(dropdownSection, form.querySelector('.w-form-done'));
    });
}
function createDropdownSection(title, categoryData) {
    const mainWrap = document.createElement('div');
    mainWrap.className = 'main-cat-wrap first';

    // Create accordion trigger
    const accordionTrigger = document.createElement('div');
    accordionTrigger.className = 'main-accordion-trigger';
    
    const label = document.createElement('label');
    label.className = 'main-cat-title';
    label.setAttribute('for', 'name');
    label.textContent = title;

    const indicatorWrap = document.createElement('div');
    indicatorWrap.className = 'indicator-wrap';
    
    const mainIndicatorTxt = document.createElement('div');
    mainIndicatorTxt.className = 'main-indicator-txt';
    
    const mainIndicator = document.createElement('span');
    mainIndicator.className = 'main-indicator';
    mainIndicator.textContent = '0';

    const plusWrapper = document.createElement('div');
    plusWrapper.className = 'plus-wrapper';
    
    const plusLine1 = document.createElement('div');
    plusLine1.className = 'plus-line _1';
    plusLine1.style.transform = 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(90deg) skew(0deg, 0deg)';
    plusLine1.style.transformStyle = 'preserve-3d';
    
    const plusLine2 = document.createElement('div');
    plusLine2.className = 'plus-line';

    // Create accordion content
    const accordionContent = document.createElement('div');
    accordionContent.className = 'main-accordion-content';
    accordionContent.style.opacity = '0';
    accordionContent.style.display = 'none';

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
    accordionTrigger.addEventListener('click', () => {
        const isCollapsed = accordionContent.style.display === 'none';
        
        if (isCollapsed) {
            accordionContent.style.display = 'flex';
            accordionContent.offsetHeight;
            plusLine1.style.transform = 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)';
            plusLine1.style.transition = '300ms ease-in';
            accordionContent.style.opacity = '1';
            
        } else {
            accordionContent.style.opacity = '0';
            plusLine1.style.transform = 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(90deg) skew(0deg, 0deg)';
            plusLine1.style.transition = '300ms ease-in-out';
            setTimeout(() => {
                accordionContent.style.display = 'none';
            }, 300);
        }
        
        plusWrapper.classList.toggle('active');
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
        const nestedDropdown = createDropdownStructure(title, key, categoryData[key]);
        accordionContent.appendChild(nestedDropdown);
      } else if (categoryData[key] !== null) {
        const dropdown = createDropdown(title, key, categoryData[key].values || []);
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
    const wrapper = document.createElement('div');
    wrapper.className = 'filter-dropdown single';

    const label = document.createElement('label');
    label.className = 'w-checkbox checkbox-field single';

    const checkbox = document.createElement('div');
    checkbox.className = 'w-checkbox-input w-checkbox-input--inputType-custom checkbox';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.name = id;
    input.setAttribute('data-name', id);
    input.style.opacity = '0';
    input.style.position = 'absolute';
    input.style.zIndex = '-1';
    // Create the "minus" label
    const minusLabel = document.createElement('label');
    minusLabel.className = 'w-checkbox checkbox-field is-minus';

    const minusCheckbox = document.createElement('div');
    minusCheckbox.className = 'w-checkbox-input w-checkbox-input--inputType-custom checkbox is-minus';

    const minusInput = document.createElement('input');
    minusInput.type = 'checkbox';
    minusInput.id = `${id}-minus`;
    minusInput.name = `${id}-minus`;
    minusInput.style.opacity = '0';
    minusInput.style.position = 'absolute';
    minusInput.style.zIndex = '-1';

    const minusSpan = document.createElement('span');
    minusSpan.className = 'filter-element-label is-hidden w-form-label';
    minusSpan.setAttribute('for', `${id}-minus`);
    minusSpan.setAttribute("fs-cmsfilter-field", `${title.replace(/\//g, '-').toLowerCase()}`);
    minusSpan.textContent = `-${value}`;

    // Append minus checkbox elements
    minusLabel.appendChild(minusCheckbox);
    minusLabel.appendChild(minusInput);
    minusLabel.appendChild(minusSpan);

    // Append minus label to the wrapper
    
    const span = document.createElement('span');
    span.className = 'filter-element-label single w-form-label';
    span.setAttribute('for', id);
    span.setAttribute('fs-cmsfilter-field', `${title.replace(/\//g, '-').toLowerCase()}`);
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
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown w-dropdown';

    const trigger = document.createElement('div');
    trigger.className = 'filter-dropdown w-dropdown-toggle';
    trigger.setAttribute('id', `w-dropdown-toggle-${title.toLowerCase()}`);
    trigger.setAttribute('aria-controls', `w-dropdown-list-${title.toLowerCase()}`);
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');

    const titleDiv = document.createElement('div');
    titleDiv.textContent = title;

    const arrowWrap = document.createElement('div');
    arrowWrap.className = 'arrow-indicator-wrap';

    const filterIndicator = document.createElement('div');
    filterIndicator.className = 'filter-indicator';
    
    const countWrapper = document.createElement('div');
    const countSpan = document.createElement('span');
    countSpan.className = 'filter-span';
    countSpan.id = title;
    countSpan.textContent = '0';

    const arrow = document.createElement('img');
    arrow.src = 'https://cdn.prod.website-files.com/6235c6aa0b614c4ab6ba68bb/62379155dbd5b4285817ec0d_Dropdown%20Arrow.svg';
    arrow.className = 'dropdown-arrow';
    arrow.setAttribute('loading', 'lazy');
    arrow.setAttribute('alt', '');

    // Create dropdown list
    const dropdownList = document.createElement('nav');
    dropdownList.className = 'dropdown-list w-dropdown-list';
    dropdownList.id = `w-dropdown-list-${title.toLowerCase()}`;
    dropdownList.setAttribute('aria-labelledby', `w-dropdown-toggle-${title.toLowerCase()}`);

    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'checkbox-wrapper';

    // Add checkbox elements
    values.forEach((value, index) => {
        const checkboxElement = createCheckboxElement(main_title, title, value, `${title}-${index}`);
        checkboxWrapper.appendChild(checkboxElement);
    });

    // Add reset button
    const resetBtn = document.createElement('a');
    resetBtn.href = '#';
    resetBtn.className = 'reset-btn w-inline-block';
    resetBtn.setAttribute('tabindex', '0');
    resetBtn.textContent = 'Zurücksetzen';
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
    trigger.addEventListener('click', () => {
        const isExpanded = dropdownList.classList.contains('w--open');
        dropdownList.classList.toggle('w--open');
        trigger.setAttribute('aria-expanded', !isExpanded);
    });

    resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const checkboxes = dropdownList.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        countSpan.textContent = '0';
    });

    return dropdown;
}
// Function to create checkbox elements with minus label
function createCheckboxElement(main_title, title, value, id) {
    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-element-wrapper';

    // Create the regular label
    const label = document.createElement('label');
    label.className = 'w-checkbox checkbox-field';

    const checkbox = document.createElement('div');
    checkbox.className = 'w-checkbox-input w-checkbox-input--inputType-custom checkbox';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.name = id;
    input.style.opacity = '0';
    input.style.position = 'absolute';
    input.style.zIndex = '-1';

    const span = document.createElement('span');
    span.className = 'filter-element-label w-form-label';
    span.setAttribute('for', id);
    span.setAttribute("fs-cmsfilter-field", `${main_title.toLowerCase().charAt(0)}_${title.replace(/\//g, '-')}`);
    span.textContent = value;

    // Create the "minus" label
    const minusLabel = document.createElement('label');
    minusLabel.className = 'w-checkbox checkbox-field is-minus';

    const minusCheckbox = document.createElement('div');
    minusCheckbox.className = 'w-checkbox-input w-checkbox-input--inputType-custom checkbox is-minus';

    const minusInput = document.createElement('input');
    minusInput.type = 'checkbox';
    minusInput.id = `${id}-minus`;
    minusInput.name = `${id}-minus`;
    minusInput.style.opacity = '0';
    minusInput.style.position = 'absolute';
    minusInput.style.zIndex = '-1';

    const minusSpan = document.createElement('span');
    minusSpan.className = 'filter-element-label is-hidden w-form-label';
    minusSpan.setAttribute('for', `${id}-minus`);
    minusSpan.setAttribute("fs-cmsfilter-field", `${main_title.toLowerCase().charAt(0)}_${title.replace(/\//g, '-')}`);
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
    input.addEventListener('change', () => {
        const parentDropdown = wrapper.closest('.dropdown');
        const counter = parentDropdown.querySelector('.filter-span');
        const checkedBoxes = parentDropdown.querySelectorAll('input[type="checkbox"]:checked').length;
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
      <div>${title}</div>
      <div class="arrow-indicator-wrap">
        <div class="filter-indicator">
          <div><span id="t_${title.toLowerCase()}" class="filter-span">0</span></div>
        </div>
        <img src="https://cdn.prod.website-files.com/6235c6aa0b614c4ab6ba68bb/62379155dbd5b4285817ec0d_Dropdown%20Arrow.svg" loading="lazy" alt="" class="dropdown-arrow">
      </div>
    `;

  // Create main dropdown list
  const dropdownList = document.createElement("nav");
  dropdownList.className =
    `dropdown-list ${title.toLowerCase()} min-height w-dropdown-list`;
  dropdownList.id = "w-dropdown-list-12";
  dropdownList.setAttribute("aria-labelledby", "w-dropdown-toggle-12");

  // Add nested category dropdowns
  let categoryIndex = 13;
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "values") {
      const categoryDiv = document.createElement("div");
      categoryDiv.className = `dropdown-${title.toLowerCase()}-div`;

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
                    <div><span id="t_gesellschaft_${categoryName
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
                        <div class="w-checkbox-input w-checkbox-input--inputType-custom checkbox"></div>
                        <input type="checkbox" id="checkbox-${categoryIndex}-${idx}" 
                               name="checkbox-${categoryIndex}-${idx}" 
                               data-name="Checkbox ${categoryIndex}-${idx}" 
                               style="opacity:0;position:absolute;z-index:-1">
                        <span class="filter-element-label w-form-label" 
                              for="checkbox-${categoryIndex}-${idx}" fs-cmsfilter-field="${main_title.toLowerCase().charAt(0)}_${title.replace(/\//g, '-')}_${categoryName.toLowerCase().replace(/[/]/g, "-")}">${option}</span>
                      </label>
                      <label fs-mirrorclick-element="trigger-50" class="w-checkbox checkbox-field is-minus">
                        <div class="w-checkbox-input w-checkbox-input--inputType-custom checkbox is-minus"></div>
                        <input type="checkbox" id="checkbox-${categoryIndex}-${idx}-minus" 
                               name="checkbox-${categoryIndex}-${idx}-minus" 
                               data-name="Checkbox ${categoryIndex}-${idx}" 
                               style="opacity:0;position:absolute;z-index:-1">
                        <span class="filter-element-label is-hidden w-form-label" 
                              for="checkbox-${categoryIndex}-${idx}-minus" fs-cmsfilter-field="${main_title.toLowerCase().charAt(0)}_${title.replace(/\//g, '-')}_${categoryName.toLowerCase().replace(/[/]/g, "-")}">-${option}</span>
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
            ${index === data.values.length - 1 ? "<div class=\"dropdown-indicator-line _2\"></div>" : ""}
            <div class="filter-dropdown single complex-width ${
                      index === data.values.length - 1 ? " last" : ""
                    }">
              <label class="w-checkbox checkbox-field single">
                <div class="w-checkbox-input w-checkbox-input--inputType-custom checkbox"></div>
                <input type="checkbox" id="checkbox-single-${index}" 
                       name="checkbox-single-${index}" 
                       data-name="Checkbox Single ${index}" 
                       style="opacity:0;position:absolute;z-index:-1">
                <span class="filter-element-label single w-form-label" 
                      for="checkbox-single-${index}" fs-cmsfilter-field="${title.toLowerCase()}">${value}</span>
              </label>
            <label class="w-checkbox checkbox-field is-minus">
              <div class="w-checkbox-input w-checkbox-input--inputType-custom checkbox is-minus"></div>
              <input type="checkbox" id="checkbox-single-${index}-minus" name="checkbox-single-${index}-minus" style="opacity:0;position:absolute;z-index:-1">
              <span class="filter-element-label is-hidden w-form-label" for="checkbox-single-${index}-minus" fs-cmsfilter-field="${title.toLowerCase()}">-${value}</span>
            </label>
            </div>
          </div>
        `;

      dropdownList.appendChild(valueDiv);
    });
  }

  dropdown.appendChild(toggleBtn);
  dropdown.appendChild(dropdownList);

  return dropdown;
}
async function fetchFilters() {
    try {
        const response = await fetch('https://bildzeitschrift.netlify.app/.netlify/functions/filters');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        createMainDropdowns(data);
        return;
    } catch (error) {
        console.error('Failed to fetch filters:', error);
    }
}

// Initialize dropdowns
document.addEventListener('DOMContentLoaded', () => {
  fetchFilters();

});
