const userRouter = require("./userRoute");

const { notFound, errHandler } = require("../middlewares/errorHandler");

const initRoutes = (app) => { 
    app.use("/api/user", userRouter);


    app.use(notFound);
    app.use(errHandler);
}

module.exports = initRoutes;