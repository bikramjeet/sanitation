# sanitation


This is a simple sanity validator which can be used across various Node.JS applications to iterate over the "nested JSON objects structure" and perform operations like validation of incoming API data or any JSON data to return the expected object filtering out the junk data from the object, along with that has also the ability to extract the last folder from the given folder path.

## Listed below some of the key features

- Very simple and flexible to use.
- Configurable JSON structure along with defining the expected data type for each field actual value.
- Configurable mandatory fields and blank value check for optional fields.
- Can be used for any RESTful API.
- Can extract the value of the nested object based on string path and the separator defined.

## Install

```javascript
npm install sanitation
```

## Dependencies

```javascript
"dependencies": {
    "moment": "2.17.1"
};
```

## Use

```javascript
let sanity = require('sanitation');

let expectedObj = {
    "test" : {
        "schema" : {
            "blank_value" : false,
            "elements" : {
                "key1" : {
                    "key2" : [
                        {
                            "key3" : "",
                            "key4" : 0
                        }
                    ],
                    "key5" : "",
                    "key6" : []
                }
            },
            "mandatory_elements" : ["key1", "key2", "key3", "key4", "key5"]
        }
    }
};
```

## Quick Example

```javascript
/**
* Validate the actual object across the expected object to remove the junk data and filter out the actual data along with the data type check for each field actual value
**/

let actualObj = {
    "key1" : {
        "key2" : [
            {
                "key3" : "value1",
                "key4" : value2
            }
        ],
        "key5" : "value3",
        "key7" : ["value4", "value5"]
    }
};

let validation = sanity.paramsValidator(actualObj, expectedObj.test.schema.elements, expectedObj.test.schema.mandatory_elements, expectedObj.test.schema.blank_value);

if(!validation.success) {
    /**
    * Define your handler for error scenario
    * validation.response.errorMsg will contain the actual error string
    * validation.response.errorKey will contain the error keys
    **/
} else if (Object.keys(validation.elements).length === 0) {
    /**
    * Define your handler for no valid data in the actual object in case all the fields in the expected object are optional
    **/
} else {
    /**
    * validation.elements will contain the filtered data compared with the expected object from the actual object
    **/
}

/**
* Fetch the value of the nested object based on string path separated by dot
**/

let nestedObj = {
    "key1" : {
        "key2" : {
            "key3" : {
                "key4" : {
                    "key5" : {
                        "key6" : {
                            "key7" : "value"
                        }
                    }
                }
           }
        }
    }
};

let nestedObjVal = sanity.objValByStr("key1.key2.key3.key4.key5.key6.key7", ".", nestedObj);

if(!nestedObjVal) {
    /**
    * Check if the keys in the string pattern or the other parameters passed are correct and in proper order
    **/
} else if(typeof(nestedObjVal) === "object") {
    /**
    * Define your handler for error scenario
    **/
} else {
    /**
    * Actual value of the nested object key will be available here
    **/
}

/**
* Extract the last folder from the path string
**/

let folderPath = "/usr/share/test"

sanity.lastFolderFromPath(folderPath);

/**
* Check non zero positive integer value from the string
**/

let intVal = "1";

sanity.isPositiveInteger(intVal);

/**
* Check non zero positive integer value from the string in an array
**/

let intValArray = ["1", "2"];

sanity.isPositiveIntegerArray(intValArray);

/**
* Check valid email
**/

let email = "test@gmail.com";

sanity.isValidEmail(email);

/**
* Check valid calendar date along with YYYY-MM-DD date format
**/

let date = "2016-12-12";

sanity.isValidDate(date, "YYYY-MM-DD");
```