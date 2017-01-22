const fs = require('fs');
const crypto = require('crypto');
const jsf = require('json-schema-faker');
const _ = require('lodash');

const EXIT = 'EXIT';

var commands = {
   create:{
      defaultSources:{
        message: 'user',
        join: 'room',
        postback: 'user'
      },
      execute: function(options,settings){
       _validation('event',options);
       var event = options[0];



       var sourceTypeIndex = 1;
       var sourceType;
       var schemaDir =  (settings.schemaDir + '/').replace('//','/');
       var mainSchema = schemaDir + event + '.json';
       var refs = [];
       var schemaString = fs.readFileSync(mainSchema,'utf8');
       var schema = JSON.parse(schemaString);

       if(event === 'message'){
         _validation('event message', options,2);
         messageType = options[1];
         sourceTypeIndex = 2;
         var messageTypeSchemaFile = schemaDir + settings.messageSchemaDir + messageType + '.json';
         refs.push(messageTypeSchemaFile);
         schema.properties.message['$ref'] = messageType;

       }
       if(event === 'beacon'){
         sourceTypeIndex = 0;
         var beaconEvent = options[1] || 'enter';
         var update = settings.update || {};
         if(!update.beacon){
           update.beacon = {};
         }
         update.beacon.event = beaconEvent;
         settings.update = update;
       }
       if(sourceTypeIndex !== 0){
         sourceType = options[sourceTypeIndex] || this.defaultSources[event];
       }

       if(sourceType){
          if(schema.properties.source.$ref && schema.properties.source.$ref !== sourceType){
            throw 'event ' + event + ' is fixed.';
          }
          schema.properties.source.$ref = sourceType;
       }
       else{
         sourceType =  schema.properties.source.$ref;

       }
       if(schema.properties.source.valid && schema.properties.source.valid.indexOf(sourceType) === -1){
         throw 'in '+ event + ' event, source ' + sourceType + 'is invalid';
       }
       var sourceTypeSchemaFile =  (schemaDir + settings.sourceSchemaDir + '/' + sourceType + '.json').replace('//','/');
       refs.push(sourceTypeSchemaFile);

       settings.schema = schema;
       settings.refFiles = refs;


       if(!settings.output){
         var groupname = settings.name || event;
         if(event === 'message'){
           groupname = groupname + '.' + messageType
         }
         groupname = groupname + '.' + sourceType;
         settings.output = (settings.outputDir + '/' + groupname + '.json').replace('//','/');
       }
       return settings;
      }
   },
};



var settings = {
  outputDir:'fakedata/',
  schemaDir:'schema/',
  messageSchemaDir: 'message/',
  sourceSchemaDir: 'source/',
};
if(process.argv.length < 3){
  throw 'please enter command';
}


var value = "";
var commandName = process.argv[2];
var commandOptions = [];
var settingProperty;
for (var i = 3; i < process.argv.length; i++) {
  if(/^--/.test(now) === true){
    i = i -1;
    break;
  }
  commandOptions.push(process.argv[i]);
}


for (var j = i; j < process.argv.length; j++) {
  var now = process.argv[i];
  if(/^--/.test(now) === true){

    if(settingProperty){
      settings[settingProperty] = value;


    }
    settingProperty = now.replace(/^--/, '');
    value = "";
  }
  else
  {
    value = now;

  }
}
settings[settingProperty] = value;

var command = commands[commandName];
settings = _executeCommand(command, commandName, commandOptions, settings, 'execute', true);

endCallbacks =[];

if(settings.refFiles){
  var refs= [];

  for (var i = 0; i < settings.refFiles.length; i++) {

    var schemaFile = settings.refFiles[i];

    var schema = JSON.parse(fs.readFileSync(schemaFile,'utf8'));
    refs.push(schema);

  }
  settings.refs = refs;

}

var fakeData = JSON.stringify(createFakeData(settings.schema,settings.refs,settings.update), null,4);
var output = settings.output;
fs.writeFileSync(output, fakeData);


console.log('created file:' + output);


function _executeCommand(command, commandName,options, settings, name, required){

  if(!command){
    throw 'command ' + commandName + ' is not defiend';
  }

  var func = command[name];
  if(required === true && !func){
      throw name + ' callback of command ' + commandName + ' is not defiend';
  }
  settings = func.call(command,options, settings);
  if(settings === EXIT){
    process.exit();
  }
  return settings;
}

function _validation(command, options, slice){
  slice = slice || 1;
  if(slice > options.length){
    throw  'command ' + command + ' is require ' + slice + ' options';
  }

}

function createFakeData(schema, refs, specified){
  var ret = jsf(schema,refs);

  if (specified) {
    ret = _.merge(ret, specified);
  }
  return ret;

}

function createHmac(requestBody, secret){

  const hmac = crypto.createHmac('sha256', secret);

  hmac.update(requestBody);
  var digest = hmac.digest('base64');
  return digest;

}
