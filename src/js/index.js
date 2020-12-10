(function($) {
    $.fn.customselect = function(options) {

        const objOptions = $.extend({}, $.fn.customselect.defaults, options);

        const customSelect = {
            constants: {
                added: 'customselect-added'
            },
            utils: {
                tryParseBool: (strBool) => {
                    let bool;
                    if (typeof strBool === 'boolean') {
                        return strBool;
                    }
                    bool = (function() {
                        switch (false) {
                            case strBool.toLowerCase() !== 'true':
                                return true;
                            case strBool.toLowerCase() !== 'false':
                                return false;
                        }
                    })();
                    if (typeof bool === 'boolean') {
                        return bool;
                    }
                    return void 0;
                },
                getCustomSelectID: (intLength) => {
                    let result = '';
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    const charactersLength = characters.length;
                    for (let i = 0; i < intLength; i++) {
                        result += characters.charAt(Math.floor(Math.random() * charactersLength));
                    }
                    return result;
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
                        dropdown: customSelect.utils.tryParseBool(objDataOptions.dropdown)
                    };
                    if (objDataOptions.style === 'list') {
                        returnObj.list = 'ul';
                        returnObj.item = 'li';
                    }
                    return returnObj;
                },
                getObserverSelector: (objDataOptions, domSelector = null, domSelect = null) => {
                    let parentNodeToWatch = null;
                    if (objDataOptions.parentNode !== null) {
                        parentNodeToWatch = document.querySelector(objDataOptions.parentNode);
                    } else if (domSelector !== null) {
                        parentNodeToWatch = domSelector;
                    } else {
                        parentNodeToWatch = domSelect.parentNode;
                    }
                    return parentNodeToWatch;

                },
                trigger: (strTriggerEvent, domElements) => {
                    const event = new Event(strTriggerEvent);
                    if (domElements instanceof NodeList) {
                        domElements.forEach((domElm) => {
                            domElm.dispatchEvent(event);
                        });
                    } else {
                        domElements.dispatchEvent(event);
                    }

                }
            },
            init: (arrDomSelectors) => {
                Array.from(arrDomSelectors).forEach((domSelector) => {
                    customSelect.buildDomList(domSelector, true);
                });
            },
            dropdown: {
                bindEvents: (domCheckboxList) => {
                    const domCheckBoxListDropDown = document.getElementById(domCheckboxList.id);

                    domCheckBoxListDropDown.addEventListener('click', (event) => {
                        const domDropdown = event.target.closest('.customselect-dropdown');
                        customSelect.dropdown.closeAll(domDropdown);
                        customSelect.dropdown.toggle(domDropdown);

                    });

                    document.addEventListener('click', (event) => {
                        const hasDropDownParent = event.target.closest('.customselect-dropdown') !== null;
                        if (hasDropDownParent === false) {
                            customSelect.dropdown.closeAll();
                        }
                    });


                },
                closeAll: (currentDomDropdown) => {
                    const documentDropdowns = document.querySelectorAll('.customselect-dropdown');
                    Array.from(documentDropdowns).filter(d => d !== currentDomDropdown).forEach((domDropdown) => {
                        domDropdown.classList.remove('open');
                    });
                },
                toggle: function(domDropdown) {
                    if (domDropdown.className.indexOf('open') > -1) {
                        domDropdown.classList.remove('open');
                    } else {
                        domDropdown.classList.add('open');
                    }
                }
            },
            bindObserver: (domSelector) => {
                const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        let newNodes = mutation.addedNodes;
                        if (newNodes !== null) {
                            newNodes.forEach((newNode) => {
                                if (newNode.nodeType === 1) {
                                    let appendedElementsMatchedSelector = newNode.querySelector('select');
                                    if (newNode.matches('select')) {
                                        appendedElementsMatchedSelector = newNode;
                                    }
                                    if (appendedElementsMatchedSelector !== null && appendedElementsMatchedSelector.length > 0) {
                                        if (appendedElementsMatchedSelector.className.indexOf(customSelect.constants.added) === -1) {
                                            customSelect.buildDomList(domSelector, false);
                                        }
                                    }
                                }
                            });
                        }
                    });
                });
                const config = {
                    childList: true,
                    attributes: false,
                    subtree: true,
                    characterData: false
                };
                if (domSelector.nodeType === 1) {
                    observer.observe(domSelector, config);
                }

            },
            bindEventLink: (domCheckboxOptionInput, domOptions, customSelectStyle, objDataOptions) => {

                domCheckboxOptionInput.addEventListener('change', (event) => {
                    domOptions.find(o => o.value === event.target.value).selected = event.target.checked;

                    if (customSelect.utils.tryParseBool(customSelectStyle.dropdown) === true) {
                        const domDropdown = domCheckboxOptionInput.closest('.customselect-dropdown');
                        let selectedOptions = domOptions.filter(o => o.selected === true);
                        let selectedTextNode = domDropdown.querySelector('.customselect-dropdown-text');

                        if (selectedOptions.length === 0) {
                            selectedTextNode.innerText = objDataOptions.emptyText;
                        } else {
                            let selectedOptionsText = selectedOptions.map(o => o.textContent).filter(v => v).join(objDataOptions.selectedDelimiter);
                            if (selectedOptions.length > objDataOptions.selectedLimit && selectedOptions.length < domOptions.length) {
                                selectedOptionsText = selectedOptions.length + ' ' + objDataOptions.selectedText;
                            } else if (selectedOptions.length === domOptions.length) {
                                selectedOptionsText = objDataOptions.allSelectedText;
                            }
                            selectedTextNode.innerText = selectedOptionsText;
                        }
                        if (customSelectStyle.type === 'select-one') {
                            domDropdown.classList.remove('open');
                        }

                    }
                });
            },
            bindByElement: (domSelect, boolInit = false, domSelector = null) => {
                if (domSelect.className.indexOf(customSelect.constants.added) > -1) {
                    return false;
                }

                const customSelectID = customSelect.utils.getCustomSelectID(20);
                const dataOptions = domSelect.dataset;
                let objDataOptions = Object.assign({}, objOptions);
                objDataOptions = Object.assign(objDataOptions, dataOptions);

                const customSelectStyle = customSelect.utils.getSelectStyle(domSelect.type, objDataOptions);
                const domOptions = Array.from(domSelect.options);
                const selectedOptions = domOptions.filter(o => o.selected);

                domSelect.dataset.customselectDataId = customSelectID;

                if (objDataOptions.targetTypes.indexOf(customSelectStyle.type) === -1) {
                    console.warn(customSelectStyle.type + ' is not a valid selector for customselect');
                    return false;
                }

                if (selectedOptions.length === 0 && customSelectStyle.type === 'select-one') {
                    domOptions[0].selected = true;
                }

                let domCheckboxList = customSelect.utils.createElement(customSelectStyle.list, 'customselect-list ' + objDataOptions.classList);

                domCheckboxList.id = customSelectID;
                domCheckboxList.dataset.placeholder = objDataOptions.emptyText;
                domCheckboxList.dataset.type = customSelectStyle.type;
                if (customSelect.utils.tryParseBool(customSelectStyle.dropdown) === true) {
                    domCheckboxList.classList.add('customselect-dropdown');
                    let domSelectedOption = customSelect.utils.createElement(customSelectStyle.item, 'customselect-list-item customselect-dropdown-text');
                    domCheckboxList.appendChild(domSelectedOption);
                }

                domOptions.forEach((domOption) => {
                    const buildedOption = customSelect.buildDomOption(domOption, customSelectID, customSelectStyle, objDataOptions);
                    domCheckboxList.appendChild(buildedOption.domInputGroup);
                    customSelect.bindEventLink(buildedOption.domCheckboxOptionInput, domOptions, customSelectStyle, objDataOptions);

                });

                customSelect.addToDom(domSelect, domCheckboxList, objDataOptions);

                if (boolInit === true && customSelect.utils.tryParseBool(objDataOptions.observe) === true) {
                    let parentNodeToWatch = customSelect.utils.getObserverSelector(objOptions, domSelector, domSelect);
                    customSelect.bindObserver(parentNodeToWatch);
                }

            },
            bindByParent: (domSelector, boolInit) => {
                const domAllSelects = Array.from(domSelector.querySelectorAll('select'));
                const domSelects = domAllSelects.filter(s => objOptions.targetTypes.indexOf(s.type) > -1);

                if (domSelects.length === 0) {
                    if (boolInit === true && customSelect.utils.tryParseBool(objOptions.observe) === true) {
                        let parentNodeToWatch = customSelect.utils.getObserverSelector(objOptions, domSelector);
                        customSelect.bindObserver(parentNodeToWatch);
                    }
                    return false;
                }
                domSelects.forEach((domSelect) => {
                    customSelect.bindByElement(domSelect, true, domSelector);

                });
            },
            buildDomList: (domSelector, boolInit) => {
                if (objOptions.targetTypes.indexOf(domSelector.type) === -1) {
                    customSelect.bindByParent(domSelector, boolInit);
                } else {
                    customSelect.bindByElement(domSelector, boolInit);
                }
            },
            buildDomOption: (domOption, customSelectID, customSelectStyle, objDataOptions) => {
                let domCheckboxOptionInput = customSelect.utils.createElement('input', 'customselect-list-input');
                let strCustomSelectName = '';
                const strId = customSelect.utils.getCustomSelectID(20);
                domCheckboxOptionInput.type = customSelectStyle.type === 'select-one' ? 'radio' : 'checkbox';
                domCheckboxOptionInput.value = domOption.value;
                domCheckboxOptionInput.id = strId;
                domCheckboxOptionInput.checked = domOption.selected;

                if (customSelectStyle.type === 'select-one') {
                    strCustomSelectName = customSelectID;
                    domCheckboxOptionInput.name = strCustomSelectName;
                }

                let domCheckboxOptionLabel = customSelect.utils.createElement('label', 'customselect-list-label');
                domCheckboxOptionLabel.innerText = domOption.text;
                domCheckboxOptionLabel.htmlFor = strId;

                const domInputGroup = customSelect.positionLabel(objDataOptions.labelPosition, domCheckboxOptionInput, domCheckboxOptionLabel, customSelectStyle);
                return {
                    domCheckboxOptionInput: domCheckboxOptionInput,
                    domInputGroup: domInputGroup
                };

            },
            positionLabel: (strLabelPosition, domCheckboxOptionInput, domCheckboxOptionLabel, customSelectStyle) => {
                const domInputWrapElement = customSelect.utils.createElement(customSelectStyle.item, 'customselect-list-input-item');

                if (strLabelPosition === 'before') {
                    domInputWrapElement.appendChild(domCheckboxOptionLabel);
                    domInputWrapElement.appendChild(domCheckboxOptionInput);
                } else if (strLabelPosition === 'after') {
                    domInputWrapElement.appendChild(domCheckboxOptionInput);
                    domInputWrapElement.appendChild(domCheckboxOptionLabel);
                } else {
                    domCheckboxOptionLabel.appendChild(domCheckboxOptionInput);
                    domInputWrapElement.appendChild(domCheckboxOptionLabel);
                }
                return domInputWrapElement;
            },
            addToDom: (domSelect, domCheckboxList, objDataOptions) => {
                const domParent = domSelect.parentNode;
                let domCheckboxWrapper = customSelect.utils.createElement('div', 'customselect-list-container');
                domSelect.classList.add(customSelect.constants.added);
                domSelect.setAttribute('style', 'display:none !important');
                domCheckboxWrapper.appendChild(domSelect);
                domCheckboxWrapper.appendChild(domCheckboxList);
                domParent.appendChild(domCheckboxWrapper);
                customSelect.triggerInitialState(domCheckboxWrapper);

                if (customSelect.utils.tryParseBool(objDataOptions.dropdown) === true) {
                    customSelect.dropdown.bindEvents(domCheckboxList);
                }

                domSelect.onchange = (event) => {
                    const refId = event.target.dataset.customselectDataId;
                    const customSelectList = document.getElementById(refId);
                    const selectedValues = Array.from(event.target.options).filter(option => option.selected === true);
                    let customSelectAllInput = Array.from(customSelectList.querySelectorAll('input'));

                    customSelectAllInput.forEach(function(domInput) {
                        if (selectedValues.find(o => o.value === domInput.value)) {
                            domInput.checked = true;
                        } else {
                            domInput.checked = false;
                        }
                    });
                    customSelect.triggerInitialState(customSelectList);
                }
            },
            triggerInitialState: (domCheckboxWrapper) => {
                const preCheckedElements = domCheckboxWrapper.querySelectorAll('input');
                if (preCheckedElements.length > 0) {
                    customSelect.utils.trigger('change', preCheckedElements);
                }
            }
        };
        customSelect.init(this);
    };

    $.fn.customselect.defaults = {
        labelPosition: 'after',
        style: 'list',
        dropdown: false,
        classList: '',
        targetTypes: ['select-multiple', 'select-one'],
        parentNode: null,
        observe: true,
        selectedLimit: 3,
        selectedDelimiter: ' | ',
        emptyText: 'Nothing selected',
        selectedText: 'selected',
        allSelectedText: 'All selected'
    };
}(jQuery));