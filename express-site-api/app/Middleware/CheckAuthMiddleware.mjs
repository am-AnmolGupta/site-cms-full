
import jwt from 'jsonwebtoken';

const config = process.env;

export const CheckAuthMiddleware = (request, response, next) => {
    var decoded;
    
    if (request.headers['authorization'] || request.body.token) {
        const token = request.body.token || request.query.token || request.headers['authorization'].split(' ')[1];
        if (token) {
            try {
                decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
            } catch (error) {
                return response.status(401).json({
                    status: 401,
                    message: 'Token verification failed.',
                    data: {}
                });
            }
            request.user = decoded;
        }
    }
    else {
        return response.status(401).json({
            status: 401,
            message: 'Unauthenticated.',
            data: {}
        });
    }
    return next();
};
