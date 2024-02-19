class ApiError extends Error{
    constructor(statusCode, message = "Error message", errors = [], stack = "") {
        // this message will be passed to the inbuilt Error class' message
        // order of parameter matters
        super(message);

        this.message = message;
        this.statusCode = statusCode;
        this.errors = errors;
        this.success = false;
        this.data = null;
        
        // stack condition
        if (stack != "") {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { 
    ApiError,
}