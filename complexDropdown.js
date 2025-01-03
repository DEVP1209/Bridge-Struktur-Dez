function createComplexDropdown(div_name, data) {
    // Create the main dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = `dropdown ${div_name} w-dropdown`;
    dropdownContainer.setAttribute('data-hover', 'false');
    dropdownContainer.setAttribute('data-delay', '200');

    // Create the main dropdown toggle
    const mainToggle = document.createElement('div');
    mainToggle.className = 'filter-dropdown w-dropdown-toggle';
    mainToggle.id = 'w-dropdown-toggle-12';
    mainToggle.setAttribute('aria-controls', 'w-dropdown-list-12');
    mainToggle.setAttribute('aria-haspopup', 'menu');
    mainToggle.setAttribute('aria-expanded', 'false');
    mainToggle.setAttribute('role', 'button');
    mainToggle.setAttribute('tabindex', '0');

    // Add title and counter to toggle
    mainToggle.innerHTML = `
        <div>Gesellschaft</div>
        <div class="arrow-indicator-wrap">
            <div class="filter-indicator">
                <div><span id="t_${div_name}" class="filter-span">0</span></div>
            </div>
            <img src="https://cdn.prod.website-files.com/6235c6aa0b614c4ab6ba68bb/62379155dbd5b4285817ec0d_Dropdown%20Arrow.svg" loading="lazy" alt="" class="dropdown-arrow">
        </div>
    `;

    // Create main dropdown list
    const mainList = document.createElement('nav');
    mainList.className = `dropdown-list ${div_name} min-height w-dropdown-list`;
    mainList.id = 'w-dropdown-list-12';
    mainList.setAttribute('aria-labelledby', 'w-dropdown-toggle-12');

    // Process nested categories
    Object.entries(data).forEach(([key, value], index) => {
        if (key === 'values') {
            // Handle top-level values
            value.forEach(item => {
                const singleCheckbox = complexSingleCheckbox(item);
                mainList.appendChild(singleCheckbox);
            });
        } else {
            // Handle nested categories
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'dropdown-${div_name}-div';

            const nestedDropdown = complexNestedDropdown(key, value);
            categoryDiv.appendChild(nestedDropdown);
            mainList.appendChild(categoryDiv);
        }
    });

    // Append all elements
    dropdownContainer.appendChild(mainToggle);
    dropdownContainer.appendChild(mainList);

    return dropdownContainer;
}

function complexNestedDropdown(title, data) {
    const wrapper = document.createElement('div');
    wrapper.className = 'dropdown-wrapper-gs';

    wrapper.innerHTML = `
        <div class="dropdown-indicator-line"></div>
        <div data-hover="false" data-delay="200" class="dropdown inner w-dropdown">
            <div class="filter-dropdown w-dropdown-toggle">
                <div>${formatTitle(title)}</div>
                <div class="arrow-indicator-wrap">
                    <div class="filter-indicator">
                        <div><span id="t_gesellschaft_${title.toLowerCase()}" class="filter-span">0</span></div>
                    </div>
                    <img src="https://cdn.prod.website-files.com/6235c6aa0b614c4ab6ba68bb/62379155dbd5b4285817ec0d_Dropdown%20Arrow.svg" loading="lazy" alt="" class="dropdown-arrow">
                </div>
            </div>
            <nav class="dropdown-list w-dropdown-list">
                <div class="select-all">
                    ${complexCheckboxes(data.values)}
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
    `;

    return wrapper;
}

function complexCheckboxes(items) {
    return items.map((item, index) => `
        <div class="checkbox-element-wrapper${index === items.length - 1 ? ' last' : ''}">
            <label fs-mirrorclick-element="target-3" class="w-checkbox checkbox-field">
                <div class="w-checkbox-input w-checkbox-input--inputType-custom checkbox"></div>
                <input type="checkbox" id="checkbox-${index}" name="checkbox-${index}" 
                    data-name="Checkbox ${index}" style="opacity:0;position:absolute;z-index:-1">
                <span class="filter-element-label w-form-label" for="checkbox-${index}">${item}</span>
            </label>
        </div>
    `).join('');
}

function complexSingleCheckbox(item) {
    const wrapper = document.createElement('div');
    wrapper.className = 'dropdown-wrapper-gs last';
    
    wrapper.innerHTML = `
        <div class="dropdown-indicator-line"></div>
        <div class="filter-dropdown single last">
            <label class="w-checkbox checkbox-field single">
                <div class="w-checkbox-input w-checkbox-input--inputType-custom checkbox"></div>
                <input type="checkbox" id="checkbox-${item}" name="checkbox-${item}" 
                    data-name="Checkbox ${item}" style="opacity:0;position:absolute;z-index:-1">
                <span class="filter-element-label single w-form-label" for="checkbox-${item}">${item}</span>
            </label>
        </div>
    `;

    return wrapper;
}

function formatTitle(title) {
    return title.replace('/', ' & ').replace(/-/g, ' & ');
}