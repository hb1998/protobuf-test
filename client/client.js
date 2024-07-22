'use strict';

const protobuf = require('protobufjs');
const axios = require('axios');

const sendProtobufMessage = async () => {
    // Load the schema dynamically
    const schema = {
        "nested": {
            "MyMessage": {
                "fields": {
                    "name": { "type": "string", "id": 1 },
                    "id": { "type": "int32", "id": 2 }
                }
            }
        }
    };
    const root = protobuf.Root.fromJSON(schema);
    const MyMessage = root.lookupType("MyMessage");

    const messagePayload = { name: "John Doe", id: 1234 };
    const errMsg = MyMessage.verify(messagePayload);
    if (errMsg) throw Error(errMsg);

    const message = MyMessage.create(messagePayload);
    const buffer = MyMessage.encode(message).finish();

    const response = await axios.post('http://localhost:3000/protobuf', buffer, {
        headers: {
            'Content-Type': 'application/octet-stream'
        }
    });

    console.log(response.data);
};

sendProtobufMessage().catch(console.error);
