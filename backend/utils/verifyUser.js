// import jwt from "jsonwebtoken";

// export const verifyToken = (req, res, next) => {
//   try {
//     let token;

//     // Check token from cookies
//     if (req.cookies && req.cookies.access_token) {
//       token = req.cookies.access_token;
//     }

//     // Check token from Authorization header
//     else if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer")
//     ) {
//       token = req.headers.authorization.split(" ")[1];
//     }

//     console.log("Token received:", token);

//     if (!token) {
//       return res
//         .status(403)
//         .json({ success: false, message: "No token provided" });
//     }

//     // Verify token using JWT_SECRET (from .env file)
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Attach user details to the request object
//     next(); // Proceed to the next middleware (route handler)
//   } catch (error) {
//     return res
//       .status(401)
//       .json({ success: false, message: "Unauthorized", error });
//   }
// };

import jwt from "jsonwebtoken";

// Middleware to verify the token
export const verifyToken = (req, res, next) => {
  try {
    let token;
    console.log("Cookies:", req.cookies);
 
    // Check token from cookies
    if (req.cookies && req.cookies.access_token) {
      console.log("Token from cookies:", req.cookies.access_token);

      token = req.cookies.access_token;
    }

    // Check token from Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(403)
        .json({ success: false, message: "No token provided" });
    }

    // Verify token
    const decodedVerified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedVerified; // Attach decoded token to request

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized", error });
  }
};

// Middleware to verify admin role
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admin privileges required",
      });
    }
    next();
  });
};

// Middleware to verify specific roles
export const verifyRole = (roles) => {
  return (req, res, next) => {
    verifyToken(req, res, () => {
      if (!roles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
      next();
    });
  };
};
