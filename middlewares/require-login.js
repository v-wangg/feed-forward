module.exports = (req, res, next) => {
    /**
     * Since our backend routes are on the same domain as our frontend, if someone randomly visits a route        which REQUIRES a user to be already auth'd to work properly (such as the Stripe route), then the code      inside that route will fail, since it'll probably try to make access to the req.user model which won't     exist
     * Since there are many routes which require login, we can define our own middleware which checks if a user   is logged in, and apply it to any routes which require it
     * If there isn't, we'll set the STATUS of the response to 401, indicating Unauthorized Access; We can        then send back some additional info with it, in this case an error to be displayed underneath the          "Unauthorized Access" to be displayed to the user
     * Note: This middleware takes next() parameter as well which passes the req and res to the next middleware;  BUT since we're trying to stop users from entering routes within this middleware, we can immediately       make our middleware RETURN, stopping the request from moving onto any other middleware or any routes in    general; intead, we sent an error response to the user and that's it; we don't HAVE TO call next() if we   truly don't want the request to flow onto the next middleware
     * BUT: If a user actually does exist, we'll call next() like we have below
     */

    if (!req.user) {
        return res.status(401).send({ error: "You need to log in first!" });
    }

    next();
}