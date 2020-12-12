( function ( $ ) {
    $.fn.customselect = function ( options ) {

        const objOptions = $.extend( {}, $.fn.customselect.defaults, options );

        const customSelect = {
            events: {},
            constants: {
                added: 'customselect-added'
            },
            utils: {
                parseBool: ( strBool ) => {
                    let bool;
                    if ( typeof strBool === 'boolean' ) {
                        return strBool;
                    }
                    bool = ( function () {
                        switch ( false ) {
                            case strBool.toLowerCase() !== 'true':
                                return true;
                            case strBool.toLowerCase() !== 'false':
                                return false;
                        }
                    } )();
                    if ( typeof bool === 'boolean' ) {
                        return bool;
                    }
                    return void 0;
                },
                getCustomSelectID: ( intLength ) => {
                    let result = '';
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    const charactersLength = characters.length;
                    for ( let i = 0; i < intLength; i++ ) {
                        result += characters.charAt( Math.floor( Math.random() * charactersLength ) );
                    }
                    return result;
                },
                createElement: ( strType, strClassName = '' ) => {
                    let domElement = document.createElement( strType );
                    domElement.className = strClassName;
                    return domElement;
                },
                getSelectStyle: ( customSelectType, objDataOptions ) => {
                    let returnObj = {
                        list: 'div',
                        item: 'div',
                        type: customSelectType
                    };
                    if ( objDataOptions.style === 'list' ) {
                        returnObj.list = 'ul';
                        returnObj.item = 'li';
                    }
                    return returnObj;
                },
                getObserverSelector: ( objDataOptions, domSelector = null, domSelect = null ) => {
                    let parentNodeToWatch = null;
                    if ( objDataOptions.parentNode !== null ) {
                        parentNodeToWatch = document.querySelector( objDataOptions.parentNode );
                    } else if ( domSelector !== null ) {
                        parentNodeToWatch = domSelector;
                    } else {
                        parentNodeToWatch = domSelect.parentNode;
                    }
                    return parentNodeToWatch;

                },
                createCustomEvent: ( strEventType ) => {
                    const event = new Event( strEventType );
                    customSelect.events[ strEventType ] = event;
                },
                triggerCustomEvent: ( domTarget, strEventType ) => {
                    const event = customSelect.events[ strEventType ];
                    if ( event ) {
                        domTarget.dispatchEvent( event );
                    }

                },
                triggerEvent: ( domTargets, strTriggerEvent ) => {
                    const event = new Event( strTriggerEvent );
                    if ( domTargets instanceof NodeList ) {
                        domTargets.forEach( ( domTarget ) => {
                            domTarget.dispatchEvent( event );
                        } );
                    } else {
                        domTargets.dispatchEvent( event );
                    }

                }
            },
            init: ( arrDomSelectors ) => {
                Array.from( arrDomSelectors ).forEach( ( domSelector ) => {
                    customSelect.buildDomList( domSelector, true );
                } );
                customSelect.utils.createCustomEvent( 'dropdown.open' );
                customSelect.utils.createCustomEvent( 'dropdown.close' );
            },
            dropdown: {
                bindEvents: ( domCheckboxList ) => {
                    const domCheckBoxListDropDown = document.getElementById( domCheckboxList.id );

                    domCheckBoxListDropDown.addEventListener( 'click', ( event ) => {
                        if ( event.target.className.indexOf( 'customselect-search-input' ) > -1 ) {
                            return false;
                        }
                        const domDropdown = event.target.closest( '.customselect-dropdown' );
                        customSelect.dropdown.closeAll( domDropdown );
                        customSelect.dropdown.toggle( domDropdown );

                    } );

                    document.addEventListener( 'click', ( event ) => {
                        const hasDropDownParent = event.target.closest( '.customselect-dropdown' ) !== null;
                        if ( hasDropDownParent === false ) {
                            customSelect.dropdown.closeAll();
                        }
                    } );

                    domCheckBoxListDropDown.addEventListener( 'dropdown.close', ( event ) => {
                        const searchItem = event.target.querySelector( '.customselect-search-item' );
                        if ( searchItem !== null ) {
                            let searchInput = searchItem.querySelector( '.customselect-search-input' );
                            searchInput.value = '';
                            customSelect.utils.triggerEvent( searchInput, 'input' );
                        }
                    } );


                },
                closeAll: ( currentDomDropdown ) => {
                    const documentDropdowns = document.querySelectorAll( '.customselect-dropdown' );
                    Array.from( documentDropdowns ).filter( d => d !== currentDomDropdown ).forEach( ( domDropdown ) => {
                        customSelect.utils.triggerCustomEvent( domDropdown, 'dropdown.close' );
                        domDropdown.classList.remove( 'open' );
                    } );
                },
                toggle: function ( domDropdown ) {
                    if ( domDropdown.className.indexOf( 'open' ) > -1 ) {
                        domDropdown.classList.remove( 'open' );
                        customSelect.utils.triggerCustomEvent( domDropdown, 'dropdown.close' );
                    } else {
                        domDropdown.classList.add( 'open' );
                        customSelect.utils.triggerCustomEvent( domDropdown, 'dropdown.open' );
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
                bind: ( domSelector ) => {
                    const observer = new MutationObserver( function ( mutations ) {
                        mutations.forEach( function ( mutation ) {
                            customSelect.observer.callback( mutation, domSelector );
                        } );
                    } );
                    if ( domSelector.nodeType === 1 ) {
                        observer.observe( domSelector, customSelect.observer.config );
                    }
                },
                callback: ( mutation, domSelector ) => {
                    if ( mutation.addedNodes !== null ) {
                        mutation.addedNodes.forEach( ( newNode ) => {
                            if ( newNode.nodeType === 1 ) {
                                let appendedElementsMatchedSelector = newNode.querySelector( 'select' );
                                if ( newNode.matches( 'select' ) ) {
                                    appendedElementsMatchedSelector = newNode;
                                }
                                if ( appendedElementsMatchedSelector !== null && appendedElementsMatchedSelector.length > 0 ) {
                                    if ( appendedElementsMatchedSelector.className.indexOf( customSelect.constants.added ) === -1 ) {
                                        customSelect.buildDomList( domSelector, false );
                                    }
                                }
                            }
                        } );
                    }
                }
            },
            bindEvents: ( domCheckboxOptionInput, domOptions, customSelectStyle, objDataOptions ) => {
                domCheckboxOptionInput.addEventListener( 'change', ( event ) => {
                    domOptions.find( o => o.value === event.target.value ).selected = event.target.checked;
                    if ( customSelect.utils.parseBool( objDataOptions.dropdown ) === true ) {
                        const domDropdown = domCheckboxOptionInput.closest( '.customselect-dropdown' );
                        let selectedOptions = domOptions.filter( o => o.selected === true );
                        let selectedTextNode = domDropdown.querySelector( '.customselect-dropdown-text' );

                        if ( selectedOptions.length === 0 ) {
                            selectedTextNode.innerText = objDataOptions.emptyText;
                        } else {
                            let selectedOptionsText = selectedOptions.map( o => o.textContent ).filter( v => v ).join( objDataOptions.selectedDelimiter );
                            if ( selectedOptions.length > objDataOptions.selectedLimit && selectedOptions.length < domOptions.length ) {
                                selectedOptionsText = selectedOptions.length + ' ' + objDataOptions.selectedText;
                            } else if ( selectedOptions.length === domOptions.length ) {
                                selectedOptionsText = objDataOptions.allSelectedText;
                            }
                            selectedTextNode.innerText = selectedOptionsText;
                        }
                        if ( customSelectStyle.type === 'select-one' ) {
                            domDropdown.classList.remove( 'open' );
                        }
                    }
                } );
            },
            bindByElement: ( domSelect, boolInit = false, domSelector = null ) => {
                if ( domSelect.className.indexOf( customSelect.constants.added ) > -1 ) {
                    return false;
                }

                const customSelectID = customSelect.utils.getCustomSelectID( 20 );
                const dataOptions = domSelect.dataset;
                let objDataOptions = Object.assign( {}, objOptions );
                objDataOptions = Object.assign( objDataOptions, dataOptions );

                const customSelectStyle = customSelect.utils.getSelectStyle( domSelect.type, objDataOptions );
                const domOptions = Array.from( domSelect.children );
                const selectedOptions = domOptions.filter( o => o.selected );



                domSelect.dataset.customselectDataId = customSelectID;

                if ( objDataOptions.targetTypes.indexOf( customSelectStyle.type ) === -1 ) {
                    console.warn( customSelectStyle.type + ' is not a valid selector for customselect' );
                    return false;
                }

                if ( selectedOptions.length === 0 && customSelectStyle.type === 'select-one' ) {
                    domOptions[ 0 ].selected = true;
                }

                let domCheckboxList = customSelect.utils.createElement( customSelectStyle.list, 'customselect-list ' + objDataOptions.classList );

                domCheckboxList.id = customSelectID;
                domCheckboxList.dataset.placeholder = objDataOptions.emptyText;
                domCheckboxList.dataset.type = customSelectStyle.type;
                if ( customSelect.utils.parseBool( objDataOptions.dropdown ) === true ) {
                    domCheckboxList.classList.add( 'customselect-dropdown' );
                    let domSelectedOption = customSelect.utils.createElement( customSelectStyle.item, 'customselect-list-input-item customselect-dropdown-text' );
                    domCheckboxList.appendChild( domSelectedOption );
                }

                if ( customSelect.utils.parseBool( objDataOptions.search ) === true ) {
                    domCheckboxList.classList.add( 'customselect-search' );
                    let domSelectedOption = customSelect.utils.createElement( customSelectStyle.item, 'customselect-list-input-item customselect-search-item' );
                    let domSearchInput = customSelect.utils.createElement( 'input', 'customselect-search-input' );
                    domSearchInput.type = 'search';
                    domSearchInput.placeholder = 'Search';
                    domSelectedOption.appendChild( domSearchInput );
                    domCheckboxList.appendChild( domSelectedOption );
                }

                domOptions.forEach( ( domOption ) => {

                    if ( domOption.nodeName === 'OPTGROUP' ) {
                        let nestedList = customSelect.utils.createElement( customSelectStyle.list, 'customselect-optgroup' );
                        let nestedListLabel = customSelect.utils.createElement( customSelectStyle.item, 'customselect-optgroup-label' );
                        nestedListLabel.innerText = domOption.label;
                        nestedList.appendChild( nestedListLabel );
                        const optGroupOptions = Array.from( domOption.children );
                        optGroupOptions.forEach( ( domNestedOption ) => {
                            const buildedOption = customSelect.buildDomOption( domNestedOption, customSelectID, customSelectStyle, objDataOptions );
                            nestedList.appendChild( buildedOption.domInputGroup );
                            domCheckboxList.appendChild( nestedList );
                            customSelect.bindEvents( buildedOption.domCheckboxOptionInput, optGroupOptions, customSelectStyle, objDataOptions );
                        } );
                    } else if ( domOption.nodeName === 'OPTION' ) {
                        const buildedOption = customSelect.buildDomOption( domOption, customSelectID, customSelectStyle, objDataOptions );
                        domCheckboxList.appendChild( buildedOption.domInputGroup );
                        customSelect.bindEvents( buildedOption.domCheckboxOptionInput, domOptions, customSelectStyle, objDataOptions );
                    }

                } );

                customSelect.addToDom( domSelect, domCheckboxList, objDataOptions );

                if ( boolInit === true && customSelect.utils.parseBool( objDataOptions.observe ) === true ) {
                    let parentNodeToWatch = customSelect.utils.getObserverSelector( objOptions, domSelector, domSelect );
                    customSelect.observer.bind( parentNodeToWatch );
                }

            },
            bindByParent: ( domSelector, boolInit ) => {
                const domAllSelects = Array.from( domSelector.querySelectorAll( 'select' ) );
                const domSelects = domAllSelects.filter( s => objOptions.targetTypes.indexOf( s.type ) > -1 );

                if ( domSelects.length === 0 ) {
                    if ( boolInit === true && customSelect.utils.parseBool( objOptions.observe ) === true ) {
                        let parentNodeToWatch = customSelect.utils.getObserverSelector( objOptions, domSelector );
                        customSelect.observer.bind( parentNodeToWatch );
                    }
                    return false;
                }
                domSelects.forEach( ( domSelect ) => {
                    customSelect.bindByElement( domSelect, true, domSelector );

                } );
            },
            buildDomList: ( domSelector, boolInit ) => {
                if ( objOptions.targetTypes.indexOf( domSelector.type ) === -1 ) {
                    customSelect.bindByParent( domSelector, boolInit );
                } else {
                    customSelect.bindByElement( domSelector, boolInit );
                }
            },
            buildDomOption: ( domOption, customSelectID, customSelectStyle, objDataOptions ) => {
                let domCheckboxOptionInput = customSelect.utils.createElement( 'input', 'customselect-list-input' );
                let strCustomSelectName = '';
                const strId = customSelect.utils.getCustomSelectID( 20 );
                domCheckboxOptionInput.type = customSelectStyle.type === 'select-one' ? 'radio' : 'checkbox';
                domCheckboxOptionInput.value = domOption.value;
                domCheckboxOptionInput.id = strId;
                domCheckboxOptionInput.checked = domOption.selected;

                if ( customSelectStyle.type === 'select-one' ) {
                    strCustomSelectName = customSelectID;
                    domCheckboxOptionInput.name = strCustomSelectName;
                }

                let domCheckboxOptionLabel = customSelect.utils.createElement( 'label', 'customselect-list-label' );
                domCheckboxOptionLabel.innerText = domOption.text;
                domCheckboxOptionLabel.htmlFor = strId;

                let domInputGroup = customSelect.positionLabel( objDataOptions.labelPosition, domCheckboxOptionInput, domCheckboxOptionLabel, customSelectStyle );

                if ( domOption.disabled ) {
                    domOption.classList.add( 'disabled' );
                }
                if ( domOption.classList.length > 0 ) {
                    domOption.classList.forEach( ( className ) => {
                        domInputGroup.classList.add( className );
                    } );
                }


                return {
                    domCheckboxOptionInput: domCheckboxOptionInput,
                    domInputGroup: domInputGroup
                };

            },
            positionLabel: ( strLabelPosition, domCheckboxOptionInput, domCheckboxOptionLabel, customSelectStyle ) => {
                const domInputWrapElement = customSelect.utils.createElement( customSelectStyle.item, 'customselect-list-input-item' );

                if ( strLabelPosition === 'before' ) {
                    domInputWrapElement.appendChild( domCheckboxOptionLabel );
                    domInputWrapElement.appendChild( domCheckboxOptionInput );
                } else if ( strLabelPosition === 'after' ) {
                    domInputWrapElement.appendChild( domCheckboxOptionInput );
                    domInputWrapElement.appendChild( domCheckboxOptionLabel );
                } else {
                    domCheckboxOptionLabel.appendChild( domCheckboxOptionInput );
                    domInputWrapElement.appendChild( domCheckboxOptionLabel );
                }
                return domInputWrapElement;
            },
            addToDom: ( domSelect, domCheckboxList, objDataOptions ) => {
                const domParent = domSelect.parentNode;
                let domCheckboxWrapper = customSelect.utils.createElement( 'div', 'customselect-list-container' );
                domSelect.classList.add( customSelect.constants.added );
                domSelect.setAttribute( 'style', 'display:none !important' );
                domCheckboxWrapper.appendChild( domSelect );
                domCheckboxWrapper.appendChild( domCheckboxList );
                domParent.appendChild( domCheckboxWrapper );
                customSelect.triggerInitialState( domCheckboxWrapper );

                if ( customSelect.utils.parseBool( objDataOptions.dropdown ) === true ) {
                    customSelect.dropdown.bindEvents( domCheckboxList );
                }

                if ( customSelect.utils.parseBool( objDataOptions.search ) === true ) {
                    const searchInput = domCheckboxList.querySelector( '.customselect-search-input' );
                    searchInput.addEventListener( 'input', ( event ) => {
                        const query = event.target.value.toLowerCase();
                        let items = Array.from( domCheckboxList.querySelectorAll( '.customselect-list-input-item' ) );
                        if ( query.length > 0 ) {
                            domCheckboxList.classList.add( 'searching' );
                            let results = items.forEach( item => {
                                const input = item.querySelector( '.customselect-list-input' );
                                const label = item.querySelector( '.customselect-list-label' );
                                if ( input !== null && label !== null ) {
                                    if ( input.value.toLowerCase().indexOf( query ) > -1 || label.innerText.toLowerCase().indexOf( query ) > -1 ) {
                                        item.classList.add( 'match' );
                                    } else {
                                        item.classList.remove( 'match' );
                                    }
                                }


                            } );
                        } else {
                            domCheckboxList.classList.remove( 'searching' );
                            items.forEach( item => {
                                item.classList.remove( 'match' );
                            } )
                        }
                    } );
                }

                domSelect.onchange = ( event ) => {
                    const refId = event.target.dataset.customselectDataId;
                    const customSelectList = document.getElementById( refId );
                    const selectedValues = Array.from( event.target.options ).filter( option => option.selected === true );
                    let customSelectAllInput = Array.from( customSelectList.querySelectorAll( 'input' ) );

                    customSelectAllInput.forEach( function ( domInput ) {
                        if ( selectedValues.find( o => o.value === domInput.value ) ) {
                            domInput.checked = true;
                        } else {
                            domInput.checked = false;
                        }
                    } );
                    customSelect.triggerInitialState( customSelectList );
                }
            },
            triggerInitialState: ( domCheckboxWrapper ) => {
                const preCheckedElements = domCheckboxWrapper.querySelectorAll( 'input' );
                if ( preCheckedElements.length > 0 ) {
                    customSelect.utils.triggerEvent( preCheckedElements, 'change' );
                }
            }
        };
        customSelect.init( this );
    };

    $.fn.customselect.defaults = {
        labelPosition: 'after',
        style: 'list',
        dropdown: false,
        classList: '',
        targetTypes: [ 'select-multiple', 'select-one' ],
        parentNode: null,
        observe: true,
        selectedLimit: 3,
        selectedDelimiter: ' | ',
        emptyText: 'Nothing selected',
        selectedText: 'selected',
        allSelectedText: 'All selected'
    };
}( jQuery ) );