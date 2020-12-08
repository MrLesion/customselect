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
		// compile the template
		var template = Handlebars.compile( '<select multiple><option value="test1">test 1</option><option value="test2">test 3</option><<option value="test">test 6</option>/select>' );
		jQuery( '.hbs-container' ).html( template() );
	}

}