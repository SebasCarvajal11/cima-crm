module.exports.auth = (req, res, next) => {
    //console.log(accesstoken);
    const { accesstoken } = req.headers;
    
    
    if (accesstoken) {
        const nJwt = require('njwt');
        nJwt.verify(accesstoken, 'secret', 'HS256', function (error, verifiedJwt) {
            if (!error) {
                const { sub, email } = verifiedJwt.body;
                req.activeUserId = sub;
                req.activeUserEmail = email;
                if (req.params.userId === 'me' || req.params.userId === 'my') {
                    req.params.userId = sub
                }
                if (!isNaN(req.params.userId)) {
                    req.params.userId = parseInt(req.params.userId, 10);
                }
                return next();
            } else {
                return res.status(401).json({
                    error: 'Invalid accesstoken',
                    message: 'Int'
                });
            }
        });
    } else {
        return res.status(401).json({
            error: 'accesstoken required',
            message: 'Int'
        });
    }
}