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
jQuery('.element-containing-selects').customselect();

// or with custom settings
jQuery('.element-containing-selects').customselect({
    labelPosition: 'before',
    observe: false,
    dropdownEmptyText: 'Please select option'
});
```

## Options
| Key                       | Default             					| Values                     				|  Description                                                                  |
| --------------------------|---------------------------------------|-------------------------------------------|-------------------------------------------------------------------------------|
| labelPosition             | `after`             					| `after`, `before`, `wrap`  				| Position of the label - `wrap` wraps the input in the label  				    |
| style            			| `list`              					| `list`, `dropdown`, `none` 				| Style of the select option                                                    |
| observe                   | `true`              					| Boolean                    				| Use Mutation Observer to watch for dynamically added markup                   |
| selectors                 | `['select-multiple', 'select-one']`   | Array['select-multiple', 'select-one']    | Narrow down to either select-one, melect-multiple or both                     |
| dropdownEmptyText         | `Nothing selected`  					| String                     				| Empty text for dropdown placeholder                                           |
| dropdownSelectedText      | `selected`          					| String                     				| Selected postfix for multi-dropdown placeholder                               |
| dropdownAllSelectedText   | `All selected`      					| String                     				| All selected text for multi-dropdown placeholder 							    |

## License
[MIT](https://choosealicense.com/licenses/mit/)