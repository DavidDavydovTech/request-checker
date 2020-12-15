# express-request-modeler

&nbsp;
## Summary

This module allows you to validate express requests without the hassle of re-writing validation code for every route in your API.

&nbsp;
## About

Express-request-modeler was born in mid-winter 2018 when I was doing web-APIs for the first time in my life. I got sick and tired of copy-pasting slightly different versions of the same code in to every post request, but every route was just different enough that I had no other choice. I ultimately made the precursor to this module (`Express-Request-Checker`; not to be confused with [pastgift's npm module of the same name](https://www.npmjs.com/package/express-request-checker)). That being said anyone who isn't an absolute newbie could see that my module was a horrifying mess. Now that it's mid-winter 2020 I'm coming back to writing web-APIs and have run into the same problem, so now with experience and hindsight on my side I've decided to create this improved module for me and others who need a simple and easy to implement request validator/modeler.

&nbsp;
## How to Use

Express-request-modeler is an Express middleware meant to be implemented at the router level. Below you can find a simple example.

```js
const app = require('express')();
app.use(json());
const reqModel = require('express-request-modeler');

app.route('/message')
  .post(
    [
      reqModel({
        body: {
          message: {
            rcRequired: true,
            rcType: 'string'
          }
        }
      })
    ], 
    (req, res) => {
      //...push message to database...
    });
```

In the example above the request will never hit the `(req, res) => {}` function below `reqModel` unless there is a field called message within the body whos value is has a type of `string`. 

&nbsp;
## Validation Options
Below you can find a list of different options for validation.

| Key Name  | Expected Input | About | 
| ------------- | ------------- | ------------- |
| rcRequired | `<boolean>`: true/false | If set to true the request MUST contain this key-value pair or the request bounces. |
| rcType  | `<string>`: string, number, boolean, object, array | If the parent key is present in the request and the parent key's value type does not match rcType the request will bounce. |
| rcMatching  | `<string, number, boolean>`: ANY VALUE | If the parent key is present in the request and its value does not match rcMatching the request will bounce. |
| rcFunc  | `<function>` | If the parent key is present in the request the function provided to rcFunc will run on the value to decide if it's valid or not. The user-provided function is expected to return true or false (if you don't your requests will start to hang). Currently doesn't work with async functions. |

&nbsp;
## Advanced Example
```js
const app = require('express')();
const reqModel = require('express-request-modeler');

app.route('/message')
  .post(
    [
      reqModel({
        headers: {
          'content-type': {
            rcMatching: 'application/json',
          }
        },

        body: {
          message: {
            rcRequired: true,
            rcType: 'string',
            rcFunc: (val) => {
              if (val.length < 220) {
                return true;
              }
              return false;
            },
            rcRejectStatus: '400',
            rcRejectMessage: 'Your message is too long!',
          }
        }
      })
    ], 
    (req, res) => {
      //...push message to database...
		});
```

&nbsp;
## Planned features

 * Allow a custom reject message for every rejection type.
 * Suppress detailed rejection messages.
 * An alternative to rcFunc that can mutate the request value.
 * Allow users to change the order in which validation checks occur.
 * Allow rcFunc to be an Async function (so that it can be used for things like validating user sessions or querying a database for validation.)