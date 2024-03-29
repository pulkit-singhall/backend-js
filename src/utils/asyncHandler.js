// to implement various functions 
const asyncHandler = function(func) {
    return (req, res, next) => {
        Promise.resolve(func(req, res, next)).catch((error) => {
            next(error);
        })
    }
}

export {
    asyncHandler,
}