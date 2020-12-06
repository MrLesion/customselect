const customSelect = {
	settings: {
		types: [ 'select-multiple', 'select-one' ],
		added: 'custom-select-added',
		updateEvents: [ 'DOMNodeInserted' ]
	},
	options: {
		labelPosition: 'after', // 'wrap', 'before', 'after'
		style: 'list', //none
		selector: 'select[data-role="custom-multiselect"], select[data-role="custom-select"]',
		observe: true

	},
	utils: {
		getRandomString: ( intLength ) => {
			let result = '';
			const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			const charactersLength = characters.length;
			for ( var i = 0; i < intLength; i++ ) {
				result += characters.charAt( Math.floor( Math.random() * charactersLength ) );
			}
			return result;
		},
		createElement: ( strType, strClassName = '' ) => {
			let domElement = document.createElement( strType );
			domElement.className = strClassName;
			return domElement;
		}
	},
	init: ( objExtendOptions = {} ) => {
		const objOptions = Object.assign( customSelect.options, objExtendOptions );
		customSelect.convert( objOptions );
	},
	convert: ( objOptions, boolInit ) => {
		const domElements = document.querySelectorAll( objOptions.selector );
		if ( domElements.length > 0 ) {
			const domElementsFiltered = Array.from( domElements ).filter( elem => elem.className.indexOf( customSelect.settings.added ) === -1 );
			if ( domElementsFiltered.length > 0 ) {
				if ( boolInit === true && objOptions.observe === true ) {
					customSelect.bindListener( objOptions );
				}

				customSelect.build( domElementsFiltered, objOptions );
			}
		}
	},
	bindListener: ( objOptions ) => {

		document.addEventListener( customSelect.settings.updateEvents.join( ' ' ), ( event ) => {
			let appendedElementsMatchedSelector = event.target.querySelector( objOptions.selector );
			if ( event.target.matches( objOptions.selector ) ) {
				appendedElementsMatchedSelector = event.target;
			}
			if ( appendedElementsMatchedSelector !== null && appendedElementsMatchedSelector.length > 0 ) {
				if ( appendedElementsMatchedSelector.className.indexOf( customSelect.settings.added ) === -1 ) {
					customSelect.convert( objOptions );
				}
			}
		} );
	},
	bindEventLink: ( domCheckboxOptionInput, domOptions ) => {
		domCheckboxOptionInput.addEventListener( 'change', ( event ) => {
			domOptions.find( o => o.value === event.target.value ).selected = event.target.checked;
		} );
	},
	build: ( domElements, objOptions ) => {
		domElements.forEach( ( domMultiSelect ) => {
			const customSelectType = domMultiSelect.type;
			let customSelectName = '';

			if ( customSelect.settings.types.indexOf( customSelectType ) === -1 ) {
				console.error( customSelectType + ' is not a valid selector for customselect' );
				return false;
			}

			if ( customSelectType === 'select-one' ) {
				customSelectName = customSelect.utils.getRandomString( 20 );
			}

			const domOptions = Array.from( domMultiSelect.options );
			const selectedOptions = domOptions.filter( o => o.selected );


			if ( selectedOptions.length === 0 && customSelectType === 'select-one' ) {
				domOptions[ 0 ].selected = true;
			}

			let domCheckboxList = customSelect.utils.createElement( objOptions.style === 'list' ? 'ul' : 'div', 'custom-checkbox-list' );

			domOptions.forEach( ( domOption ) => {
				let domCheckboxOptionInput = customSelect.utils.createElement( 'input', 'custom-checkbox-list-input' );
				const id = customSelect.utils.getRandomString( 20 );
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
			customSelect.addToDom( domMultiSelect, domCheckboxList, objOptions );
		} );
	},
	addToDom: ( domMultiSelect, domCheckboxList, objOptions ) => {
		const domParent = domMultiSelect.parentNode;
		let domCheckboxWrapper = customSelect.utils.createElement( 'div', 'custom-checkbox-list-container' );
		domMultiSelect.classList.add( customSelect.settings.added );
		domMultiSelect.style.display = 'none';

		domCheckboxWrapper.appendChild( domMultiSelect );
		domCheckboxWrapper.appendChild( domCheckboxList );

		domParent.appendChild( domCheckboxWrapper );
	}
};