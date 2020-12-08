( function ( $ ) {
    $.fn.customselect = function ( options ) {
        const objOptions = $.extend( {
            labelPosition: 'after',
            style: 'list',
            classList: '',
            selectors: [ 'select-multiple', 'select-one' ],
            parentNode: null,
            observe: true,
            multiSelectedLimit: 3,
            multiSelectedDelimiter: ' | ',
            dropdownEmptyText: 'Nothing selected',
            dropdownSelectedText: 'selected',
            dropdownAllSelectedText: 'All selected'
        }, options );

        const customSelect = {
            _selects: [],
            settings: {
                added: 'custom-select-added'
            },
            utils: {
                getCustomSelectID: ( intLength ) => {
                    let result = '';
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    const charactersLength = characters.length;
                    for ( let i = 0; i < intLength; i++ ) {
                        result += characters.charAt( Math.floor( Math.random() * charactersLength ) );
                    }
                    return 'customselect' + result;
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
                        type: customSelectType,
                        dropdown: false
                    };
                    if ( objDataOptions.style === 'list' || objDataOptions.style === 'dropdown' ) {
                        returnObj.list = 'ul';
                        returnObj.item = 'li';
                    }
                    if ( objDataOptions.style === 'dropdown' ) {
                        returnObj.dropdown = true;
                    }
                    return returnObj;
                },
                delegate: ( event, selector, fnCallback ) => {
                    document.addEventListener( event, function ( e ) {
                        for ( let target = e.target; target && target !== this; target = target.parentNode ) {
                            if ( target.matches( selector ) ) {
                                fnCallback.call( target, e );
                                break;
                            }
                        }
                    }, false );
                },
                getSelectOptions: ( dataId ) => {
                    return customSelect.__selects.find( i => i.id === dataId );
                }
            },
            init: ( arrDomSelectors ) => {
                Array.from( arrDomSelectors ).forEach( ( domSelector ) => {
                    customSelect.build( domSelector, true );
                } );

            },
            bindDropdown: ( domCheckboxList ) => {
                const domCheckBoxListDropDown = document.getElementById( domCheckboxList.id );

                domCheckBoxListDropDown.addEventListener( 'click', ( event ) => {
                    const domDropdown = event.target.closest( '.customselect-dropdown' );
                    customSelect.closeAllDropdowns( domDropdown );
                    customSelect.toggleDropdown( domDropdown );

                } );

                document.addEventListener( 'click', ( event ) => {
                    const hasDropDownParent = event.target.closest( '.customselect-dropdown' ) !== null;
                    if ( hasDropDownParent === false ) {
                        customSelect.closeAllDropdowns();
                    }
                } );
            },
            closeAllDropdowns: ( currentDomDropdown ) => {
                const documentDropdowns = document.querySelectorAll( '.customselect-dropdown' );
                Array.from( documentDropdowns ).filter( d => d !== currentDomDropdown ).forEach( ( domDropdown ) => {
                    domDropdown.classList.remove( 'open' );
                } );
            },
            toggleDropdown: ( domDropdown ) => {
                if ( domDropdown.className.indexOf( 'open' ) > -1 ) {
                    domDropdown.classList.remove( 'open' );
                } else {
                    domDropdown.classList.add( 'open' );
                }
            },
            bindListener: ( domSelector ) => {
                const observer = new MutationObserver( function ( mutations ) {
                    mutations.forEach( function ( mutation ) {
                        let newNodes = mutation.addedNodes;
                        if ( newNodes !== null ) {
                            newNodes.forEach( ( newNode ) => {
                                if ( newNode.nodeType === 1 ) {
                                    let appendedElementsMatchedSelector = newNode.querySelector( 'select' );
                                    if ( newNode.matches( 'select' ) ) {
                                        appendedElementsMatchedSelector = newNode;
                                    }
                                    if ( appendedElementsMatchedSelector !== null && appendedElementsMatchedSelector.length > 0 ) {
                                        if ( appendedElementsMatchedSelector.className.indexOf( customSelect.settings.added ) === -1 ) {
                                            customSelect.build( domSelector, false );
                                        }
                                    }
                                }
                            } );
                        }
                    } );
                } );
                const config = {
                    childList: true,
                    attributes: false,
                    subtree: true,
                    characterData: false
                };
                const targetNode = domSelector;
                observer.observe( targetNode, config );
            },
            bindEventLink: ( domCheckboxOptionInput, domOptions, customSelectStyle, objDataOptions ) => {
                domCheckboxOptionInput.addEventListener( 'change', ( event ) => {
                    domOptions.find( o => o.value === event.target.value ).selected = event.target.checked;

                    if ( customSelectStyle.dropdown === true ) {
                        const domDropdown = domCheckboxOptionInput.closest( '.customselect-dropdown' );
                        let selectedOptions = domOptions.filter( o => o.selected === true );
                        let selectedTextNode = domDropdown.querySelector( '.customselect-dropdown-text' );

                        if ( selectedOptions.length === 0 ) {
                            selectedTextNode.innerText = objDataOptions.dropdownEmptyText;
                        } else {
                            let selectedOptionsText = selectedOptions.map( o => o.textContent ).filter( v => v ).join( objDataOptions.multiSelectedDelimiter );
                            if ( selectedOptions.length > objDataOptions.multiSelectedLimit && selectedOptions.length < domOptions.length ) {
                                selectedOptionsText = selectedOptions.length + ' ' + objDataOptions.dropdownSelectedText;
                            } else if ( selectedOptions.length === domOptions.length ) {
                                selectedOptionsText = objDataOptions.dropdownAllSelectedText;
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
                if ( domSelect.className.indexOf( customSelect.settings.added ) > -1 ) {
                    return false;
                }

                const customSelectID = customSelect.utils.getCustomSelectID( 20 );
                const dataOptions = domSelect.dataset;
                let objDataOptions = Object.assign( {}, objOptions );
                objDataOptions = Object.assign( objDataOptions, dataOptions );

                const customSelectStyle = customSelect.utils.getSelectStyle( domSelect.type, objDataOptions );
                const domOptions = Array.from( domSelect.options );
                const selectedOptions = domOptions.filter( o => o.selected );

                customSelect.__selects.push( { id: customSelectID, select: domSelect, options: objDataOptions } );
                domSelect.dataset.customselectDataId = customSelectID;

                if ( objDataOptions.selectors.indexOf( customSelectStyle.type ) === -1 ) {
                    console.error( customSelectStyle.type + ' is not a valid selector for customselect' );
                    return false;
                }

                if ( selectedOptions.length === 0 && customSelectStyle.type === 'select-one' ) {
                    domOptions[ 0 ].selected = true;
                }

                let domCheckboxList = customSelect.utils.createElement( customSelectStyle.list, 'customselect-list ' + objDataOptions.classList );

                domCheckboxList.id = customSelectID;
                domCheckboxList.dataset.placeholder = objDataOptions.dropdownEmptyText;
                domCheckboxList.dataset.type = customSelectStyle.type;

                if ( customSelectStyle.dropdown === true ) {
                    domCheckboxList.classList.add( 'customselect-dropdown' );
                    let domSelectedOption = customSelect.utils.createElement( customSelectStyle.item, 'customselect-list-item customselect-dropdown-text' );
                    domCheckboxList.appendChild( domSelectedOption );
                }

                domOptions.forEach( ( domOption ) => {
                    const buildedOption = customSelect.buildDomOption( domOption, customSelectID, customSelectStyle, objDataOptions );
                    domCheckboxList.appendChild( buildedOption.domInputWrap );
                    customSelect.bindEventLink( buildedOption.domCheckboxOptionInput, domOptions, customSelectStyle, objDataOptions );

                } );

                customSelect.addToDom( domSelect, domCheckboxList, objDataOptions );

                if ( boolInit === true && objOptions.observe === true ) {
                    let parentNodeToWatch = null;
                    if ( objDataOptions.parentNode !== null ) {
                        parentNodeToWatch = document.querySelector( objDataOptions.parentNode );
                    } else if ( domSelector === null ) {
                        parentNodeToWatch = domSelector
                    } else {
                        parentNodeToWatch = domSelect.parentNode;
                    }
                    customSelect.bindListener( parentNodeToWatch );
                }
            },
            bindByParent: ( domSelector, boolInit ) => {
                const domAllSelects = Array.from( domSelector.querySelectorAll( 'select' ) );
                const domSelects = domAllSelects.filter( s => objOptions.selectors.indexOf( s.type ) > -1 );

                if ( domSelects === null ) {
                    return false;
                }
                domSelects.forEach( ( domSelect ) => {
                    customSelect.bindByElement( domSelect, true, domSelector );
                } );
            },
            build: ( domSelector, boolInit ) => {
                if ( objOptions.selectors.indexOf( domSelector.type ) === -1 ) {
                    customSelect.bindByParent( domSelector, true );
                } else {
                    customSelect.bindByElement( domSelector, true );
                }
            },
            buildDomOption: ( domOption, customSelectID, customSelectStyle, objDataOptions ) => {
                let domCheckboxOptionInput = customSelect.utils.createElement( 'input', 'customselect-list-input' );
                let customSelectName = '';
                const id = customSelect.utils.getCustomSelectID( 20 );
                domCheckboxOptionInput.type = customSelectStyle.type === 'select-one' ? 'radio' : 'checkbox';
                domCheckboxOptionInput.value = domOption.value;
                domCheckboxOptionInput.id = id;
                domCheckboxOptionInput.checked = domOption.selected;

                if ( customSelectStyle.type === 'select-one' ) {
                    customSelectName = customSelectID;
                    domCheckboxOptionInput.name = customSelectName;
                }

                let domCheckboxOptionLabel = customSelect.utils.createElement( 'label', 'customselect-list-label' );
                domCheckboxOptionLabel.innerText = domOption.text;
                domCheckboxOptionLabel.htmlFor = id;

                const domInputWrapElement = customSelect.utils.createElement( customSelectStyle.item, 'customselect-list-input-item' );
                const domInputWrap = customSelect.positionLabel( objDataOptions.labelPosition, domCheckboxOptionInput, domCheckboxOptionLabel, domInputWrapElement );
                return {
                    domCheckboxOptionInput: domCheckboxOptionInput,
                    domInputWrap: domInputWrap
                };

            },
            positionLabel: ( labelPosition, input, label, wrapElem ) => {
                if ( labelPosition === 'before' ) {
                    wrapElem.appendChild( label );
                    wrapElem.appendChild( input );
                } else if ( labelPosition === 'after' ) {
                    wrapElem.appendChild( input );
                    wrapElem.appendChild( label );
                } else {
                    label.appendChild( input );
                    wrapElem.appendChild( label );
                }
                return wrapElem;
            },
            addToDom: ( domSelect, domCheckboxList, objDataOptions ) => {
                const domParent = domSelect.parentNode;
                let domCheckboxWrapper = customSelect.utils.createElement( 'div', 'customselect-list-container' );
                domSelect.classList.add( customSelect.settings.added );
                domSelect.setAttribute( 'style', 'display:none !important' );
                domCheckboxWrapper.appendChild( domSelect );
                domCheckboxWrapper.appendChild( domCheckboxList );
                domParent.appendChild( domCheckboxWrapper );
                customSelect.triggerInitialState( domCheckboxWrapper );

                if ( objDataOptions.style === 'dropdown' ) {
                    customSelect.bindDropdown( domCheckboxList );
                }
            },
            triggerInitialState: ( domCheckboxWrapper ) => {
                const preCheckedElements = domCheckboxWrapper.querySelectorAll( 'input' );
                if ( preCheckedElements.length > 0 ) {
                    const changeEvent = new Event( 'change' );
                    preCheckedElements.forEach( ( domInput ) => {
                        domInput.dispatchEvent( changeEvent );
                    } );

                }
            }
        };
        customSelect.init( this );
    };
}( jQuery ) );