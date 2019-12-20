// const _ = require('lodash')

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
        }
    }

    return returnVariable;

}

const requestChecker = (requestModel) => {
    return async (req, res, next) => {

        
        let reqCheck = await exploreRequest(req, requestModel);

        if(typeof reqCheck == "object" && reqCheck.status && reqCheck.message){
            res.status(reqCheck.status).json(reqCheck.message);
            return
        }
        else{
            next();
        }
    }
}

module.exports = requestChecker;
