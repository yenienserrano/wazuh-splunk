"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var React = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _compose = _interopRequireDefault(require("recompose/compose"));

var _lodash = _interopRequireDefault(require("lodash"));

var _dateFns = require("date-fns");

var _IntlProvider = _interopRequireDefault(require("../IntlProvider"));

var _Toolbar = _interopRequireDefault(require("./Toolbar"));

var _DatePicker = _interopRequireDefault(require("./DatePicker"));

var _utils = require("./utils");

var _utils2 = require("../utils");

var _Picker = require("../Picker");

var _constants = require("../constants");

var DateRangePicker =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(DateRangePicker, _React$Component);

  DateRangePicker.getDerivedStateFromProps = function getDerivedStateFromProps(nextProps, prevState) {
    var value = nextProps.value;

    if (typeof value === 'undefined') {
      return null;
    }

    if (value[0] && !(0, _dateFns.isSameDay)(value[0], prevState.value[0]) || value[1] && !(0, _dateFns.isSameDay)(value[1], prevState.value[1])) {
      return {
        value: value,
        selectValue: value,
        calendarDate: (0, _utils.getCalendarDate)(value)
      };
    }

    return null;
  };

  function DateRangePicker(props) {
    var _this;

    _this = _React$Component.call(this, props) || this;
    _this.menuContainerRef = void 0;
    _this.triggerRef = void 0;

    _this.getValue = function () {
      var value = _this.props.value;

      if (typeof value !== 'undefined') {
        return value;
      }

      return _this.state.value || [];
    };

    _this.getWeekHoverRange = function (date) {
      var isoWeek = _this.props.isoWeek;

      if (isoWeek) {
        // set to the first day of this week according to ISO 8601, 12:00 am
        return [(0, _dateFns.startOfISOWeek)(date), (0, _dateFns.endOfISOWeek)(date)];
      }

      return [(0, _dateFns.startOfWeek)(date), (0, _dateFns.endOfWeek)(date)];
    };

    _this.getMonthHoverRange = function (date) {
      return [(0, _dateFns.startOfMonth)(date), (0, _dateFns.endOfMonth)(date)];
    };

    _this.handleChangeCalendarDate = function (index, date) {
      var calendarDate = _this.state.calendarDate;
      calendarDate[index] = date;

      _this.setState({
        calendarDate: calendarDate
      });
    };

    _this.handleCloseDropdown = function () {
      if (_this.triggerRef.current) {
        _this.triggerRef.current.hide();
      }
    };

    _this.handleOpenDropdown = function () {
      if (_this.triggerRef.current) {
        _this.triggerRef.current.show();
      }
    };

    _this.handleShortcutPageDate = function (value, closeOverlay, event) {
      _this.updateValue(event, value, closeOverlay);
    };

    _this.handleOK = function (event) {
      var onOk = _this.props.onOk;

      _this.updateValue(event);

      onOk && onOk(_this.state.selectValue, event);
    };

    _this.handleChangeSelectValue = function (date, event) {
      var _this$state = _this.state,
          selectValue = _this$state.selectValue,
          doneSelected = _this$state.doneSelected;
      var _this$props = _this.props,
          onSelect = _this$props.onSelect,
          oneTap = _this$props.oneTap;
      var nextValue = [];

      var nextHoverValue = _this.getHoverRange(date);

      if (doneSelected) {
        if (nextHoverValue.length) {
          nextValue = [nextHoverValue[0], nextHoverValue[1], date];
          nextHoverValue = [nextHoverValue[0], nextHoverValue[1], date];
        } else {
          nextValue = [date, undefined, date];
        }
      } else {
        if (nextHoverValue.length) {
          nextValue = [selectValue[0], selectValue[1]];
        } else {
          nextValue = [selectValue[0], date];
        }

        if ((0, _dateFns.isAfter)(nextValue[0], nextValue[1])) {
          nextValue.reverse();
        }

        nextValue[0] = (0, _utils.setTimingMargin)(nextValue[0]);
        nextValue[1] = (0, _utils.setTimingMargin)(nextValue[1]);

        _this.setState({
          calendarDate: (0, _utils.getCalendarDate)(nextValue)
        });
      }

      var nextState = {
        doneSelected: !doneSelected,
        selectValue: nextValue,
        hoverValue: nextHoverValue
      };

      _this.setState(nextState, function () {
        // 如果是单击模式，并且是第一次点选，再触发一次点击
        if (oneTap && !_this.state.doneSelected) {
          _this.handleChangeSelectValue(date, event);
        } // 如果是单击模式，并且是第二次点选，更新值，并关闭面板


        if (oneTap && _this.state.doneSelected) {
          _this.updateValue(event);
        }

        onSelect && onSelect(date);
      });
    };

    _this.handleMouseMoveSelectValue = function (date) {
      var _this$state2 = _this.state,
          doneSelected = _this$state2.doneSelected,
          selectValue = _this$state2.selectValue,
          hoverValue = _this$state2.hoverValue,
          currentHoverDate = _this$state2.currentHoverDate;
      var hoverRange = _this.props.hoverRange;

      if (currentHoverDate && (0, _dateFns.isSameDay)(date, currentHoverDate)) {
        return;
      }

      var nextHoverValue = _this.getHoverRange(date);

      if (doneSelected && !_lodash.default.isUndefined(hoverRange)) {
        _this.setState({
          currentHoverDate: date,
          hoverValue: nextHoverValue
        });

        return;
      } else if (doneSelected) {
        return;
      }

      var nextValue = selectValue;

      if (!nextHoverValue.length) {
        nextValue[1] = date;
      } else if (hoverValue) {
        nextValue = [(0, _dateFns.isBefore)(nextHoverValue[0], hoverValue[0]) ? nextHoverValue[0] : hoverValue[0], (0, _dateFns.isAfter)(nextHoverValue[1], hoverValue[1]) ? nextHoverValue[1] : hoverValue[1], nextValue[2]];
      } // If `nextValue[0]` is greater than `nextValue[1]` then reverse order


      if ((0, _dateFns.isAfter)(nextValue[0], nextValue[1])) {
        nextValue.reverse();
      }

      _this.setState({
        currentHoverDate: date,
        selectValue: nextValue
      });
    };

    _this.handleClean = function (event) {
      _this.setState({
        calendarDate: [new Date(), (0, _dateFns.addMonths)(new Date(), 1)]
      });

      _this.updateValue(event, []);
    };

    _this.handleEnter = function () {
      var value = _this.getValue();

      var calendarDate;

      if (value && value.length) {
        var startDate = value[0],
            endData = value[1];
        calendarDate = [startDate, (0, _dateFns.isSameMonth)(startDate, endData) ? (0, _dateFns.addMonths)(endData, 1) : endData];
      } else {
        calendarDate = [new Date(), (0, _dateFns.addMonths)(new Date(), 1)];
      }

      _this.setState({
        selectValue: value,
        calendarDate: calendarDate,
        active: true
      });
    };

    _this.handleEntered = function () {
      var onOpen = _this.props.onOpen;
      onOpen && onOpen();
    };

    _this.handleExit = function () {
      var onClose = _this.props.onClose;

      _this.setState({
        active: false,
        doneSelected: true
      });

      onClose && onClose();
    };

    _this.disabledOkButton = function () {
      var _this$state3 = _this.state,
          selectValue = _this$state3.selectValue,
          doneSelected = _this$state3.doneSelected;

      if (!selectValue[0] || !selectValue[1] || !doneSelected) {
        return true;
      }

      return _this.disabledByBetween(selectValue[0], selectValue[1], _utils.TYPE.TOOLBAR_BUTTON_OK);
    };

    _this.disabledShortcutButton = function (value) {
      if (value === void 0) {
        value = [];
      }

      if (!value[0] || !value[1]) {
        return true;
      }

      return _this.disabledByBetween(value[0], value[1], _utils.TYPE.TOOLBAR_SHORTCUT);
    };

    _this.handleDisabledDate = function (date, values, type) {
      var disabledDate = _this.props.disabledDate;
      var doneSelected = _this.state.doneSelected;

      if (disabledDate) {
        return disabledDate(date, values, doneSelected, type);
      }

      return false;
    };

    _this.addPrefix = function (name) {
      return (0, _utils2.prefix)(_this.props.classPrefix)(name);
    };

    var defaultValue = props.defaultValue,
        _value = props.value;
    var activeValue = _value || defaultValue || [];

    var _calendarDate = (0, _utils.getCalendarDate)(activeValue);

    _this.state = {
      value: activeValue,
      selectValue: activeValue,
      doneSelected: true,
      calendarDate: _calendarDate,
      hoverValue: [],
      currentHoverDate: null
    }; // for test

    _this.menuContainerRef = React.createRef();
    _this.triggerRef = React.createRef();
    return _this;
  }

  var _proto = DateRangePicker.prototype;

  _proto.getDateString = function getDateString(value) {
    var _this$props2 = this.props,
        placeholder = _this$props2.placeholder,
        formatType = _this$props2.format,
        renderValue = _this$props2.renderValue;
    var nextValue = value || this.getValue();

    var startDate = _lodash.default.get(nextValue, '0');

    var endDate = _lodash.default.get(nextValue, '1');

    if (startDate && endDate) {
      var displayValue = [startDate, endDate].sort(_dateFns.compareAsc);
      return renderValue ? renderValue(displayValue, formatType) : (0, _dateFns.format)(displayValue[0], formatType) + " ~ " + (0, _dateFns.format)(displayValue[1], formatType);
    }

    return placeholder || formatType + " ~ " + formatType;
  } // hover range presets
  ;

  _proto.getHoverRange = function getHoverRange(date) {
    var hoverRange = this.props.hoverRange;

    if (!hoverRange) {
      return [];
    }

    var hoverRangeFunc = hoverRange;

    if (hoverRange === 'week') {
      hoverRangeFunc = this.getWeekHoverRange;
    }

    if (hoverRangeFunc === 'month') {
      hoverRangeFunc = this.getMonthHoverRange;
    }

    if (typeof hoverRangeFunc !== 'function') {
      return [];
    }

    var hoverValues = hoverRangeFunc(date);
    var isHoverRangeValid = hoverValues instanceof Array && hoverValues.length === 2;

    if (!isHoverRangeValid) {
      return [];
    }

    if ((0, _dateFns.isAfter)(hoverValues[0], hoverValues[1])) {
      hoverValues.reverse();
    }

    return hoverValues;
  };

  _proto.resetPageDate = function resetPageDate() {
    var selectValue = this.getValue();
    var calendarDate = (0, _utils.getCalendarDate)(selectValue);
    this.setState({
      selectValue: selectValue,
      calendarDate: calendarDate
    });
  }
  /**
   * Toolbar operation callback function
   */
  ;

  _proto.updateValue = function updateValue(event, nextSelectValue, closeOverlay) {
    if (closeOverlay === void 0) {
      closeOverlay = true;
    }

    var _this$state4 = this.state,
        value = _this$state4.value,
        selectValue = _this$state4.selectValue;
    var onChange = this.props.onChange;
    var nextValue = !_lodash.default.isUndefined(nextSelectValue) ? nextSelectValue : selectValue;
    this.setState({
      selectValue: nextValue || [],
      value: nextValue
    });

    if (onChange && (!(0, _dateFns.isSameDay)(nextValue[0], value[0]) || !(0, _dateFns.isSameDay)(nextValue[1], value[1]))) {
      onChange(nextValue, event);
    } // `closeOverlay` default value is `true`


    if (closeOverlay !== false) {
      this.handleCloseDropdown();
    }
  };

  _proto.disabledByBetween = function disabledByBetween(start, end, type) {
    var disabledDate = this.props.disabledDate;
    var _this$state5 = this.state,
        selectValue = _this$state5.selectValue,
        doneSelected = _this$state5.doneSelected;
    var selectStartDate = selectValue[0];
    var selectEndDate = selectValue[1];
    var nextSelectValue = [selectStartDate, selectEndDate]; // If the date is between the start and the end
    // the button is disabled

    while ((0, _dateFns.isBefore)(start, end) || (0, _dateFns.isSameDay)(start, end)) {
      if (disabledDate && disabledDate(start, nextSelectValue, doneSelected, type)) {
        return true;
      }

      start = (0, _dateFns.addDays)(start, 1);
    }

    return false;
  };

  _proto.renderDropdownMenu = function renderDropdownMenu() {
    var _this$props3 = this.props,
        menuClassName = _this$props3.menuClassName,
        ranges = _this$props3.ranges,
        isoWeek = _this$props3.isoWeek,
        limitEndYear = _this$props3.limitEndYear,
        oneTap = _this$props3.oneTap,
        showWeekNumbers = _this$props3.showWeekNumbers;
    var _this$state6 = this.state,
        calendarDate = _this$state6.calendarDate,
        selectValue = _this$state6.selectValue,
        hoverValue = _this$state6.hoverValue,
        doneSelected = _this$state6.doneSelected;
    var classes = (0, _classnames.default)(this.addPrefix('daterange-menu'), menuClassName);
    var pickerProps = {
      isoWeek: isoWeek,
      doneSelected: doneSelected,
      hoverValue: hoverValue,
      calendarDate: calendarDate,
      limitEndYear: limitEndYear,
      showWeekNumbers: showWeekNumbers,
      value: selectValue,
      disabledDate: this.handleDisabledDate,
      onSelect: this.handleChangeSelectValue,
      onMouseMove: this.handleMouseMoveSelectValue,
      onChangeCalendarDate: this.handleChangeCalendarDate
    };
    return React.createElement(_Picker.MenuWrapper, {
      className: classes,
      ref: this.menuContainerRef
    }, React.createElement("div", {
      className: this.addPrefix('daterange-panel')
    }, React.createElement("div", {
      className: this.addPrefix('daterange-content')
    }, React.createElement("div", {
      className: this.addPrefix('daterange-header')
    }, this.getDateString(selectValue)), React.createElement("div", {
      className: this.addPrefix('daterange-calendar-group')
    }, React.createElement(_DatePicker.default, (0, _extends2.default)({
      index: 0
    }, pickerProps)), React.createElement(_DatePicker.default, (0, _extends2.default)({
      index: 1
    }, pickerProps)))), React.createElement(_Toolbar.default, {
      ranges: ranges,
      selectValue: selectValue,
      disabledOkButton: this.disabledOkButton,
      disabledShortcutButton: this.disabledShortcutButton,
      onShortcut: this.handleShortcutPageDate,
      onOk: this.handleOK,
      hideOkButton: oneTap
    })));
  };

  _proto.render = function render() {
    var _this$props4 = this.props,
        disabled = _this$props4.disabled,
        cleanable = _this$props4.cleanable,
        locale = _this$props4.locale,
        toggleComponentClass = _this$props4.toggleComponentClass,
        style = _this$props4.style,
        onEntered = _this$props4.onEntered,
        onEnter = _this$props4.onEnter,
        onExited = _this$props4.onExited,
        onClean = _this$props4.onClean,
        rest = (0, _objectWithoutPropertiesLoose2.default)(_this$props4, ["disabled", "cleanable", "locale", "toggleComponentClass", "style", "onEntered", "onEnter", "onExited", "onClean"]);
    var value = this.getValue();
    var unhandled = (0, _utils2.getUnhandledProps)(DateRangePicker, rest);
    var hasValue = value && value.length > 1;
    var classes = (0, _Picker.getToggleWrapperClassName)('daterange', this.addPrefix, this.props, hasValue);
    return React.createElement(_IntlProvider.default, {
      locale: locale
    }, React.createElement("div", {
      className: classes,
      style: style
    }, React.createElement(_Picker.PickerToggleTrigger, {
      pickerProps: this.props,
      ref: this.triggerRef,
      onEnter: (0, _utils2.createChainedFunction)(this.handleEnter, onEnter),
      onEntered: (0, _utils2.createChainedFunction)(this.handleEntered, onEntered),
      onExit: (0, _utils2.createChainedFunction)(this.handleExit, onExited),
      speaker: this.renderDropdownMenu()
    }, React.createElement(_Picker.PickerToggle, (0, _extends2.default)({}, unhandled, {
      componentClass: toggleComponentClass,
      onClean: (0, _utils2.createChainedFunction)(this.handleClean, onClean),
      cleanable: cleanable && !disabled,
      hasValue: hasValue,
      active: this.state.active
    }), this.getDateString()))));
  };

  return DateRangePicker;
}(React.Component);

