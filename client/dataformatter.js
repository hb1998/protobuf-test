const fs = require('fs');
const path = require('path');

// Define the paths for the input and output files
const inputFilePath = path.join(__dirname, 'data.txt');
const outputFilePath = path.join(__dirname, 'output.json');

// Read the JSON string from data.txt
fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the input file:', err);
        return;
    }

    try {
        // Parse the JSON string into an object
        console.log(data[0])
        const jsonObject = JSON.parse(data);
        // Convert the object back to a formatted JSON string
        const formattedJson = JSON.stringify(jsonObject, null, 2);

        // Write the formatted JSON string to a new file
        fs.writeFile(outputFilePath, formattedJson, 'utf8', (err) => {
            if (err) {
                console.error('Error writing the output file:', err);
                return;
            }

            console.log('JSON data has been written to', outputFilePath);
        });
    } catch (parseErr) {
        console.error('Error parsing JSON string:', parseErr);
    }
});
