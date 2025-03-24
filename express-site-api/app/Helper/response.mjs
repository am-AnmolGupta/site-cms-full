
export function success(res, message = 'success', data = {}) {
    let response = {
        status_code: 200,
        message: message,
        data: data,
    };
    res.json(response)
}
export function customFailedMessage(res, message, data = {}) {
    let response = {
        status_code:400 ,
        message: message,
        data: data,
    };
    res.json(response)
}
export function notFoundMessage(res, message, data = {}) {
    let response = {
        status_code:404 ,
        message: message,
        data: data,
    };
    res.json(response)
}

export function failed(res, message = 'failed', code = 100, data = {}) {
    let response = {
        status_code: code,
        message: message,
        data: data
    };
    res.json(response)
}
export function authFailed(res, message = 'failed') {
    let response = {
        status_code: 401,
        message: message,
    };
    res.json(response)
}

export function failedValidation(res, v) {

    let first_key = Object.keys(v.errors)[0];
    let err = v.errors[first_key]["message"];

    let response = {
        status_code: 100,
        message: err,
    };
    res.json(response);
}
export function customValidationFailed(res,code, msg) {
    let response = {
        status_code: code,
        message: msg,
        data:{}
    };
    res.json(response);
}

export function validationFailedRes(res, v) {

    let first_key = Object.keys(v.errors)[0];
    let err = v.errors[first_key]["message"];

    let response = {
        status_code: 422,
        message: err,
        data: {}
    };
    res.json(response);
};
