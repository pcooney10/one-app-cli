/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

const readPkgUp = require('read-pkg-up');
const get = require('lodash/get');
const commonConfig = require('../webpack/webpack.common');

function validateExternals(options) {
  if (options.requiredExternals && options.providedExternals) {
    throw new Error('@americanexpress/one-app-bundler: Modules cannot configure both requiredExternals and providedExternals. See README for details.');
  }
}

function validateOptions(options) {
  validateExternals(options);
  const allowedBundlerOptions = ['providedExternals', 'requiredExternals', 'webpackConfigPath', 'appCompatibility', 'purgecss', 'webpackClientConfigPath', 'webpackServerConfigPath'];
  const allowedOptions = Object.keys(options).filter(
    (element) => allowedBundlerOptions.includes(element));
  if (allowedOptions.length === Object.keys(options).length) {
    if (options.requiredExternals || options.providedExternals) {
      if (Array.isArray(options.requiredExternals) || Array.isArray(options.providedExternals)) {
        const intersection = Object.keys(commonConfig.externals)
          .filter((externalName) =>
          // eslint-disable-next-line implicit-arrow-linebreak
            (options.requiredExternals || options.providedExternals).includes(externalName));
        if (intersection.length > 0) {
          throw new Error(`@americanexpress/one-app-bundler: Attempted to bundle ${intersection.join(', ')}, but modules cannot provide externals that One App includes.`);
        }
      } else {
        throw new TypeError('@americanexpress/one-app-bundler: Externals must be an Array');
      }
    }
    if (
      options.webpackConfigPath
       && (options.webpackClientConfigPath || options.webpackServerConfigPath)) {
      throw new Error('`@americanexpress/one-app-bundler: Modules cannot configure both webpackConfigPath and webpackClientConfigPath or webpackServerConfigPath. See README for details.');
    }
  } else {
    throw new TypeError('@americanexpress/one-app-bundler: Wrong syntax used for bundler options');
  }
}

function logConfigurationWarnings(options) {
  if (options.webpackConfigPath
    || options.webpackClientConfigPath
    || options.webpackServerConfigPath
  ) {
    console.warn('@americanexpress/one-app-bundler: Using a custom webpack config can cause unintended side effects. Issues resulting from custom configuration will not be supported.');
  }
}

const { pkg } = readPkgUp.sync();
const options = get(pkg, ['one-amex', 'bundler'], {});
options.appCompatibility = get(pkg, ['one-amex', 'app', 'compatibility']);
options.purgecss = options.purgecss || {};
validateOptions(options);
logConfigurationWarnings(options);

module.exports = () => options;
