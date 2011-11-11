#!/usr/bin/env node

var util       = require("util");
var serialport = require("serialport");
var Hook       = require('hook.io').Hook;

var SerialPort = serialport.SerialPort;

var SerialHook = exports.SerialHook = function (options) {
  var self = this;

  Hook.call(this, options);

  this.on('hook::ready', function () {
    var sp = new SerialPort("/dev/tty.usbserial-A7006xos", { 
      parser: serialport.parsers.readline("\r\n\r\n") 
    });

    var first_time = true;
    var values = [-1, -1, -1, -1, -1, -1];
    sp.on("data", function (data) {
      // always ignore the first sample
      // data may be incomplete -> no way to know
      if(first_time) { first_time = false; return; }
      var knobs = data.split("\r\n");
      // console.log('Got: ' + util.inspect(knobs));
      if(knobs.length !== 6) { return; }
      var changes = 0;
      knobs = knobs.reduce(function(map, k, i) {
        if(k !== values[i]) { map[i] = values[i] = k; changes++; }
        return map;
      }, {});
      if(changes !== 0) {
        self.emit('knobs', knobs);
        console.log('Emitting: ' + util.inspect(knobs));
      }
    });
  });
};

//
// Inherit from `hookio.Hook`
//
util.inherits(SerialHook, Hook);

var serialhook = new SerialHook({name: 'serial'});
serialhook.start();
