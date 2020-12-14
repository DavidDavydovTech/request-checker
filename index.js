const _get = require('lodash.get');
const validTypes = [
    'str',
    'string',
    'num',
    'number',
    'bool',
    'boolean',
    'obj',
    'object',
    'arr',
    'array'
];
const validRcTypes = [
    'rcRequired',
    'rcType',
    'rcFunc',
    'rcFuncFirst',
    'rcRejectMessage',
    'rcRejectStatus',
];

const exploreRequest = (request, requestModel) => {
    const modelKeys = Object.keys(requestModel);


    let returnVariable = true

    if(request === undefined){
        return {
            status: 500,
            message: `The request model became undefined.`
        }
    }
    else if(requestModel === undefined){
        return {
            status: 500,
            message: `The request became undefined.`
        }
    }

    
    for(let key of modelKeys) {
        if(returnVariable !== true){return returnVariable}
        
        if(request[key.toLowerCase()] !== undefined && request[key] === undefined){
            returnVariable = {
                status: 500,
                message: `Model tried to look for "${key}" but found "${key.toLowerCase()}" instead. Either change the JSON's key name or ask a developer to change the request model.`
            }
        }

        if( typeof requestModel[key] == "object" && requestModel[key].rcRequired == undefined ){

            if(request[key] !== undefined){
                returnVariable = exploreRequest(request[key], requestModel[key]);
            }
            else {
                returnVariable = {
                    status: 400,
                    message: `You are missing the "${key}" field in your request.`
                };
            }

        }
        else{
            const field = requestModel[key];
            if(field.rcRequired === true){

                if(!request[key]){
                    returnVariable = {
                        status: 400,
                        message: `You are missing the "${key}" field in your request.`
                    };
                }
                else if(field.type && typeof request[key] != field.type && (field.type == "number" && isNaN(request[key])? true: false)){
                    returnVariable = {
                        status: 400,
                        message: `"${key}" was expected to be a ${field.type}, but was a ${typeof request[key]} instead.`
                    };
                }
                else if(field.rcMatching && request[key] !== field.rcMatching){
                    returnVariable = {
                        status: 400,
                        message: `"${key}" must be ${field.rcMatching}, but was ${request[key]} instead.`
                    };
                }
                
            }

            if(field.message && returnVariable != true){
                returnVariable.message = field.message;
            }
        }
    }

    return returnVariable;

}

// SECTION rcTarget - Describes a criteria and/or set of actions that is ran given a path.
class rcTarget {
    constructor({
        rcPath,
        rcRequired = false,
        rcType,
        rcFunc,
        rcFuncFirst = false,
        rcRejectMessage,
        rcRejectStatus = 415,
    }) {
        this.runOrder = {
            before: [],
            main: [],
            cleanup: [],
        };
        // ANCHOR Path
        if (Array.isArray(rcPath) === false ) throw new Error(`Expected rcPath to be typeof array but got ${typeof rcPath} instead.`);
        this.rcPath = rcPath;
        // ANCHOR rcRequired
        if (rcRequired === true) {
            this.rcRequired = true;
            this.runOrder.before.push('rcRequired');
        }
        // ANCHOR rcType
        if (rcType !== undefined) {
            if (validTypes.includes(rcType) === false){
                throw new Error(`Expected rcType of ${this.rcPath.join(' => ')} to be a valid variable type but got ${rcType} instead.`);
            }
            this.rcType = rcType;
            this.runOrder.main.push('rcType');
        }
        // ANCHOR rcFunc
        if (rcFunc !== undefined) {
            if (typeof rcFunc !== 'function'){
                throw new Error(`Expected rcFunc to be typeof function but got typeof ${typeof rcFunc} instead.`);
            }
            this.rcFunc = rcFunc;
            if (rcFuncFirst === false) {
                this.runOrder.before.push('rcFunc');
            } else {
                this.runOrder.main.push('rcFunc');
            }
        }
        // ANCHOR Reject message & status
        this.rcRejectMessage = rcRejectMessage;
        this.rcRejectStatus = rcRejectStatus;
    }

    validate(req, res) {
        const { rcPath, rcRequired, rcType } = this;
        const value = _get(req, rcPath);
        if (rcRequired === true && value === undefined) {
            res.status(422).send(`Your request is missing a required value (${rcPath.join(' => ') + typeof rcType === 'string' ? `<typeof ${rcType.toUppercase()}>` : '<typeof ANY>'})`)
        } 
    }
}
// !SECTION

const requestChecker = (requestModel) => {
    const targetList = [];

    // ANCHOR Traverse the request model 
    (traverseModel = (obj, path = []) => {
        // This first part is to check if this is a options object or not.
        let isOptionsObject = false;
        for (let key in obj) {
            if (validRcTypes.includes(key)) {
                isOptionsObject = true;
                break;
            }
        }
        // IF it is a options object, turn it in to a rcTarget!
        if (isOptionsObject === true) {
            console.log(path)
            let arguements = {...obj};
            arguements.rcPath = path;
            console.log(arguements)
            targetList.push(new rcTarget(arguements));
        } else { // Otherwise run this function on this object's children IF they're an object.
            for (let key in obj) {
                if (typeof obj[key] === 'object') {
                    let newPath = [...path, key];
                    traverseModel(obj[key], newPath);
                }
            }
        }
    })(requestModel);
    console.log(targetList);
    
    return async (req, res, next) => {
        // Go through all targets in the targets array
        for (let target of targetList) {
            // Check the validity of the target
            const valid = target.validate(req, res);
            // If the request isn't valid the method above has already sent a error message and we need to escape the loop/function.
            if (valid !== true) {
                return;
            }
        }
        // If we didn't escape the function in the code above everything probably lines up and we can keep going. 
        next();
    }
}

module.exports = requestChecker;