

async function verifyAdmin(req, res, next) {

    console.log(req)
    if (req.user && req.user.isAdmin)
        return next();
    else
        return res.status(403).send({ error: { status: 403, message: 'Access denied.' } });

}

module.exports = {
    verifyAdmin,
}