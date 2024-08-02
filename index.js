'use strict';

const Hapi = require('@hapi/hapi');
const protobuf = require('protobufjs');
const lzutf8 = require('lzutf8');



const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  server.route({
    method: 'POST',
    path: '/protobuf',
    options: {
      cors: true,
      payload: {
        parse: false, // Do not parse the payload as JSON
        output: 'data', // Keep the payload as a Buffer
        allow: 'application/octet-stream', // Allow binary data
        maxBytes: 1024 * 1024 * 1024 // Set a reasonable limit for the payload size
      }
    },
    handler: async (request, h) => {
      try {
        // Load the schema dynamically (this could be loaded statically for optimization)
        const schema = {
          "nested": {
            "CellMeta": {
              "fields": {
                "columnId": { "type": "string", "id": 1 },
                "columnName": { "type": "string", "id": 2 },
                "rowId": { "type": "string", "id": 3 },
                "isCalculated": { "type": "bool", "id": 4 },
                "isAggregated": { "type": "bool", "id": 5 },
                "isSimulated": { "type": "bool", "id": 6 },
                "isCalculatedRow": { "type": "bool", "id": 7 },
                "measureGuid": { "type": "string", "id": 8 },
                "scenarioName": { "type": "string", "id": 9 }
              }
            },
            "MetaData": {
              "fields": {
                "id": { "type": "string", "id": 1 },
                "label": { "type": "string", "id": 2 }
              }
            },
            "Data": {
              "fields": {
                "field1": { "type": "string", "id": 1 },
                "field2": { "type": "string", "id": 2 },
                "field3": { "type": "string", "id": 3 },
                "field4": { "type": "string", "id": 4 },
                "field5": { "type": "string", "id": 5 },
                "field6": { "type": "string", "id": 6 },
                "field7": { "type": "string", "id": 7 },
                "field8": { "type": "string", "id": 8 },
                "cellMeta": { "type": "CellMeta", "id": 9 }
              }
            },
            "MyObject": {
              "fields": {
                "metaData": { "rule": "repeated", "type": "MetaData", "id": 1 },
                "data": { "rule": "repeated", "type": "Data", "id": 2 }
              }
            }
          }
        };
        console.time('deserialization proto')
        const root = protobuf.Root.fromJSON(schema);
        const MyMessage = root.lookupType("MyObject");


        // Decode the protobuf message
        const decodedMessage = MyMessage.decode(MyMessage);
        const object = MyMessage.toObject(decodedMessage, {
          longs: String,
          enums: String,
          bytes: String,
          // see ConversionOptions
        });
        console.timeEnd('deserialization proto')

        const response = {
          message: `successfully recieved`
        };

        return h.response(response).code(200);
      } catch (err) {
        console.log(err)
        return h.response({ error: err.message }).code(400);
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/json',
    options: {
      cors: true,
      payload: {
        parse: false, // Parse the payload as JSON
        output: 'data', // Keep the payload as a Buffer
        allow: 'application/octet-stream', // Allow JSON data
        maxBytes: 1024 * 1024 * 1024 * 1024  // Set a reasonable limit for the payload size
      }
    },
    handler: async (request, h) => {
      try {
        console.time('deserialization json')
        const decompressed = lzutf8.decompress(request.payload, { inputEncoding: 'Buffer' });
        try {
          const payload = JSON.parse(decompressed);
          console.log(payload.data.length)
        } catch (error) {
        } finally {
          console.timeEnd('deserialization json')

        }
        return h.response({ message: "works" }).code(200);
      } catch (err) {
        console.error('Error:', err.message);
        return h.response({ error: err.message }).code(400);
      }
    }
  });



  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();

function arrayBufferTransfer(oldBuffer, newByteLength) {
  const
    srcArray = new Uint8Array(oldBuffer),
    destArray = new Uint8Array(newByteLength),
    copylen = Math.min(srcArray.buffer.byteLength, destArray.buffer.byteLength),
    floatArrayLength = Math.trunc(copylen / 8),
    floatArraySource = new Float64Array(srcArray.buffer, 0, floatArrayLength),
    floarArrayDest = new Float64Array(destArray.buffer, 0, floatArrayLength);

  floarArrayDest.set(floatArraySource);

  let bytesCopied = floatArrayLength * 8;


  // slowpoke copy up to 7 bytes.
  while (bytesCopied < copylen) {
    destArray[bytesCopied] = srcArray[bytesCopied];
    bytesCopied++;
  }


  return Buffer.from(destArray.buffer);
}