DateRangePicker.propTypes = {
  appearance: _propTypes.default.oneOf(['default', 'subtle']),
  ranges: _propTypes.default.array,
  value: _propTypes.default.arrayOf(_propTypes.default.instanceOf(Date)),
  defaultValue: _propTypes.default.arrayOf(_propTypes.default.instanceOf(Date)),
  placeholder: _propTypes.default.node,
  format: _propTypes.default.string,
  disabled: _propTypes.default.bool,
  locale: _propTypes.default.object,
  hoverRange: _propTypes.default.oneOfType([_propTypes.default.oneOf(['week', 'month']), _propTypes.default.func]),
  cleanable: _propTypes.default.bool,
  isoWeek: _propTypes.default.bool,
  oneTap: _propTypes.default.bool,
  limitEndYear: _propTypes.default.number,
  className: _propTypes.default.string,
  menuClassName: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  container: _propTypes.default.oneOfType([_propTypes.default.node, _propTypes.default.func]),
  containerPadding: _propTypes.default.number,
  block: _propTypes.default.bool,
  toggleComponentClass: _propTypes.default.elementType,
  style: _propTypes.default.object,
  open: _propTypes.default.bool,
  defaultOpen: _propTypes.default.bool,
  placement: _propTypes.default.oneOf(_constants.PLACEMENT),
  preventOverflow: _propTypes.default.bool,
  showWeekNumbers: _propTypes.default.bool,
  onChange: _propTypes.default.func,
  onOk: _propTypes.default.func,
  disabledDate: _propTypes.default.func,
  onSelect: _propTypes.default.func,
  onOpen: _propTypes.default.func,
  onClose: _propTypes.default.func,
  onHide: _propTypes.default.func,
  onClean: _propTypes.default.func,
  onEnter: _propTypes.default.func,
  onEntering: _propTypes.default.func,
  onEntered: _propTypes.default.func,
  onExit: _propTypes.default.func,
  onExiting: _propTypes.default.func,
  onExited: _propTypes.default.func,
  renderValue: _propTypes.default.func
};
DateRangePicker.defaultProps = {
  appearance: 'default',
  placement: 'bottomStart',
  limitEndYear: 1000,
  format: 'YYYY-MM-DD',
  placeholder: '',
  cleanable: true,
  locale: {
    sunday: 'Su',
    monday: 'Mo',
    tuesday: 'Tu',
    wednesday: 'We',
    thursday: 'Th',
    friday: 'Fr',
    saturday: 'Sa',
    ok: 'OK',
    today: 'Today',
    yesterday: 'Yesterday',
    last7Days: 'Last 7 Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds'
  }
};
var enhance = (0, _compose.default)((0, _utils2.defaultProps)({
  classPrefix: 'picker'
}), (0, _utils2.withPickerMethods)());

var _default = enhance(DateRangePicker);

exports.default = _default;
module.exports = exports.default;