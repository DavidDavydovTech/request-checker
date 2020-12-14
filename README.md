# request-checker
## Summery

This module allows you to validate express requests without the hassle of re-writting validation code for every route in your API.

## About

Request-checker was born in mid-winter 2018 when I was doing web-APIs for the first time in my life. I got sick and tired of copy-pasting slightly different versions of the same code in to every post request, but every route was just different enough that I had no other choice. I ultimately made the precursor to this module (`Express-Request-Checker`), but anyone who isn't an absolute newbie could see that my module was a horrifying mess. Now in lm mid-winter 2020 I've come back to writing web-apis and have ran in to the same problem, so with experence and hindsight on my side I decided to create this module for me and others who need a simple and easy to implement request validator.

## How to Use

Request-checker is a express middleware meant to be implemented at the router-level. Below you can find a simple example.

```js
const app = require('express')();
const requestChecker = require('request-checker');

app.route('/message')
	.post(
		[
			requestChecker({
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
		}
```

In the example above the request will never hit the `(req, res) => {}` function below `requestChecker` unless there is a field called message within the body who's value is the typeof `string`. 

## Validation Options
Below you can find a list of different options for validation.

| Key Name  | Expected Input | About | 
| ------------- | ------------- |
| rcRequired | <boolean> | If set to true the request MUST contain this key-value pair or the request bounces. |
| rcType  | <string> | If this key-pair is present in the request and the value's type does not match rcType the request will bounce. |