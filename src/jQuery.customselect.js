( function ( $ ) {
	$.fn.customselect = function ( options ) {
		const jSelector = this;
		const objOptions = $.extend( {
			labelPosition: 'after',
			style: 'list',
			observe: true
		}, options );

		const customSelect = {
			settings: {
				types: [ 'select-multiple', 'select-one' ],
				added: 'custom-select-added'
			},
			utils: {
				getCustomSelectID: ( intLength ) => {
					let result = '';
					const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
					const charactersLength = characters.length;
					for ( var i = 0; i < intLength; i++ ) {
						result += characters.charAt( Math.floor( Math.random() * charactersLength ) );
					}
					return 'customselect' + result;
				},
				createElement: ( strType, strClassName = '' ) => {
					let domElement = document.createElement( strType );
					domElement.className = strClassName;
					return domElement;
				},
				getSelectStyle: () => {
					let returnObj = {
						list: 'div',
						item: 'div',
						dropdown: false
					};
					if ( objOptions.style === 'list' || objOptions.style === 'dropdown' ) {
						returnObj.list = 'ul';
						returnObj.item = 'li';
					}
					if ( objOptions.style === 'dropdown' ) {
						returnObj.dropdown = true;
					}
					return returnObj;
				},
				delegate: ( event, selector, fnCallback ) => {
					document.addEventListener( event, function ( e ) {
						for ( var target = e.target; target && target !== this; target = target.parentNode ) {
							if ( target.matches( selector ) ) {
								fnCallback.call( target, e );
								break;
							}
						}
					}, false );
				},
			},
			init: () => {
				jSelector.each( ( index, domParent ) => {
					customSelect.convert( domParent, true );
				} );
				if ( objOptions.style === 'dropdown' ) {
					customSelect.bindDropdown();
				}
			},
			bindDropdown: () => {
				customSelect.utils.delegate( 'click', '.customselect-dropdown', ( event ) => {
					const domDropdown = event.target.closest( '.customselect-dropdown' );
					if ( domDropdown.className.indexOf( 'open' ) > -1 ) {
						domDropdown.classList.remove( 'open' );
					} else {
						domDropdown.classList.add( 'open' );
					}
				} );
				document.addEventListener( 'click', ( event ) => {
					const documentDropdowns = event.target.querySelectorAll( '.customselect-dropdown' );
					const isDropdownElement = event.target.closest( '.customselect-dropdown' );
					if ( isDropdownElement === null ) {
						documentDropdowns.forEach( ( domDropdown ) => {
							domDropdown.classList.remove( 'open' );
						} );
					}
				} );
			},
			convert: ( domParent, boolInit ) => {
				customSelect.build( domParent, boolInit );
			},
			bindListener: ( domParent ) => {
				const observer = new MutationObserver( function ( mutations ) {
					mutations.forEach( function ( mutation ) {
						var newNodes = mutation.addedNodes;
						if ( newNodes !== null ) {
							newNodes.forEach( ( newNode ) => {
								if ( newNode ) {
									let appendedElementsMatchedSelector = newNode.querySelector( 'select' );
									if ( newNode.matches( 'select' ) ) {
										appendedElementsMatchedSelector = newNode;
									}
									if ( appendedElementsMatchedSelector !== null && appendedElementsMatchedSelector.length > 0 ) {
										if ( appendedElementsMatchedSelector.className.indexOf( customSelect.settings.added ) === -1 ) {
											customSelect.convert( domParent, false );
										}
									}
								}

							} );
						}
					} );
				} );
				var config = {
					childList: true,
					attributes: false,
					subtree: false,
					characterData: false
				};
				var targetNode = domParent;
				observer.observe( targetNode, config );
			},
			bindEventLink: ( domCheckboxOptionInput, domOptions, boolIsDropDown ) => {
				domCheckboxOptionInput.addEventListener( 'change', ( event ) => {
					domOptions.find( o => o.value === event.target.value ).selected = event.target.checked;
					if ( boolIsDropDown === true ) {
						let selectedOptions = domOptions.filter( o => o.selected === true );
						let selectedTextNode = domCheckboxOptionInput.closest( '.customselect-dropdown' ).querySelector( '.customselect-dropdown-text' );

						selectedTextNode.innerText = selectedOptions.map( o => o.value ).filter( v => v ).join( ', ' );

					}
				} );
			},
			build: ( domParent, boolInit ) => {
				const domSelects = domParent.querySelectorAll( 'select' );

				if ( domSelects === null ) {
					return false;
				}

				domSelects.forEach( ( domSelect ) => {

					const customSelectType = domSelect.type;
					const customSelectStyle = customSelect.utils.getSelectStyle();
					let customSelectName = '';

					if ( customSelect.settings.types.indexOf( customSelectType ) === -1 ) {
						console.error( customSelectType + ' is not a valid selector for customselect' );
						return false;
					}

					if ( domSelect.className.indexOf( customSelect.settings.added ) > -1 ) {
						return false;
					}

					if ( customSelectType === 'select-one' ) {
						customSelectName = customSelect.utils.getCustomSelectID( 20 );
					}

					const domOptions = Array.from( domSelect.options );
					const selectedOptions = domOptions.filter( o => o.selected );

					if ( selectedOptions.length === 0 && customSelectType === 'select-one' ) {
						domOptions[ 0 ].selected = true;
					}

					let domCheckboxList = customSelect.utils.createElement( customSelectStyle.list, 'custom-checkbox-list' );

					if ( customSelectStyle.dropdown === true ) {
						domCheckboxList.classList.add( 'customselect-dropdown' );
						let domSelectedOption = customSelect.utils.createElement( customSelectStyle.item, 'custom-checkbox-list-item customselect-dropdown-text' );
						domCheckboxList.appendChild( domSelectedOption )
					}

					domOptions.forEach( ( domOption ) => {
						let domCheckboxOptionInput = customSelect.utils.createElement( 'input', 'custom-checkbox-list-input' );
						const id = customSelect.utils.getCustomSelectID( 20 );
						domCheckboxOptionInput.type = customSelectType === 'select-one' ? 'radio' : 'checkbox';
						domCheckboxOptionInput.value = domOption.value;
						domCheckboxOptionInput.id = id;
						domCheckboxOptionInput.checked = domOption.selected;

						if ( customSelectType === 'select-one' ) {
							domCheckboxOptionInput.name = customSelectName;
						}

						let domCheckboxOptionLabel = customSelect.utils.createElement( 'label', 'custom-checkbox-list-label' );
						domCheckboxOptionLabel.innerText = domOption.text;
						domCheckboxOptionLabel.htmlFor = id;

						let domInputWrap = customSelect.utils.createElement( customSelectStyle.item, 'custom-checkbox-list-input-item' );



						if ( objOptions.labelPosition === 'wrap' ) {
							domCheckboxOptionLabel.appendChild( domCheckboxOptionInput );
							domInputWrap.appendChild( domCheckboxOptionLabel );
						} else if ( objOptions.labelPosition === 'before' ) {
							domInputWrap.appendChild( domCheckboxOptionLabel );
							domInputWrap.appendChild( domCheckboxOptionInput );
						} else if ( objOptions.labelPosition === 'after' ) {
							domInputWrap.appendChild( domCheckboxOptionInput );
							domInputWrap.appendChild( domCheckboxOptionLabel );
						}
						domCheckboxList.appendChild( domInputWrap );

						customSelect.bindEventLink( domCheckboxOptionInput, domOptions, customSelectStyle.dropdown );

					} );
					customSelect.addToDom( domSelect, domCheckboxList, objOptions );
				} );

				if ( boolInit === true && objOptions.observe === true ) {
					customSelect.bindListener( domParent );
				}

			},
			addToDom: ( domSelect, domCheckboxList, objOptions ) => {
				const domParent = domSelect.parentNode;
				let domCheckboxWrapper = customSelect.utils.createElement( 'div', 'custom-checkbox-list-container' );
				domSelect.classList.add( customSelect.settings.added );
				domSelect.style.display = 'none';
				domCheckboxWrapper.appendChild( domSelect );
				domCheckboxWrapper.appendChild( domCheckboxList );
				domParent.appendChild( domCheckboxWrapper );
				customSelect.triggerInitialState( domCheckboxWrapper );
			},
			triggerInitialState: ( domCheckboxWrapper ) => {
				const preCheckedElements = domCheckboxWrapper.querySelectorAll( 'input:checked' );
				if ( preCheckedElements.length > 0 ) {
					const changeEvent = new Event( 'change' );
					preCheckedElements.forEach( ( domInput ) => {
						domInput.dispatchEvent( changeEvent );
					} );


				}
			}
		};
		customSelect.init();
	};
}( jQuery ) );