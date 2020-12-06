var test = {
	insertMulti: function(){
		var select = document.createElement('select');
		select.multiple = true;
		select.dataset.role = 'custom-multiselect';
		var option = document.createElement('option');
		option.value = 1;
		option.textContent = 'sdf';
		select.appendChild(option);
		jQuery('.customselect-parent-node').append(select);
	}

}