"use strict";

(function ($) {
  $.fn.customselect = function (options) {
    var objOptions = $.extend({}, $.fn.customselect.defaults, options);
    var customSelect = {
      settings: {
        added: 'custom-select-added'
      },
      utils: {
        tryParseBool: function tryParseBool(strBool) {
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
        getSelectStyle: function getSelectStyle(customSelectType, objDataOptions) {
          var returnObj = {
            list: 'div',
            item: 'div',
            type: customSelectType,
            dropdown: customSelect.utils.tryParseBool(objDataOptions.dropdown)
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
        delegate: function delegate(event, selector, fnCallback) {
          document.addEventListener(event, function (e) {
            for (var target = e.target; target && target !== this; target = target.parentNode) {
              if (target.matches(selector)) {
                fnCallback.call(target, e);
                break;
              }
            }
          }, false);
        }
      },
      init: function init(arrDomSelectors) {
        Array.from(arrDomSelectors).forEach(function (domSelector) {
          customSelect.buildDomList(domSelector, true);
        });
      },
      dropdown: {
        bindEvents: function bindEvents(domCheckboxList) {
          var domCheckBoxListDropDown = document.getElementById(domCheckboxList.id);
          domCheckBoxListDropDown.addEventListener('click', function (event) {
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
        },
        closeAll: function closeAll(currentDomDropdown) {
          var documentDropdowns = document.querySelectorAll('.customselect-dropdown');
          Array.from(documentDropdowns).filter(function (d) {
            return d !== currentDomDropdown;
          }).forEach(function (domDropdown) {
            domDropdown.classList.remove('open');
          });
        },
        toggle: function toggle(domDropdown) {
          if (domDropdown.className.indexOf('open') > -1) {
            domDropdown.classList.remove('open');
          } else {
            domDropdown.classList.add('open');
          }
        }
      },
      bindObserver: function bindObserver(domSelector) {
        var observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            var newNodes = mutation.addedNodes;

            if (newNodes !== null) {
              newNodes.forEach(function (newNode) {
                if (newNode.nodeType === 1) {
                  var appendedElementsMatchedSelector = newNode.querySelector('select');

                  if (newNode.matches('select')) {
                    appendedElementsMatchedSelector = newNode;
                  }

                  if (appendedElementsMatchedSelector !== null && appendedElementsMatchedSelector.length > 0) {
                    if (appendedElementsMatchedSelector.className.indexOf(customSelect.settings.added) === -1) {
                      customSelect.buildDomList(domSelector, false);
                    }
                  }
                }
              });
            }
          });
        });
        var config = {
          childList: true,
          attributes: false,
          subtree: true,
          characterData: false
        };

        if (domSelector.nodeType === 1) {
          observer.observe(domSelector, config);
        }
      },
      bindEventLink: function bindEventLink(domCheckboxOptionInput, domOptions, customSelectStyle, objDataOptions) {
        domCheckboxOptionInput.addEventListener('change', function (event) {
          domOptions.find(function (o) {
            return o.value === event.target.value;
          }).selected = event.target.checked;

          if (customSelect.utils.tryParseBool(customSelectStyle.dropdown) === true) {
            var domDropdown = domCheckboxOptionInput.closest('.customselect-dropdown');
            var selectedOptions = domOptions.filter(function (o) {
              return o.selected === true;
            });
            var selectedTextNode = domDropdown.querySelector('.customselect-dropdown-text');

            if (selectedOptions.length === 0) {
              selectedTextNode.innerText = objDataOptions.emptyText;
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

            if (customSelectStyle.type === 'select-one') {
              domDropdown.classList.remove('open');
            }
          }
        });
      },
      bindByElement: function bindByElement(domSelect) {
        var boolInit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var domSelector = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        if (domSelect.className.indexOf(customSelect.settings.added) > -1) {
          return false;
        }

        var customSelectID = customSelect.utils.getCustomSelectID(20);
        var dataOptions = domSelect.dataset;
        var objDataOptions = Object.assign({}, objOptions);
        objDataOptions = Object.assign(objDataOptions, dataOptions);
        var customSelectStyle = customSelect.utils.getSelectStyle(domSelect.type, objDataOptions);
        var domOptions = Array.from(domSelect.options);
        var selectedOptions = domOptions.filter(function (o) {
          return o.selected;
        });
        domSelect.dataset.customselectDataId = customSelectID;

        if (objDataOptions.selectors.indexOf(customSelectStyle.type) === -1) {
          console.warn(customSelectStyle.type + ' is not a valid selector for customselect');
          return false;
        }

        if (selectedOptions.length === 0 && customSelectStyle.type === 'select-one') {
          domOptions[0].selected = true;
        }

        var domCheckboxList = customSelect.utils.createElement(customSelectStyle.list, 'customselect-list ' + objDataOptions.classList);
        domCheckboxList.id = customSelectID;
        domCheckboxList.dataset.placeholder = objDataOptions.emptyText;
        domCheckboxList.dataset.type = customSelectStyle.type;

        if (customSelect.utils.tryParseBool(customSelectStyle.dropdown) === true) {
          domCheckboxList.classList.add('customselect-dropdown');
          var domSelectedOption = customSelect.utils.createElement(customSelectStyle.item, 'customselect-list-item customselect-dropdown-text');
          domCheckboxList.appendChild(domSelectedOption);
        }

        domOptions.forEach(function (domOption) {
          var buildedOption = customSelect.buildDomOption(domOption, customSelectID, customSelectStyle, objDataOptions);
          domCheckboxList.appendChild(buildedOption.domInputWrap);
          customSelect.bindEventLink(buildedOption.domCheckboxOptionInput, domOptions, customSelectStyle, objDataOptions);
        });
        customSelect.addToDom(domSelect, domCheckboxList, objDataOptions);

        if (boolInit === true && customSelect.utils.tryParseBool(objDataOptions.observe) === true) {
          var parentNodeToWatch = customSelect.utils.getObserverSelector(objOptions, domSelector, domSelect);
          customSelect.bindObserver(parentNodeToWatch);
        }
      },
      bindByParent: function bindByParent(domSelector, boolInit) {
        var domAllSelects = Array.from(domSelector.querySelectorAll('select'));
        var domSelects = domAllSelects.filter(function (s) {
          return objOptions.selectors.indexOf(s.type) > -1;
        });

        if (domSelects.length === 0) {
          if (boolInit === true && customSelect.utils.tryParseBool(objOptions.observe) === true) {
            var parentNodeToWatch = customSelect.utils.getObserverSelector(objOptions, domSelector);
            customSelect.bindObserver(parentNodeToWatch);
          }

          return false;
        }

        domSelects.forEach(function (domSelect) {
          customSelect.bindByElement(domSelect, true, domSelector);
        });
      },
      buildDomList: function buildDomList(domSelector, boolInit) {
        if (objOptions.selectors.indexOf(domSelector.type) === -1) {
          customSelect.bindByParent(domSelector, boolInit);
        } else {
          customSelect.bindByElement(domSelector, boolInit);
        }
      },
      buildDomOption: function buildDomOption(domOption, customSelectID, customSelectStyle, objDataOptions) {
        var domCheckboxOptionInput = customSelect.utils.createElement('input', 'customselect-list-input');
        var strCustomSelectName = '';
        var strId = customSelect.utils.getCustomSelectID(20);
        domCheckboxOptionInput.type = customSelectStyle.type === 'select-one' ? 'radio' : 'checkbox';
        domCheckboxOptionInput.value = domOption.value;
        domCheckboxOptionInput.id = strId;
        domCheckboxOptionInput.checked = domOption.selected;

        if (customSelectStyle.type === 'select-one') {
          strCustomSelectName = customSelectID;
          domCheckboxOptionInput.name = strCustomSelectName;
        }

        var domInputGroup = customSelect.positionLabel(objDataOptions.labelPosition, domCheckboxOptionInput);
        return {
          domCheckboxOptionInput: domCheckboxOptionInput,
          domInputGroup: domInputGroup
        };
      },
      positionLabel: function positionLabel(strLabelPosition, domCheckboxOptionInput) {
        var domInputWrapElement = customSelect.utils.createElement(customSelectStyle.item, 'customselect-list-input-item');
        var domCheckboxOptionLabel = customSelect.utils.createElement('label', 'customselect-list-label');
        domCheckboxOptionLabel.innerText = domOption.text;
        domCheckboxOptionLabel.htmlFor = strId;

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
      addToDom: function addToDom(domSelect, domCheckboxList, objDataOptions) {
        var domParent = domSelect.parentNode;
        var domCheckboxWrapper = customSelect.utils.createElement('div', 'customselect-list-container');
        domSelect.classList.add(customSelect.settings.added);
        domSelect.setAttribute('style', 'display:none !important');
        domCheckboxWrapper.appendChild(domSelect);
        domCheckboxWrapper.appendChild(domCheckboxList);
        domParent.appendChild(domCheckboxWrapper);
        customSelect.triggerInitialState(domCheckboxWrapper);

        if (customSelect.utils.tryParseBool(objDataOptions.dropdown) === true) {
          customSelect.dropdown.bindEvents(domCheckboxList);
        }
      },
      triggerInitialState: function triggerInitialState(domCheckboxWrapper) {
        var preCheckedElements = domCheckboxWrapper.querySelectorAll('input');

        if (preCheckedElements.length > 0) {
          var changeEvent = new Event('change');
          preCheckedElements.forEach(function (domInput) {
            domInput.dispatchEvent(changeEvent);
          });
        }
      }
    };
    customSelect.init(this);
  };

  $.fn.customselect.defaults = {
    labelPosition: 'after',
    style: 'list',
    dropdown: false,
    classList: '',
    selectors: ['select-multiple', 'select-one'],
    parentNode: null,
    observe: true,
    selectedLimit: 3,
    selectedDelimiter: ' | ',
    emptyText: 'Nothing selected',
    selectedText: 'selected',
    allSelectedText: 'All selected'
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
// Array.prototype.find - MIT License (c) 2013 Paul Miller <http://paulmillr.com>
// For all details and docs: https://github.com/paulmillr/array.prototype.find
// Fixes and tests supplied by Duncan Hall <http://duncanhall.net> 
(function(globals){
  if (Array.prototype.find) return;

  var find = function(predicate) {
    var list = Object(this);
    var length = list.length < 0 ? 0 : list.length >>> 0; // ES.ToUint32;
    if (length === 0) return undefined;
    if (typeof predicate !== 'function' || Object.prototype.toString.call(predicate) !== '[object Function]') {
      throw new TypeError('Array#find: predicate must be a function');
    }
    var thisArg = arguments[1];
    for (var i = 0, value; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) return value;
    }
    return undefined;
  };

  if (Object.defineProperty) {
    try {
      Object.defineProperty(Array.prototype, 'find', {
        value: find, configurable: true, enumerable: false, writable: true
      });
    } catch(e) {}
  }

  if (!Array.prototype.find) {
    Array.prototype.find = find;
  }
})(this);

			}.call(
				typeof window === 'object' && window ||
				typeof self   === 'object' && self   ||
				typeof global === 'object' && global ||
				{}
			));