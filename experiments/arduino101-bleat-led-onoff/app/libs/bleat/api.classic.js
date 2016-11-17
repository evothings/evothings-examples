/* @license
 *
 * BLE Abstraction Tool: core functionality - classic specification
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Rob Moran
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// https://github.com/umdjs/umd
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['bluetooth.helpers'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS
        module.exports = factory(require('./bluetooth.helpers'));
    } else {
        // Browser globals with support for web workers (root is window)
        root.bleat = factory(root.bleatHelpers);
    }
}(this, function(helpers) {
    "use strict";

    var adapter = null;
    var adapters = {};

    // Helpers
    function raiseError(errorFn, msg) {
        return function(error) {
            if (errorFn) errorFn(msg + ": " + error);
        };
    }

    function executeFn(fn) {
        return function() {
            if (typeof fn === "function") {
                var args = [].slice.call(arguments);
                fn.apply(this, args);
            }
        };
    }

    function AsyncWait(finishFn, errorFn) {
        var count = 0;
        var callbackAdded = false;
        this.addCallback = function(fn) {
            count++;
            callbackAdded = true;
            return function() {
                if (fn) fn.apply(null, arguments);
                if (--count === 0 && finishFn) finishFn();
            };
        };
        this.error = function() {
            if (errorFn) errorFn.apply(null, arguments);
            if (--count === 0 && finishFn) finishFn();
        };
        this.finish = function() {
            if (!callbackAdded && finishFn) finishFn();
        };
    }

    // Device Object
    var Device = function(deviceInfo) {
        this._handle = deviceInfo._handle;

        this.address = deviceInfo._handle;
        this.name = deviceInfo.name;
        this.serviceUUIDs = deviceInfo.uuids;
        this.adData = deviceInfo.adData;

        this.connected = false;
        this.services = {};
    };
    Device.prototype.hasService = function(serviceUUID) {
        return this.serviceUUIDs.some(function(uuid) {
            return (uuid === serviceUUID);
        });
    };
    Device.prototype.connect = function(connectFn, disconnectFn, errorFn, suppressDiscovery) {
        // Make sure we are not already connected.
        if (this.connected === true) return raiseError(errorFn, "connect error")("device already connected");
        adapter.connect(this._handle, function() {
            this.connected = true;
            if (typeof errorFn === "boolean") {
                suppressDiscovery = errorFn;
                errorFn = null;
            }
            if (suppressDiscovery) return executeFn(connectFn)();
            this.discoverAll(connectFn, errorFn);
        }.bind(this), function() {
            this.connected = false;
            this.services = {};
            executeFn(disconnectFn)();
        }.bind(this), raiseError(errorFn, "connect error"));
    };
    Device.prototype.isConnected = function() {
        return this.connected;
    };
    Device.prototype.disconnect = function(errorFn) {
        this.connected = false;
        adapter.disconnect(this._handle, raiseError(errorFn, "disconnect error"));
    };
    Device.prototype.discoverServices = function(serviceUUIDs, completeFn, errorFn) {
        if (this.connected === false) return raiseError(errorFn, "discovery error")("device not connected");
        if (typeof serviceUUIDs === "function") {
            completeFn = serviceUUIDs;
            serviceUUIDs = [];
        } else if (typeof serviceUUIDs === "string") {
            serviceUUIDs = [serviceUUIDs];
        }
        adapter.discoverServices(this._handle, serviceUUIDs, function(services) {
            services.forEach(function(serviceInfo) {
                this.services[serviceInfo.uuid] = new Service(serviceInfo);
            }, this);

            if (completeFn) completeFn();
        }.bind(this), raiseError(errorFn, "service discovery error"));
    };
    Device.prototype.discoverAll = function(completeFn, errorFn) {
        if (this.connected === false) return raiseError(errorFn, "discovery error")("device not connected");
        var wait = new AsyncWait(completeFn, errorFn);

        this.discoverServices(wait.addCallback(function() {
            Object.keys(this.services).forEach(function(serviceUUID) {
                var service = this.services[serviceUUID];

                service.discoverIncludedServices(wait.addCallback(), wait.error);

                service.discoverCharacteristics(wait.addCallback(function() {
                    Object.keys(service.characteristics).forEach(function(characteristicUUID) {
                        var characteristic = service.characteristics[characteristicUUID];
                        characteristic.discoverDescriptors(wait.addCallback(), wait.error);
                    }, this);
                }.bind(this)), wait.error);

            }, this);
        }.bind(this)), wait.error);

        wait.finish();
    };

    // Service Object
    var Service = function(serviceInfo) {
        this._handle = serviceInfo._handle;

        this.uuid = serviceInfo.uuid;
        this.primary = serviceInfo.primary;

        this.includedServices = {};
        this.characteristics = {};
    };
    Service.prototype.discoverIncludedServices = function(serviceUUIDs, completeFn, errorFn) {
        if (typeof serviceUUIDs === "function") {
            completeFn = serviceUUIDs;
            serviceUUIDs = [];
        } else if (typeof serviceUUIDs === "string") {
            serviceUUIDs = [serviceUUIDs];
        }
        adapter.discoverIncludedServices(this._handle, serviceUUIDs, function(services) {
            services.forEach(function(serviceInfo) {
                this.includedServices[serviceInfo.uuid] = new Service(serviceInfo);
            }, this);

            if (completeFn) completeFn();
        }.bind(this), raiseError(errorFn, "included service discovery error"));
    };
    Service.prototype.discoverCharacteristics = function(characteristicUUIDs, completeFn, errorFn) {
        if (typeof characteristicUUIDs === "function") {
            completeFn = characteristicUUIDs;
            characteristicUUIDs = [];
        } else if (typeof characteristicUUIDs === "string") {
            characteristicUUIDs = [characteristicUUIDs];
        }
        adapter.discoverCharacteristics(this._handle, characteristicUUIDs, function(characteristics) {
            characteristics.forEach(function(characteristicInfo) {
                this.characteristics[characteristicInfo.uuid] = new Characteristic(characteristicInfo);
            }, this);

            if (completeFn) completeFn();
        }.bind(this), raiseError(errorFn, "characteristic discovery error"));
    };

    // Characteristic Object
    var Characteristic = function(characteristicInfo) {
        this._handle = characteristicInfo._handle;

        this.uuid = characteristicInfo.uuid;
        this.properties = characteristicInfo.properties;

        this.descriptors = {};
    };
    Characteristic.prototype.discoverDescriptors = function(descriptorUUIDs, completeFn, errorFn) {
        if (typeof descriptorUUIDs === "function") {
            completeFn = descriptorUUIDs;
            descriptorUUIDs = [];
        } else if (typeof descriptorUUIDs === "string") {
            descriptorUUIDs = [descriptorUUIDs];
        }
        adapter.discoverDescriptors(this._handle, descriptorUUIDs, function(descriptors) {
            descriptors.forEach(function(descriptorInfo) {
                this.descriptors[descriptorInfo.uuid] = new Descriptor(descriptorInfo);
            }, this);

            if (completeFn) completeFn();
        }.bind(this), raiseError(errorFn, "descriptor discovery error"));
    };
    Characteristic.prototype.read = function(completeFn, errorFn) {
        adapter.readCharacteristic(this._handle, executeFn(completeFn), raiseError(errorFn, "read characteristic error"));
    };
    Characteristic.prototype.write = function(dataView, completeFn, errorFn) {
        adapter.writeCharacteristic(this._handle, dataView, executeFn(completeFn), raiseError(errorFn, "write characteristic error"));
    };
    Characteristic.prototype.enableNotify = function(notifyFn, completeFn, errorFn) {
        adapter.enableNotify(this._handle, executeFn(notifyFn), executeFn(completeFn), raiseError(errorFn, "enable notify error"));
    };
    Characteristic.prototype.disableNotify = function(completeFn, errorFn) {
        adapter.disableNotify(this._handle, executeFn(completeFn), raiseError(errorFn, "disable notify error"));
    };

    // Descriptor Object
    var Descriptor = function(descriptorInfo) {
        this._handle = descriptorInfo._handle;

        this.uuid = descriptorInfo.uuid;
    };
    Descriptor.prototype.read = function(completeFn, errorFn) {
        adapter.readDescriptor(this._handle, executeFn(completeFn), raiseError(errorFn, "read descriptor error"));
    };
    Descriptor.prototype.write = function(dataView, completeFn, errorFn) {
        adapter.writeDescriptor(this._handle, dataView, executeFn(completeFn), raiseError(errorFn, "write descriptor error"));
    };

    // Main Module
    return {
        _addAdapter: function(adapterName, definition) {
            adapters[adapterName] = definition;
            adapter = definition;
        },
        startScan: function(serviceUUIDs, foundFn, completeFn, errorFn, allowDuplicates) {
            if (typeof serviceUUIDs === "function") {
                // Service UUIDs not present, shift args.
                allowDuplicates = errorFn;
                errorFn = completeFn;
                completeFn = foundFn;
                foundFn = serviceUUIDs;
                serviceUUIDs = [];
            } else if (typeof serviceUUIDs === "string") {
                serviceUUIDs = [serviceUUIDs];
            }
            adapter.stopScan(raiseError(errorFn, "stop scan error"));
            var devices = {};
            adapter.startScan(serviceUUIDs, function(deviceInfo) {
                var device = new Device(deviceInfo);
                if (devices[device.address] && !allowDuplicates) return;
                devices[device.address] = device;
                if (foundFn) foundFn(device);
            }.bind(this), completeFn, raiseError(errorFn, "scan error"));
        },
        stopScan: function(errorFn) {
            adapter.stopScan(raiseError(errorFn, "stop scan error"));
        }
    };
}));