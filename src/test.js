var test = {
	insertMulti: () => {
		var select = document.createElement( 'select' );
		select.multiple = true;
		select.dataset.role = 'custom-multiselect';
		var option = document.createElement( 'option' );
		option.value = 1;
		option.textContent = 'sdf';
		select.appendChild( option );
		jQuery( '.customselect-parent-node' ).append( select );
	},
	insertHbs: () => {
		var template = Handlebars.compile( '<div><select multiple data-dropdown="true"><option value="test1">test 1</option><option value="test2">test 3</option><<option value="test">test 6</option>/select></div' );
		jQuery( '.hbs-container' ).html( template() );
	}

}