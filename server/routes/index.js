const userRouter = require("./userRouter");
const letterRouter = require("./letterRouter");

const { notFound, errHandler } = require("../middlewares/errorHandler");

const initRoutes = (app) => { 
    app.use("/api/user", userRouter);
    app.use("/api/letter", letterRouter);


    app.use(notFound);
    app.use(errHandler);
}

module.exports = initRoutes;