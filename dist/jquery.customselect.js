"use strict";

/*! https://github.com/MrLesion/customselect v1.1.0 by @MrLesion */
(function ($) {
  $.fn.customselect = function (options) {
    var objOptions = {};
    var customSelect = {
      _events: {},
      constants: {
        added: 'customselect-added'
      },
      utils: {
        parseBool: function parseBool(strBool) {
          var bool;

          if (typeof strBool === 'boolean') {
            return strBool;
          }

          bool = function () {
            switch (false) {
              case strBool.toLowerCase() !== 'true':
                return true;

              case strBool.toLowerCase() !== 'false':
                return false;
            }
          }();

          if (typeof bool === 'boolean') {
            return bool;
          }

          return void 0;
        },
        getCustomSelectID: function getCustomSelectID(intLength) {
          var result = '';
          var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          var charactersLength = characters.length;

          for (var i = 0; i < intLength; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
          }

          return result;
        },
        createElement: function createElement(strType) {
          var strClassName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
          var domElement = document.createElement(strType);
          domElement.className = strClassName;
          return domElement;
        },
        getSelectStyle: function getSelectStyle(strSelectType, objDataOptions) {
          var returnObj = {
            list: 'div',
            item: 'div',
            type: strSelectType
          };

          if (objDataOptions.style === 'list') {
            returnObj.list = 'ul';
            returnObj.item = 'li';
          }

          return returnObj;
        },
        getObserverSelector: function getObserverSelector(objDataOptions) {
          var domSelector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
          var domSelect = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
          var parentNodeToWatch = null;

          if (objDataOptions.parentNode !== null) {
            parentNodeToWatch = document.querySelector(objDataOptions.parentNode);
          } else if (domSelector !== null) {
            parentNodeToWatch = domSelector;
          } else {
            parentNodeToWatch = domSelect.parentNode;
          }

          return parentNodeToWatch;
        },
        createCustomEvents: function createCustomEvents(strEventTypes) {
          var arrEventTypes = strEventTypes.split(' ');
          arrEventTypes.forEach(function (strEventType) {
            var event = new Event(strEventType);
            customSelect._events[strEventType] = event;
          });
        },
        triggerCustomEvent: function triggerCustomEvent(domTarget, strEventType) {
          var event = customSelect._events[strEventType];

          if (event) {
            domTarget.dispatchEvent(event);
          }
        },
        triggerEvent: function triggerEvent(domTargets, strTriggerEvent) {
          var event = new Event(strTriggerEvent);

          if (domTargets instanceof NodeList) {
            domTargets.forEach(function (domTarget) {
              domTarget.dispatchEvent(event);
            });
          } else {
            domTargets.dispatchEvent(event);
          }
        }
      },
      init: function init(arrDomSelectors) {
        Array.from(arrDomSelectors).forEach(function (domSelector) {
          customSelect.buildDomList(domSelector, true);
        });
        customSelect.utils.createCustomEvents('dropdown.open dropdown.close list.builded observer.addedNodes');
      },
      dropdown: {
        bindEvents: function bindEvents(domCheckboxList) {
          var domCheckBoxListDropDown = document.getElementById(domCheckboxList.id);
          domCheckBoxListDropDown.addEventListener('click', function (event) {
            if (event.target.className.indexOf('customselect-search-input') > -1) {
              return false;
            }

            var domDropdown = event.target.closest('.customselect-dropdown');
            customSelect.dropdown.closeAll(domDropdown);
            customSelect.dropdown.toggle(domDropdown);
          });
          document.addEventListener('click', function (event) {
            var hasDropDownParent = event.target.closest('.customselect-dropdown') !== null;

            if (hasDropDownParent === false) {
              customSelect.dropdown.closeAll();
            }
          });
          domCheckBoxListDropDown.addEventListener('dropdown.close', function (event) {
            var searchItem = event.target.querySelector('.customselect-search-item');

            if (searchItem !== null) {
              var domSearchInput = searchItem.querySelector('.customselect-search-input');
              domSearchInput.value = '';
              customSelect.utils.triggerEvent(domSearchInput, 'input');
            }
          });
        },
        closeAll: function closeAll(domCurrentDropdown) {
          var domAllDropdowns = document.querySelectorAll('.customselect-dropdown');
          Array.from(domAllDropdowns).filter(function (d) {
            return d !== domCurrentDropdown;
          }).forEach(function (domDropdown) {
            customSelect.utils.triggerCustomEvent(domDropdown, 'dropdown.close');
            domDropdown.classList.remove('open');
          });
        },
        toggle: function toggle(domDropdown) {
          if (domDropdown.className.indexOf('open') > -1) {
            domDropdown.classList.remove('open');
            customSelect.utils.triggerCustomEvent(domDropdown, 'dropdown.close');
          } else {
            domDropdown.classList.add('open');
            customSelect.utils.triggerCustomEvent(domDropdown, 'dropdown.open');
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
        bind: function bind(domSelector) {
          var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
              customSelect.observer.callback(mutation, domSelector);
            });
          });

          if (domSelector.nodeType === 1) {
            observer.observe(domSelector, customSelect.observer.config);
          }
        },
        callback: function callback(mutation, domSelector) {
          if (mutation.addedNodes !== null) {
            mutation.addedNodes.forEach(function (newNode) {
              if (newNode.nodeType === 1) {
                var appendedElementsMatchedSelector = newNode.querySelector('select');

                if (newNode.matches('select')) {
                  appendedElementsMatchedSelector = newNode;
                }

                if (appendedElementsMatchedSelector !== null && appendedElementsMatchedSelector.length > 0) {
                  if (appendedElementsMatchedSelector.className.indexOf(customSelect.constants.added) === -1) {
                    customSelect.buildDomList(domSelector, false);
                  }
                }

                customSelect.utils.triggerCustomEvent(domSelector, 'observer.addedNodes');
              }
            });
          }
        }
      },
      search: {
        build: function build(objSelectStyle, objDataOptions) {
          var domSearchOption = customSelect.utils.createElement(objSelectStyle.item, 'customselect-list-input-item customselect-search-item');
          var domSearchInput = customSelect.utils.createElement('input', 'customselect-search-input');
          domSearchInput.type = 'search';
          domSearchInput.placeholder = objDataOptions.searchText;
          domSearchOption.appendChild(domSearchInput);
          return domSearchOption;
        },
        bindEvents: function bindEvents(domCheckboxList) {
          var domSearchInput = domCheckboxList.querySelector('.customselect-search-input');
          domSearchInput.addEventListener('input', function (event) {
            var strQuery = event.target.value.toLowerCase();
            customSelect.search.query(strQuery, domCheckboxList);
          });
        },
        query: function query(strQuery, domCheckboxList) {
          var items = Array.from(domCheckboxList.querySelectorAll('.customselect-list-input-item'));

          if (strQuery.length > 0) {
            domCheckboxList.classList.add('searching');
            items.forEach(function (item) {
              var input = item.querySelector('.customselect-list-input');
              var label = item.querySelector('.customselect-list-label');

              if (input !== null && label !== null) {
                if (input.value.toLowerCase().indexOf(strQuery) > -1 || label.innerText.toLowerCase().indexOf(strQuery) > -1) {
                  item.classList.add('match');
                } else {
                  item.classList.remove('match');
                }
              }
            });
          } else {
            domCheckboxList.classList.remove('searching');
            items.forEach(function (item) {
              item.classList.remove('match');
            });
          }
        }
      },
      reset: {
        build: function build(objSelectStyle, objDataOptions) {
          var domSearchInput = customSelect.utils.createElement('input', 'customselect-reset-input');
          var strCustomSelectID = customSelect.utils.getCustomSelectID(20);
          domSearchInput.type = 'checkbox';
          domSearchInput.id = strCustomSelectID;
          var domResetLabel = customSelect.utils.createElement('label', 'customselect-list-label');
          domResetLabel.innerText = objDataOptions.resetText;
          domResetLabel.htmlFor = strCustomSelectID;
          var domInputGroup = customSelect.buildLabel(objDataOptions.labelPosition, domSearchInput, domResetLabel, objSelectStyle);
          domInputGroup.classList.add('customselect-reset-item');
          return domInputGroup;
        },
        bindEvents: function bindEvents(domCheckboxList, objDataOptions) {
          var resetOption = domCheckboxList.querySelector('.customselect-reset-input');
          var allOptions = Array.from(domCheckboxList.querySelectorAll('.customselect-list-input'));
          var hasDefault = allOptions.filter(function (o) {
            return o.checked;
          }).length > 0;

          if (hasDefault === false) {
            resetOption.checked = true;

            if (allOptions.length === 0) {
              var selectedTextNode = domCheckboxList.querySelector('.customselect-dropdown-text');
              selectedTextNode.innerText = objDataOptions.emptyText;
            }
          }

          if (resetOption !== null) {
            resetOption.addEventListener('click', function (event) {
              event.target.checked = true;
              allOptions.forEach(function (domInput) {
                domInput.checked = false;
                customSelect.utils.triggerEvent(domInput, 'change');
              });
            });
          }
        }
      },
      bindSelect: function bindSelect(domSelect, domCheckboxList) {
        domSelect.onchange = function (event) {
          var selectedOptions = Array.from(event.target.options).filter(function (o) {
            return o.selected;
          });
          Array.from(domCheckboxList.querySelectorAll('.customselect-list-input:checked')).forEach(function (domInput) {
            domInput.checked = false;
          });
          selectedOptions.forEach(function (selectedOption) {
            var domCustomInput = domCheckboxList.querySelector('.customselect-list-input[value="' + selectedOption.value + '"]');
            domCustomInput.checked = true;
            customSelect.utils.triggerEvent(domCustomInput, 'change');
          });
        };
      },
      bindInput: function bindInput(domCheckboxOptionInput, domOptions, objSelectStyle, objDataOptions) {
        domCheckboxOptionInput.addEventListener('change', function (event) {
          var domSelectOption = domOptions.filter(function (o) {
            return o.value === event.target.value;
          })[0];
          domSelectOption.selected = event.target.checked;

          if (customSelect.utils.parseBool(objDataOptions.dropdown) === true) {
            var domDropdown = domCheckboxOptionInput.closest('.customselect-dropdown');
            var selectedOptions = domOptions.filter(function (o) {
              return o.selected === true;
            });
            var selectedTextNode = domDropdown.querySelector('.customselect-dropdown-text');

            if (selectedOptions.length === 0) {
              if (customSelect.utils.parseBool(objDataOptions.reset) === true) {
                if (selectedOptions.length > 0) {
                  selectedTextNode.innerText = objDataOptions.resetText;
                } else {
                  selectedTextNode.innerText = objDataOptions.emptyText;
                }
              } else {
                selectedTextNode.innerText = objDataOptions.emptyText;
              }
            } else {
              var selectedOptionsText = selectedOptions.map(function (o) {
                return o.textContent;
              }).filter(function (v) {
                return v;
              }).join(objDataOptions.selectedDelimiter);

              if (selectedOptions.length > objDataOptions.selectedLimit && selectedOptions.length < domOptions.length) {
                selectedOptionsText = selectedOptions.length + ' ' + objDataOptions.selectedText;
              } else if (selectedOptions.length === domOptions.length) {
                selectedOptionsText = objDataOptions.allSelectedText;
              }

              selectedTextNode.innerText = selectedOptionsText;
            }

            if (objSelectStyle.type === 'select-one') {
              domDropdown.classList.remove('open');
            }
          }

          if (customSelect.utils.parseBool(objDataOptions.reset) === true) {
            var domList = domCheckboxOptionInput.closest('.customselect-list');
            var allOptions = Array.from(domList.querySelectorAll('.customselect-list-input'));
            var resetOption = domList.querySelector('.customselect-reset-input');
            resetOption.checked = allOptions.filter(function (o) {
              return o.checked;
            }).length === 0;
          }

          if (typeof objDataOptions.onChange === 'function') {
            objDataOptions.onChange(event.target, domSelectOption.closest('select'));
          }
        });
      },
      bindByElement: function bindByElement(domSelect) {
        var boolInit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var domSelector = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        if (domSelect.className.indexOf(customSelect.constants.added) > -1) {
          return false;
        }

        var customSelectID = customSelect.utils.getCustomSelectID(20);
        var dataOptions = domSelect.dataset;
        var objDataOptions = Object.assign({}, objOptions);
        objDataOptions = Object.assign(objDataOptions, dataOptions);
        var objSelectStyle = customSelect.utils.getSelectStyle(domSelect.type, objDataOptions);
        var domOptions = Array.from(domSelect.children);
        var selectedOptions = domOptions.filter(function (o) {
          return o.selected;
        });
        domSelect.dataset.customselectDataId = customSelectID;

        if (objDataOptions.targetTypes.indexOf(objSelectStyle.type) === -1) {
          console.warn(objSelectStyle.type + ' is not a valid selector for customselect');
          return false;
        }

        if (selectedOptions.length === 0 && objSelectStyle.type === 'select-one') {
          domOptions[0].selected = true;
        }

        var domCheckboxList = customSelect.utils.createElement(objSelectStyle.list, 'customselect-list ' + objDataOptions.classList);
        domCheckboxList.id = customSelectID;
        domCheckboxList.dataset.placeholder = objDataOptions.emptyText;
        domCheckboxList.dataset.type = objSelectStyle.type;

        if (customSelect.utils.parseBool(objDataOptions.dropdown) === true) {
          domCheckboxList.classList.add('customselect-dropdown');
          var domSelectedOption = customSelect.utils.createElement(objSelectStyle.item, 'customselect-list-input-item customselect-dropdown-text');
          domCheckboxList.appendChild(domSelectedOption);
        }

        if (customSelect.utils.parseBool(objDataOptions.search) === true) {
          domCheckboxList.classList.add('customselect-search');
          var domSearchListInput = customSelect.search.build(objSelectStyle, objDataOptions);
          domCheckboxList.appendChild(domSearchListInput);
        }

        if (customSelect.utils.parseBool(objDataOptions.reset) === true) {
          var domResetListInput = customSelect.reset.build(objSelectStyle, objDataOptions);
          domCheckboxList.appendChild(domResetListInput);
        }

        domOptions.forEach(function (domOption) {
          if (domOption.nodeName === 'OPTGROUP') {
            var domOptgroup = customSelect.buildDomOptGroup(domOption, customSelectID, objSelectStyle, objDataOptions);
            domCheckboxList.appendChild(domOptgroup);
          } else if (domOption.nodeName === 'OPTION') {
            var buildedOption = customSelect.buildDomOption(domOption, customSelectID, objSelectStyle, objDataOptions);
            domCheckboxList.appendChild(buildedOption.domInputGroup);
            customSelect.bindInput(buildedOption.domCheckboxOptionInput, domOptions, objSelectStyle, objDataOptions);
          }
        });
        customSelect.addToDom(domSelect, domCheckboxList, objDataOptions);

        if (boolInit === true && customSelect.utils.parseBool(objDataOptions.observe) === true) {
          var parentNodeToWatch = customSelect.utils.getObserverSelector(objOptions, domSelector, domSelect);
          customSelect.observer.bind(parentNodeToWatch);
        }
      },
      bindByParent: function bindByParent(domSelector, boolInit) {
        var domAllSelects = Array.from(domSelector.querySelectorAll('select'));
        var domSelects = domAllSelects.filter(function (s) {
          return objOptions.targetTypes.indexOf(s.type) > -1;
        });

        if (domSelects.length === 0) {
          if (boolInit === true && customSelect.utils.parseBool(objOptions.observe) === true) {
            var parentNodeToWatch = customSelect.utils.getObserverSelector(objOptions, domSelector);
            customSelect.observer.bind(parentNodeToWatch);
          }

          return false;
        }

        domSelects.forEach(function (domSelect) {
          customSelect.bindByElement(domSelect, true, domSelector);
        });
      },
      buildDomList: function buildDomList(domSelector, boolInit) {
        if (objOptions.targetTypes.indexOf(domSelector.type) === -1) {
          customSelect.bindByParent(domSelector, boolInit);
        } else {
          customSelect.bindByElement(domSelector, boolInit);
        }
      },
      buildDomOptGroup: function buildDomOptGroup(domOption, customSelectID, objSelectStyle, objDataOptions) {
        var nestedList = customSelect.utils.createElement(objSelectStyle.list, 'customselect-optgroup');
        var nestedListLabel = customSelect.utils.createElement(objSelectStyle.item, 'customselect-optgroup-label');
        nestedListLabel.innerText = domOption.label;
        nestedList.appendChild(nestedListLabel);
        var optGroupOptions = Array.from(domOption.children);
        optGroupOptions.forEach(function (domNestedOption) {
          var buildedOption = customSelect.buildDomOption(domNestedOption, customSelectID, objSelectStyle, objDataOptions);
          nestedList.appendChild(buildedOption.domInputGroup);
          customSelect.bindInput(buildedOption.domCheckboxOptionInput, optGroupOptions, objSelectStyle, objDataOptions);
        });
        return nestedList;
      },
      buildDomOption: function buildDomOption(domOption, customSelectID, objSelectStyle, objDataOptions) {
        var domCheckboxOptionInput = customSelect.utils.createElement('input', 'customselect-list-input');
        var strCustomSelectName = '';
        var strId = customSelect.utils.getCustomSelectID(20);
        domCheckboxOptionInput.type = objSelectStyle.type === 'select-one' ? 'radio' : 'checkbox';
        domCheckboxOptionInput.value = domOption.value;
        domCheckboxOptionInput.id = strId;
        domCheckboxOptionInput.checked = domOption.selected;

        if (objSelectStyle.type === 'select-one') {
          strCustomSelectName = customSelectID;
          domCheckboxOptionInput.name = strCustomSelectName;
        }

        var domCheckboxOptionLabel = customSelect.utils.createElement('label', 'customselect-list-label');
        domCheckboxOptionLabel.innerText = domOption.text;
        domCheckboxOptionLabel.htmlFor = strId;
        var domInputGroup = customSelect.buildLabel(objDataOptions.labelPosition, domCheckboxOptionInput, domCheckboxOptionLabel, objSelectStyle);

        if (domOption.disabled) {
          domOption.classList.add('disabled');
        }

        if (domOption.classList.length > 0) {
          domOption.classList.forEach(function (className) {
            domInputGroup.classList.add(className);
          });
        }

        return {
          domCheckboxOptionInput: domCheckboxOptionInput,
          domInputGroup: domInputGroup
        };
      },
      buildLabel: function buildLabel(strLabelPosition, domCheckboxOptionInput, domCheckboxOptionLabel, objSelectStyle) {
        var domInputWrapElement = customSelect.utils.createElement(objSelectStyle.item, 'customselect-list-input-item');

        if (strLabelPosition === 'before') {
          domInputWrapElement.appendChild(domCheckboxOptionLabel);
          domInputWrapElement.appendChild(domCheckboxOptionInput);
        } else if (strLabelPosition === 'after') {
          domInputWrapElement.appendChild(domCheckboxOptionInput);
          domInputWrapElement.appendChild(domCheckboxOptionLabel);
        } else {
          domCheckboxOptionLabel.appendChild(domCheckboxOptionInput);
          domInputWrapElement.appendChild(domCheckboxOptionLabel);
        }

        return domInputWrapElement;
      },
      destroyDomList: function destroyDomList(domSelector) {
        var customSelectId = domSelector.dataset.customselectDataId;
        var customSelectList = document.getElementById(customSelectId);

        if (customSelectList !== null) {
          customSelectList.parentNode.removeChild(customSelectList);
          domSelector.classList.remove(customSelect.constants.added);
        }
      },
      addToDom: function addToDom(domSelect, domCheckboxList, objDataOptions) {
        var domParent = domSelect.parentNode;
        var domCheckboxWrapper = customSelect.utils.createElement('div', 'customselect-list-container');
        domSelect.classList.add(customSelect.constants.added);
        domCheckboxWrapper.appendChild(domSelect);
        domCheckboxWrapper.appendChild(domCheckboxList);
        domParent.appendChild(domCheckboxWrapper);
        customSelect.triggerInitialState(domCheckboxWrapper);

        if (customSelect.utils.parseBool(objDataOptions.dropdown) === true) {
          customSelect.dropdown.bindEvents(domCheckboxList);
        }

        if (customSelect.utils.parseBool(objDataOptions.search) === true) {
          customSelect.search.bindEvents(domCheckboxList);
        }

        if (customSelect.utils.parseBool(objDataOptions.reset) === true) {
          customSelect.reset.bindEvents(domCheckboxList, objDataOptions);
        }

        customSelect.bindSelect(domSelect, domCheckboxList);
        customSelect.utils.triggerCustomEvent(domCheckboxList, 'list.builded');
      },
      triggerInitialState: function triggerInitialState(domCheckboxWrapper) {
        var preCheckedElements = domCheckboxWrapper.querySelectorAll('input');

        if (preCheckedElements.length > 0) {
          customSelect.utils.triggerEvent(preCheckedElements, 'change');
        }
      }
    };

    if (typeof options === 'string') {
      if (typeof $.fn.customselect["public"][options] === 'function') {
        return $.fn.customselect["public"][options](this, customSelect);
      }
    }

    objOptions = $.extend({}, $.fn.customselect.defaults, options);
    customSelect.init(this);
    return this;
  };

  $.fn.customselect["public"] = {
    destroy: function destroy(arrDomSelectors, customSelect) {
      Array.from(arrDomSelectors).forEach(function (domSelector) {
        customSelect.destroyDomList(domSelector);
      });
    }
  };
  $.fn.customselect.defaults = {
    labelPosition: 'after',
    style: 'list',
    dropdown: false,
    search: false,
    reset: false,
    classList: '',
    targetTypes: ['select-multiple', 'select-one'],
    parentNode: null,
    observe: true,
    selectedLimit: 3,
    selectedDelimiter: ' | ',
    emptyText: 'Nothing selected',
    selectedText: 'selected',
    allSelectedText: 'All selected',
    searchText: 'Search options',
    resetText: 'All',
    onChange: null
  };
})(jQuery);
;(function () {
				/*! http://mths.be/array-from v0.2.0 by @mathias */
if (!Array.from) {
	(function() {
		'use strict';
		var defineProperty = (function() {
			// IE 8 only supports `Object.defineProperty` on DOM elements.
			try {
				var object = {};
				var $defineProperty = Object.defineProperty;
				var result = $defineProperty(object, object, object) && $defineProperty;
			} catch(error) {}
			return result || function put(object, key, descriptor) {
				object[key] = descriptor.value;
			};
		}());
		var toStr = Object.prototype.toString;
		var isCallable = function(fn) {
			// In a perfect world, the `typeof` check would be sufficient. However,
			// in Chrome 1–12, `typeof /x/ == 'object'`, and in IE 6–8
			// `typeof alert == 'object'` and similar for other host objects.
			return typeof fn == 'function' || toStr.call(fn) == '[object Function]';
		};
		var toInteger = function(value) {
			var number = Number(value);
			if (isNaN(number)) {
				return 0;
			}
			if (number == 0 || !isFinite(number)) {
				return number;
			}
			return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
		};
		var maxSafeInteger = Math.pow(2, 53) - 1;
		var toLength = function(value) {
			var len = toInteger(value);
			return Math.min(Math.max(len, 0), maxSafeInteger);
		};
		var from = function(arrayLike) {
			var C = this;
			if (arrayLike == null) {
				throw new TypeError('`Array.from` requires an array-like object, not `null` or `undefined`');
			}
			var items = Object(arrayLike);
			var mapping = arguments.length > 1;

			var mapFn, T;
			if (arguments.length > 1) {
				mapFn = arguments[1];
				if (!isCallable(mapFn)) {
					throw new TypeError('When provided, the second argument to `Array.from` must be a function');
				}
				if (arguments.length > 2) {
					T = arguments[2];
				}
			}

			var len = toLength(items.length);
			var A = isCallable(C) ? Object(new C(len)) : new Array(len);
			var k = 0;
			var kValue, mappedValue;
			while (k < len) {
				kValue = items[k];
				if (mapFn) {
					mappedValue = typeof T == 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
				} else {
					mappedValue = kValue;
				}
				defineProperty(A, k, {
					'value': mappedValue,
					'configurable': true,
					'enumerable': true
				});
				++k;
			}
			A.length = len;
			return A;
		};
		defineProperty(Array, 'from', {
			'value': from,
			'configurable': true,
			'writable': true
		});
	}());
}

			}.call(
				typeof window === 'object' && window ||
				typeof self   === 'object' && self   ||
				typeof global === 'object' && global ||
				{}
			));