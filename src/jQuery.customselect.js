(function($) {
    $.fn.customselect = function(options) {
        const jSelector = this;
        const objOptions = $.extend({
            labelPosition: 'after',
            style: 'list',
            classList: '',
            selectors: ['select-multiple', 'select-one'],
            observe: true,
            dropdownEmptyText: 'Nothing selected',
            dropdownSelectedText: 'selected',
            dropdownAllSelectedText: 'All selected'
        }, options);

        const customSelect = {
            _instances: [],
            settings: {
                added: 'custom-select-added',
                dropdown: {
                    selectedLimit: 5
                }
            },
            utils: {
                getCustomSelectID: (intLength) => {
                    let result = '';
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    const charactersLength = characters.length;
                    for (var i = 0; i < intLength; i++) {
                        result += characters.charAt(Math.floor(Math.random() * charactersLength));
                    }
                    return 'customselect' + result;
                },
                createElement: (strType, strClassName = '') => {
                    let domElement = document.createElement(strType);
                    domElement.className = strClassName;
                    return domElement;
                },
                getSelectStyle: (customSelectType, objDataOptions) => {
                    let returnObj = {
                        list: 'div',
                        item: 'div',
                        type: customSelectType,
                        dropdown: false
                    };
                    if (objDataOptions.style === 'list' || objDataOptions.style === 'dropdown') {
                        returnObj.list = 'ul';
                        returnObj.item = 'li';
                    }
                    if (objDataOptions.style === 'dropdown') {
                        returnObj.dropdown = true;
                    }
                    return returnObj;
                },
                delegate: (event, selector, fnCallback) => {
                    document.addEventListener(event, function(e) {
                        for (var target = e.target; target && target !== this; target = target.parentNode) {
                            if (target.matches(selector)) {
                                fnCallback.call(target, e);
                                break;
                            }
                        }
                    }, false);
                },
                getSelectOptions: (dataId) => {
                    return customSelect._instances.find(i => i.id === dataId);
                }
            },
            init: () => {
                jSelector.each((index, domParent) => {
                    customSelect.build(domParent, true);
                });
            },
            bindDropdown: (domCheckboxList) => {
                const domCheckBoxListDropDown = document.getElementById(domCheckboxList.id);

                domCheckBoxListDropDown.addEventListener('click', (event) => {
                    const domDropdown = event.target.closest('.customselect-dropdown');
                    customSelect.closeAllDropdowns();
                    customSelect.toggleDropdown(domDropdown);
                });

                document.addEventListener('click', (event) => {
                    const hasDropDownParent = event.target.closest('.customselect-dropdown') !== null;
                    if (hasDropDownParent === false) {
                        customSelect.closeAllDropdowns();
                    }
                });
            },
            closeAllDropdowns: () => {
                const documentDropdowns = document.querySelectorAll('.customselect-dropdown');
                documentDropdowns.forEach((domDropdown) => {
                    domDropdown.classList.remove('open');
                });
            },
            toggleDropdown: (domDropdown) => {
                if (domDropdown.className.indexOf('open') > -1) {
                    domDropdown.classList.remove('open');
                } else {
                    domDropdown.classList.add('open');
                }
            },
            bindListener: (domParent) => {
                const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        let newNodes = mutation.addedNodes;
                        if (newNodes !== null) {
                            newNodes.forEach((newNode) => {
                                let appendedElementsMatchedSelector = newNode.querySelector('select');
                                if (newNode.matches('select')) {
                                    appendedElementsMatchedSelector = newNode;
                                }
                                if (appendedElementsMatchedSelector !== null && appendedElementsMatchedSelector.length > 0) {
                                    if (appendedElementsMatchedSelector.className.indexOf(customSelect.settings.added) === -1) {
                                        customSelect.build(domParent, false);
                                    }
                                }

                            });
                        }
                    });
                });
                const config = {
                    childList: true,
                    attributes: false,
                    subtree: false,
                    characterData: false
                };
                const targetNode = domParent;
                observer.observe(targetNode, config);
            },
            bindEventLink: (domCheckboxOptionInput, domOptions, customSelectStyle, objDataOptions) => {
                domCheckboxOptionInput.addEventListener('change', (event) => {
                    domOptions.find(o => o.value === event.target.value).selected = event.target.checked;

                    if (customSelectStyle.dropdown === true) {
                        const domDropdown = domCheckboxOptionInput.closest('.customselect-dropdown');
                        let selectedOptions = domOptions.filter(o => o.selected === true);
                        let selectedTextNode = domDropdown.querySelector('.customselect-dropdown-text');

                        if (selectedOptions.length === 0) {
                            selectedTextNode.innerText = objDataOptions.dropdownEmptyText;
                        } else {
                            let selectedOptionsText = selectedOptions.map(o => o.textContent).filter(v => v).join(', ');
                            if (selectedOptions.length > customSelect.settings.dropdown.selectedLimit && selectedOptions.length < domOptions.length) {
                                selectedOptionsText = selectedOptions.length + ' ' + objDataOptions.dropdownSelectedText;
                            } else if (selectedOptions.length === domOptions.length) {
                                selectedOptionsText = objDataOptions.dropdownAllSelectedText;
                            }
                            selectedTextNode.innerText = selectedOptionsText;
                        }
                        if (customSelectStyle.type === 'select-one') {
                            domDropdown.classList.remove('open');
                        }

                    }
                });
            },
            build: (domParent, boolInit) => {
                const domAllSelects = Array.from(domParent.querySelectorAll('select'));
                const domSelects = domAllSelects.filter(s => objOptions.selectors.indexOf(s.type) > -1);

                if (domSelects === null) {
                    return false;
                }

                domSelects.forEach((domSelect) => {

                    const dataOptions = domSelect.dataset;
                    const customSelectID = customSelect.utils.getCustomSelectID(20);

                    let objDataOptions = Object.assign({}, objOptions);
                    objDataOptions = Object.assign(objDataOptions, dataOptions);

                    domSelect.dataset.customselectDataId = customSelectID;
                    customSelect._instances.push({ id: customSelectID, select: domSelect, options: objDataOptions });

                    const customSelectStyle = customSelect.utils.getSelectStyle(domSelect.type, objDataOptions);
                    let customSelectName = '';

                    if (objDataOptions.selectors.indexOf(customSelectStyle.type) === -1) {
                        console.error(customSelectStyle.type + ' is not a valid selector for customselect');
                        return false;
                    }

                    if (domSelect.className.indexOf(customSelect.settings.added) > -1) {
                        return false;
                    }

                    if (customSelectStyle.type === 'select-one') {
                        customSelectName = customSelectID;
                    }

                    const domOptions = Array.from(domSelect.options);
                    const selectedOptions = domOptions.filter(o => o.selected);

                    if (selectedOptions.length === 0 && customSelectStyle.type === 'select-one') {
                        domOptions[0].selected = true;
                    }

                    let domCheckboxList = customSelect.utils.createElement(customSelectStyle.list, 'customselect-list ' + objDataOptions.classList);

                    domCheckboxList.id = customSelectID;

                    if (customSelectStyle.dropdown === true) {
                        domCheckboxList.classList.add('customselect-dropdown');
                        let domSelectedOption = customSelect.utils.createElement(customSelectStyle.item, 'customselect-list-item customselect-dropdown-text');
                        domCheckboxList.appendChild(domSelectedOption);
                    }

                    domOptions.forEach((domOption) => {
                        let domCheckboxOptionInput = customSelect.utils.createElement('input', 'customselect-list-input');
                        const id = customSelect.utils.getCustomSelectID(20);
                        domCheckboxOptionInput.type = customSelectStyle.type === 'select-one' ? 'radio' : 'checkbox';
                        domCheckboxOptionInput.value = domOption.value;
                        domCheckboxOptionInput.id = id;
                        domCheckboxOptionInput.checked = domOption.selected;

                        if (customSelectStyle.type === 'select-one') {
                            domCheckboxOptionInput.name = customSelectName;
                        }

                        let domCheckboxOptionLabel = customSelect.utils.createElement('label', 'customselect-list-label');
                        domCheckboxOptionLabel.innerText = domOption.text;
                        domCheckboxOptionLabel.htmlFor = id;

                        let domInputWrap = customSelect.utils.createElement(customSelectStyle.item, 'customselect-list-input-item');



                        if (objDataOptions.labelPosition === 'wrap') {
                            domCheckboxOptionLabel.appendChild(domCheckboxOptionInput);
                            domInputWrap.appendChild(domCheckboxOptionLabel);
                        } else if (objDataOptions.labelPosition === 'before') {
                            domInputWrap.appendChild(domCheckboxOptionLabel);
                            domInputWrap.appendChild(domCheckboxOptionInput);
                        } else if (objDataOptions.labelPosition === 'after') {
                            domInputWrap.appendChild(domCheckboxOptionInput);
                            domInputWrap.appendChild(domCheckboxOptionLabel);
                        }
                        domCheckboxList.appendChild(domInputWrap);

                        customSelect.bindEventLink(domCheckboxOptionInput, domOptions, customSelectStyle, objDataOptions);

                    });

                    customSelect.addToDom(domSelect, domCheckboxList, objDataOptions);
                });

                if (boolInit === true && objOptions.observe === true) {
                    customSelect.bindListener(domParent);
                }

            },
            addToDom: (domSelect, domCheckboxList, objDataOptions) => {
                const domParent = domSelect.parentNode;
                let domCheckboxWrapper = customSelect.utils.createElement('div', 'customselect-list-container');
                domSelect.classList.add(customSelect.settings.added);
                domSelect.setAttribute('style', 'display:none !important');
                domCheckboxWrapper.appendChild(domSelect);
                domCheckboxWrapper.appendChild(domCheckboxList);
                domParent.appendChild(domCheckboxWrapper);
                customSelect.triggerInitialState(domCheckboxWrapper);

                if (objDataOptions.style === 'dropdown') {
                    customSelect.bindDropdown(domCheckboxList);
                }
            },
            triggerInitialState: (domCheckboxWrapper) => {
                const preCheckedElements = domCheckboxWrapper.querySelectorAll('input');
                if (preCheckedElements.length > 0) {
                    const changeEvent = new Event('change');
                    preCheckedElements.forEach((domInput) => {
                        domInput.dispatchEvent(changeEvent);
                    });

                }
            }
        };
        customSelect.init();
    };
}(jQuery));