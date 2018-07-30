// A reusable middleware for any routes which require the user to use up their credits; same logic as require-login middleware, see require-login.js for note
module.exports = (req, res, next) => {
    if (req.user.credits < 1) {
        // Status code 402 is "Payment Required", though it's not released yet
        // Status code 403 is "Forbidden"; you're not authorized to do what you're trying to do
        // In reality, the status code doesn't really matter, as long as it's 400 - 499, indicating the user was doing something wrong rather than an internal server error
        return res.status(403).send({ error: "You don't have enough credits" });
    }

    next();
}