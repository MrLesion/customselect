# jQuery Custom Select

Small plugin to convert selects/multi-selects to lists of radio-inputs / checkbox-inputs with change events and observer for dynamically added markup

## Features
* Converts any normal select into a list of radio-inputs
* Converts any multi select into a list of checkbox-inputs
* Add dropdown functionality
* Observe dynamically added markup, to bind them on the fly

## Usage
Bind on any parent element of one or more select-element(s)
```javascript
// Bind on parent width default settings
jQuery('select').customselect();

// or with custom settings
jQuery('.top-container-containing-the-selects').customselect({
    labelPosition: 'before',
    observe: false,
    emptyText: 'Please select option'
});
```

## Options

All options are available at initialization and by data-attributes on the selects

| Key                       | Default             					| Values                     				|  Description                                                                  |
| --------------------------|---------------------------------------|-------------------------------------------|-------------------------------------------------------------------------------|
| labelPosition             | `after`             					| `after`, `before`, `wrap`  				| Position of the label - `wrap` wraps the input in the label  				    |
| style            			| `list`              					| `list`, `none` 							| Style of the select option - `list` = ul=>li - `none` = div => div            |
| classList            		|               						| String									| Classes to add to the custom selects            								|
| parentNode            	| `null`              					| Selector									| Top most selector to watch for changes            							|
| observe                   | `true`              					| Boolean                    				| Use Mutation Observer to watch for dynamically added markup                   |
| dropdown                  | `false`              					| Boolean                    				| Convert to dropdown (using Bootstrap custom-select css)                       |
| selectors                 | `['select-multiple', 'select-one']`   | Array['select-multiple', 'select-one']    | Narrow down to either select-one, melect-multiple or both                     |
| emptyText         		| `Nothing selected`  					| String                     				| Empty text for dropdown placeholder                                           |
| selectedText      		| `selected`          					| String                     				| Selected postfix for multi-dropdown placeholder                               |
| allSelectedText   		| `All selected`      					| String                     				| All selected text for multi-dropdown placeholder 							    |
| selectedDelimiter   		| `|`      								| String                     				| The delimiter for selected options in multi select					        |
| selectedLimit   			| `3`      								| Number                     				| Max selected options in multi select, before truncate					        |

## License
[MIT](https://choosealicense.com/licenses/mit/)