 
"use strict";

var noWin = typeof window === 'undefined';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactQrReader = noWin ? null : _interopRequireDefault(require("react-qr-reader"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _util = require("./util");

// Copyright 2017-2020 @polkadot/react-qr authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
const DEFAULT_DELAY = 150;

const DEFAULT_ERROR = error => {
  console.error('@polkadot/react-qr:Scan', error.message);
};

class Scan extends _react.default.PureComponent {
  constructor(...args) {
    super(...args);

    this.onError = error => {
      const {
        onError = DEFAULT_ERROR
      } = this.props;
      onError(error);
    };

    this.onScan = data => {
      const {
        onScan
      } = this.props;

      if (!data || !onScan) {
        return;
      }

      onScan(data);
    };
  }

  render() {

    if (noWin) return null;

    const {
      className,
      delay = DEFAULT_DELAY,
      size,
      style
    } = this.props;
    return _react.default.createElement("div", {
      className: className,
      style: (0, _util.createImgSize)(size)
    }, _react.default.createElement(_reactQrReader.default, {
      className: "ui--qr-Scan",
      delay: delay,
      onError: this.onError,
      onScan: this.onScan,
      style: style
    }));
  }

}

var _default = (0, _styledComponents.default)(Scan).withConfig({
  displayName: "Scan",
  componentId: "zwjyub-0"
})([".ui--qr-Scan{display:inline-block;height:100%;transform:matrix(-1,0,0,1,0,0);width:100%;video{margin:0;}}"]);

exports.default = _default;
