import jwt from 'jsonwebtoken';
export const verifyToken = (req, res, next) => {
    const token = req.header('Authorization'); // Expecting token in the 'Authorization' header

    if (!token) {
        // If token is missing, redirect to login
        return res.redirect('/login'); // Frontend login route
    }

    try {
        // Verify the token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach the verified user to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        // If the token is invalid or expired, redirect to login
        res.redirect('/login');
    }
};
