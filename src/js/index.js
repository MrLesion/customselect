/*! https://github.com/MrLesion/customselect v1.1.0 by @MrLesion */

(function($) {
    $.fn.customselect = function(options) {
        let objOptions = {};

        const customSelect = {
            _events: {},
            constants: {
                added: 'customselect-added'
            },
            utils: {
                parseBool: (strBool) => {
                    let bool;
                    if (typeof strBool === 'boolean') {
                        return strBool;
                    }
                    bool = (() => {
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
                getSelectStyle: (strSelectType, objDataOptions) => {
                    let returnObj = {
                        list: 'div',
                        item: 'div',
                        type: strSelectType
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
                createCustomEvents: (strEventTypes) => {
                    let arrEventTypes = strEventTypes.split(' ');

                    arrEventTypes.forEach((strEventType) => {
                        const event = new Event(strEventType);
                        customSelect._events[strEventType] = event;
                    });

                },
                triggerCustomEvent: (domTarget, strEventType) => {
                    const event = customSelect._events[strEventType];
                    if (event) {
                        domTarget.dispatchEvent(event);
                    }

                },
                triggerEvent: (domTargets, strTriggerEvent) => {
                    const event = new Event(strTriggerEvent);
                    if (domTargets instanceof NodeList) {
                        domTargets.forEach((domTarget) => {
                            domTarget.dispatchEvent(event);
                        });
                    } else {
                        domTargets.dispatchEvent(event);
                    }

                }
            },
            init: (arrDomSelectors) => {
                Array.from(arrDomSelectors).forEach((domSelector) => {
                    customSelect.buildDomList(domSelector, true);
                });
                customSelect.utils.createCustomEvents('dropdown.open dropdown.close list.builded observer.addedNodes');
            },
            dropdown: {
                bindEvents: (domCheckboxList) => {
                    const domCheckBoxListDropDown = document.getElementById(domCheckboxList.id);

                    domCheckBoxListDropDown.addEventListener('click', (event) => {
                        if (event.target.className.indexOf('customselect-search-input') > -1) {
                            return false;
                        }
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

                    domCheckBoxListDropDown.addEventListener('dropdown.close', (event) => {
                        const searchItem = event.target.querySelector('.customselect-search-item');
                        if (searchItem !== null) {
                            let domSearchInput = searchItem.querySelector('.customselect-search-input');
                            domSearchInput.value = '';
                            customSelect.utils.triggerEvent(domSearchInput, 'input');
                        }
                    });


                },
                closeAll: (domCurrentDropdown) => {
                    const domAllDropdowns = document.querySelectorAll('.customselect-dropdown');
                    Array.from(domAllDropdowns).filter(d => d !== domCurrentDropdown).forEach((domDropdown) => {
                        customSelect.utils.triggerCustomEvent(domDropdown, 'dropdown.close');
                        domDropdown.classList.remove('open');
                    });
                },
                toggle: function(domDropdown) {
                    if (domDropdown.className.indexOf('open') > -1) {
                        domDropdown.classList.remove('open');
                        customSelect.utils.triggerCustomEvent(domDropdown, 'dropdown.close');
                    } else {
                        domDropdown.classList.add('open');
                        customSelect.utils.triggerCustomEvent(domDropdown, 'dropdown.open');
                    }
                }
            },
            observer: {
                config: {
                    childList: true,
                    attributes: false,
                    subtree: true,
                    characterData: false
                },
                bind: (domSelector) => {
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            customSelect.observer.callback(mutation, domSelector);
                        });
                    });
                    if (domSelector.nodeType === 1) {
                        observer.observe(domSelector, customSelect.observer.config);
                    }
                },
                callback: (mutation, domSelector) => {
                    if (mutation.addedNodes !== null) {
                        mutation.addedNodes.forEach((newNode) => {
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
                                customSelect.utils.triggerCustomEvent(domSelector, 'observer.addedNodes');
                            }
                        });
                    }
                }
            },
            search: {
                build: (objSelectStyle, objDataOptions) => {
                    let domSearchOption = customSelect.utils.createElement(objSelectStyle.item, 'customselect-list-input-item customselect-search-item');
                    let domSearchInput = customSelect.utils.createElement('input', 'customselect-search-input');
                    domSearchInput.type = 'search';
                    domSearchInput.placeholder = objDataOptions.searchText;
                    domSearchOption.appendChild(domSearchInput);
                    return domSearchOption;
                },
                bindEvents: (domCheckboxList) => {
                    const domSearchInput = domCheckboxList.querySelector('.customselect-search-input');
                    domSearchInput.addEventListener('input', (event) => {
                        const strQuery = event.target.value.toLowerCase();
                        customSelect.search.query(strQuery, domCheckboxList);
                    });
                },
                query: (strQuery, domCheckboxList) => {
                    let items = Array.from(domCheckboxList.querySelectorAll('.customselect-list-input-item'));
                    if (strQuery.length > 0) {
                        domCheckboxList.classList.add('searching');
                        items.forEach(item => {
                            const input = item.querySelector('.customselect-list-input');
                            const label = item.querySelector('.customselect-list-label');
                            if (input !== null && label !== null) {
                                if (input.value.toLowerCase().indexOf(strQuery) > -1 || label.innerText.toLowerCase().indexOf(strQuery) > -1) {
                                    item.classList.add('match');
                                } else {
                                    item.classList.remove('match');
                                }
                            }


                        });
                    } else {
                        domCheckboxList.classList.remove('searching');
                        items.forEach(item => {
                            item.classList.remove('match');
                        })
                    }
                }
            },
            reset: {
                build: (objSelectStyle, objDataOptions) => {
                    let domSearchInput = customSelect.utils.createElement('input', 'customselect-reset-input');
                    const strCustomSelectID = customSelect.utils.getCustomSelectID(20);
                    domSearchInput.type = 'checkbox';
                    domSearchInput.id = strCustomSelectID;

                    let domResetLabel = customSelect.utils.createElement('label', 'customselect-list-label');
                    domResetLabel.innerText = objDataOptions.resetText;
                    domResetLabel.htmlFor = strCustomSelectID;

                    let domInputGroup = customSelect.buildLabel(objDataOptions.labelPosition, domSearchInput, domResetLabel, objSelectStyle);
                    domInputGroup.classList.add('customselect-reset-item');
                    return domInputGroup;
                },
                bindEvents: (domCheckboxList, objDataOptions) => {
                    let resetOption = domCheckboxList.querySelector('.customselect-reset-input');
                    let allOptions = Array.from(domCheckboxList.querySelectorAll('.customselect-list-input'));
                    let hasDefault = allOptions.filter(o => o.checked).length > 0;

                    if (hasDefault === false) {
                        resetOption.checked = true;
                        console.log(allOptions.length);
                        if (allOptions.length === 0) {
                            let selectedTextNode = domCheckboxList.querySelector('.customselect-dropdown-text');
                            selectedTextNode.innerText = objDataOptions.emptyText;
                        }

                    }
                    if (resetOption !== null) {
                        resetOption.addEventListener('click', (event) => {
                            event.target.checked = true;
                            allOptions.forEach(function(domInput) {
                                domInput.checked = false;
                                customSelect.utils.triggerEvent(domInput, 'change');
                            });
                        });
                    }

                }
            },
            bindSelect: (domSelect, domCheckboxList) => {
                domSelect.onchange = (event) => {
                    const selectedOptions = Array.from(event.target.options).filter(o => o.selected);
                    Array.from(domCheckboxList.querySelectorAll('.customselect-list-input:checked')).forEach((domInput) => {
                        domInput.checked = false;
                    });
                    selectedOptions.forEach((selectedOption) => {
                        let domCustomInput = domCheckboxList.querySelector('.customselect-list-input[value="' + selectedOption.value + '"]');
                        domCustomInput.checked = true;
                        customSelect.utils.triggerEvent(domCustomInput, 'change');
                    });
                };
            },
            bindInput: ( domCheckboxOptionInput, domOptions, objSelectStyle, objDataOptions ) => {
                domCheckboxOptionInput.addEventListener( 'change', ( event ) => {
                    let domSelectOption = domOptions.filter( o => o.value === event.target.value )[0];
                    domSelectOption.selected = event.target.checked;
                    if (customSelect.utils.parseBool(objDataOptions.dropdown) === true) {
                        const domDropdown = domCheckboxOptionInput.closest('.customselect-dropdown');
                        let selectedOptions = domOptions.filter(o => o.selected === true);
                        let selectedTextNode = domDropdown.querySelector('.customselect-dropdown-text');
                        if (selectedOptions.length === 0) {

                            if (customSelect.utils.parseBool(objDataOptions.reset) === true) {
                                selectedTextNode.innerText = objDataOptions.resetText;
                            } else {
                                selectedTextNode.innerText = objDataOptions.emptyText;
                            }

                        } else {
                            let selectedOptionsText = selectedOptions.map(o => o.textContent).filter(v => v).join(objDataOptions.selectedDelimiter);
                            if (selectedOptions.length > objDataOptions.selectedLimit && selectedOptions.length < domOptions.length) {
                                selectedOptionsText = selectedOptions.length + ' ' + objDataOptions.selectedText;
                            } else if (selectedOptions.length === domOptions.length) {
                                selectedOptionsText = objDataOptions.allSelectedText;
                            }
                            selectedTextNode.innerText = selectedOptionsText;

                        }
                        if (objSelectStyle.type === 'select-one') {
                            domDropdown.classList.remove('open');
                        }
                    }
                    if (customSelect.utils.parseBool(objDataOptions.reset) === true) {
                        const domList = domCheckboxOptionInput.closest('.customselect-list');
                        const allOptions = Array.from(domList.querySelectorAll('.customselect-list-input'));
                        let resetOption = domList.querySelector('.customselect-reset-input');
                        resetOption.checked = allOptions.filter(o => o.checked).length === 0;
                    }
                    if ( typeof objDataOptions.onChange === 'function' ) {
                        objDataOptions.onChange( event.target, domSelectOption.closest( 'select' ) );
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

                const objSelectStyle = customSelect.utils.getSelectStyle(domSelect.type, objDataOptions);
                const domOptions = Array.from(domSelect.children);
                const selectedOptions = domOptions.filter(o => o.selected);

                domSelect.dataset.customselectDataId = customSelectID;

                if (objDataOptions.targetTypes.indexOf(objSelectStyle.type) === -1) {
                    console.warn(objSelectStyle.type + ' is not a valid selector for customselect');
                    return false;
                }

                if (selectedOptions.length === 0 && objSelectStyle.type === 'select-one') {
                    domOptions[0].selected = true;
                }

                let domCheckboxList = customSelect.utils.createElement(objSelectStyle.list, 'customselect-list ' + objDataOptions.classList);

                domCheckboxList.id = customSelectID;
                domCheckboxList.dataset.placeholder = objDataOptions.emptyText;
                domCheckboxList.dataset.type = objSelectStyle.type;
                if ( customSelect.utils.parseBool( objDataOptions.dropdown ) === true ) {
                    domCheckboxList.classList.add( 'customselect-dropdown' );
                    let domSelectedOption = customSelect.utils.createElement( objSelectStyle.item, 'customselect-list-input-item customselect-dropdown-text' );
                    domCheckboxList.appendChild( domSelectedOption );

                }

                if (customSelect.utils.parseBool(objDataOptions.search) === true) {
                    domCheckboxList.classList.add('customselect-search');
                    const domSearchListInput = customSelect.search.build(objSelectStyle, objDataOptions);
                    domCheckboxList.appendChild(domSearchListInput);
                }

                if (customSelect.utils.parseBool(objDataOptions.reset) === true) {
                    const domResetListInput = customSelect.reset.build(objSelectStyle, objDataOptions);
                    domCheckboxList.appendChild(domResetListInput);
                }

                domOptions.forEach((domOption) => {
                    if (domOption.nodeName === 'OPTGROUP') {
                        const domOptgroup = customSelect.buildDomOptGroup(domOption, customSelectID, objSelectStyle, objDataOptions);
                        domCheckboxList.appendChild(domOptgroup);

                    } else if (domOption.nodeName === 'OPTION') {
                        const buildedOption = customSelect.buildDomOption(domOption, customSelectID, objSelectStyle, objDataOptions);
                        domCheckboxList.appendChild(buildedOption.domInputGroup);
                        customSelect.bindInput(buildedOption.domCheckboxOptionInput, domOptions, objSelectStyle, objDataOptions);
                    }

                });

                customSelect.addToDom(domSelect, domCheckboxList, objDataOptions);

                if (boolInit === true && customSelect.utils.parseBool(objDataOptions.observe) === true) {
                    let parentNodeToWatch = customSelect.utils.getObserverSelector(objOptions, domSelector, domSelect);
                    customSelect.observer.bind(parentNodeToWatch);
                }

            },
            bindByParent: (domSelector, boolInit) => {
                const domAllSelects = Array.from(domSelector.querySelectorAll('select'));
                const domSelects = domAllSelects.filter(s => objOptions.targetTypes.indexOf(s.type) > -1);

                if (domSelects.length === 0) {
                    if (boolInit === true && customSelect.utils.parseBool(objOptions.observe) === true) {
                        let parentNodeToWatch = customSelect.utils.getObserverSelector(objOptions, domSelector);
                        customSelect.observer.bind(parentNodeToWatch);
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
            buildDomOptGroup: (domOption, customSelectID, objSelectStyle, objDataOptions) => {
                let nestedList = customSelect.utils.createElement(objSelectStyle.list, 'customselect-optgroup');
                let nestedListLabel = customSelect.utils.createElement(objSelectStyle.item, 'customselect-optgroup-label');
                nestedListLabel.innerText = domOption.label;
                nestedList.appendChild(nestedListLabel);
                const optGroupOptions = Array.from(domOption.children);

                optGroupOptions.forEach((domNestedOption) => {
                    const buildedOption = customSelect.buildDomOption(domNestedOption, customSelectID, objSelectStyle, objDataOptions);
                    nestedList.appendChild(buildedOption.domInputGroup);
                    customSelect.bindInput(buildedOption.domCheckboxOptionInput, optGroupOptions, objSelectStyle, objDataOptions);
                });
                return nestedList;
            },
            buildDomOption: (domOption, customSelectID, objSelectStyle, objDataOptions) => {
                let domCheckboxOptionInput = customSelect.utils.createElement('input', 'customselect-list-input');
                let strCustomSelectName = '';
                const strId = customSelect.utils.getCustomSelectID(20);
                domCheckboxOptionInput.type = objSelectStyle.type === 'select-one' ? 'radio' : 'checkbox';
                domCheckboxOptionInput.value = domOption.value;
                domCheckboxOptionInput.id = strId;
                domCheckboxOptionInput.checked = domOption.selected;

                if (objSelectStyle.type === 'select-one') {
                    strCustomSelectName = customSelectID;
                    domCheckboxOptionInput.name = strCustomSelectName;
                }

                let domCheckboxOptionLabel = customSelect.utils.createElement('label', 'customselect-list-label');
                domCheckboxOptionLabel.innerText = domOption.text;
                domCheckboxOptionLabel.htmlFor = strId;

                let domInputGroup = customSelect.buildLabel(objDataOptions.labelPosition, domCheckboxOptionInput, domCheckboxOptionLabel, objSelectStyle);

                if (domOption.disabled) {
                    domOption.classList.add('disabled');
                }
                if (domOption.classList.length > 0) {
                    domOption.classList.forEach((className) => {
                        domInputGroup.classList.add(className);
                    });
                }

                return {
                    domCheckboxOptionInput: domCheckboxOptionInput,
                    domInputGroup: domInputGroup
                };

            },
            buildLabel: (strLabelPosition, domCheckboxOptionInput, domCheckboxOptionLabel, objSelectStyle) => {
                const domInputWrapElement = customSelect.utils.createElement(objSelectStyle.item, 'customselect-list-input-item');

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
            destroyDomList: (domSelector) => {
                const customSelectId = domSelector.dataset.customselectDataId;
                const customSelectList = document.getElementById(customSelectId);
                if (customSelectList !== null) {
                    customSelectList.parentNode.removeChild(customSelectList);
                    domSelector.classList.remove(customSelect.constants.added);
                }

            },
            addToDom: (domSelect, domCheckboxList, objDataOptions) => {
                const domParent = domSelect.parentNode;
                let domCheckboxWrapper = customSelect.utils.createElement('div', 'customselect-list-container');
                domSelect.classList.add(customSelect.constants.added);
                domCheckboxWrapper.appendChild(domSelect);
                domCheckboxWrapper.appendChild(domCheckboxList);
                domParent.appendChild(domCheckboxWrapper);
                customSelect.triggerInitialState(domCheckboxWrapper);

                if (customSelect.utils.parseBool(objDataOptions.dropdown) === true) {
                    customSelect.dropdown.bindEvents(domCheckboxList);
                }

                if (customSelect.utils.parseBool(objDataOptions.search) === true) {
                    customSelect.search.bindEvents(domCheckboxList);
                }

                if (customSelect.utils.parseBool(objDataOptions.reset) === true) {
                    customSelect.reset.bindEvents(domCheckboxList, objDataOptions);
                }

                customSelect.bindSelect(domSelect, domCheckboxList);
                customSelect.utils.triggerCustomEvent(domCheckboxList, 'list.builded');
            },
            triggerInitialState: (domCheckboxWrapper) => {
                const preCheckedElements = domCheckboxWrapper.querySelectorAll('input');
                if (preCheckedElements.length > 0) {
                    customSelect.utils.triggerEvent(preCheckedElements, 'change');
                }

            }
        };

        if (typeof options === 'string') {
            if (typeof $.fn.customselect.public[options] === 'function') {
                return $.fn.customselect.public[options](this, customSelect);
            }
        }

        objOptions = $.extend({}, $.fn.customselect.defaults, options);
        customSelect.init(this);

        return this;
    };

    $.fn.customselect.public = {
        destroy: (arrDomSelectors, customSelect) => {
            Array.from(arrDomSelectors).forEach((domSelector) => {
                customSelect.destroyDomList(domSelector);
            });
        }
    };

    $.fn.customselect.defaults = {
        labelPosition: 'after',
        style: 'list',
        dropdown: false,
        search: false,
        reset: false,
        classList: '',
        targetTypes: [ 'select-multiple', 'select-one' ],
        parentNode: null,
        observe: true,
        selectedLimit: 3,
        selectedDelimiter: ' | ',
        emptyText: 'Nothing selected',
        selectedText: 'selected',
        allSelectedText: 'All selected',
        searchText: 'Search options',
        resetText: 'All',
        onChange: null
    };
}(jQuery));