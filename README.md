# Express-Request-Checker
Makeshift middleware made so that I don't have to type/copy-paste the same code and modify it slightly for every request. 

Middleware is used like this:

	.post(checker({
		headers: {
			"content-type": {
				rcRequired: true,
				rcMatching: "application/json"
			}
		},

		body: {
			"username": {
				rcRequired: true,
				type: "string"
			},
			"password": {
				rcRequired: true,
				type: "string"
			}
		}

	}), (req, res) => {
    //...Your request here.
  }
  
This was literally scrapped together in an hour (lots of revisions) so you shouldn't use this for anything other than quick tests.

Pro Tip: express will convert headers like "Content-Type" to lower case, this middleware CHECKS for case discrepancies between the model's keys and the request's keys, but doesn't correct anything.
