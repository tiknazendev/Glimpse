const { admin, db } = require("./admin");

module.exports = (req, res, next) => {
  let idToken, tok;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("no token found");
    return res.status(403).json({ error: "Unauthorized" });
  }
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.user.userHandle = data.docs[0].data().userHandle;
      req.user.imageUrl = data.docs[0].data().image;
      return next();
    })
    .catch((err) => {
      console.error("error while verfing user token ", err);
      return res.status(403).json(err);
    });
};
