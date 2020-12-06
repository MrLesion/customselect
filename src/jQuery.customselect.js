( function ( $ ) {
	$.fn.customselect = function ( options ) {
		const jSelector = this;
		const objOptions = $.extend( {
			labelPosition: 'after', // 'wrap', 'before', 'after'
			style: 'list', //none
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
				}
			},
			init: () => {
				jSelector.each( ( index, domParent ) => {
					customSelect.convert( domParent, true );
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
								let appendedElementsMatchedSelector = newNode.querySelector( 'select' );
								if ( newNode.matches( 'select' ) ) {
									appendedElementsMatchedSelector = newNode;
								}
								if ( appendedElementsMatchedSelector !== null && appendedElementsMatchedSelector.length > 0 ) {
									if ( appendedElementsMatchedSelector.className.indexOf( customSelect.settings.added ) === -1 ) {
										customSelect.convert( domParent, false );
									}
								}
							} );
						}
					} );
				} );
				var config = {
					childList: true,
					attributes: false,
					subtree: true,
					characterData: false
				};
				var targetNode = domParent;
				observer.observe( targetNode, config );
			},
			bindEventLink: ( domCheckboxOptionInput, domOptions ) => {
				domCheckboxOptionInput.addEventListener( 'change', ( event ) => {
					domOptions.find( o => o.value === event.target.value ).selected = event.target.checked;
				} );
			},
			build: ( domParent, boolInit ) => {
				const domSelects = domParent.querySelectorAll( 'select' );

				if ( domSelects === null ) {
					return false;
				}

				domSelects.forEach( ( domSelect ) => {

					const customSelectType = domSelect.type;
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

					let domCheckboxList = customSelect.utils.createElement( objOptions.style === 'list' ? 'ul' : 'div', 'custom-checkbox-list' );

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

						let domInputWrap = customSelect.utils.createElement( objOptions.style === 'list' ? 'li' : 'div', 'custom-checkbox-list-input-item' );

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

						customSelect.bindEventLink( domCheckboxOptionInput, domOptions );

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
			}
		};
		customSelect.init();
	};
}( jQuery ) );