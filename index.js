const mongoose = require("mongoose");
require("dotenv").config();
const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const cors = require("cors");
const utils = require("./utils");
//const validate = require("deep-email-validator");
//services
const JS = require("./services/JsonService");
const UserService = require("./services/UserService");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

function sendFailedRequest(res, message) {
  return res.status(400).send({ message: message });
}
const validateUser = async (req, res, next) => {
  const headers = req.headers;
  const authorization = headers.authorization;
  if (!authorization) {
    return res.status(403).send({ message: "Forbidden access, login first" });
  }
  //validate the token itself
  const val = await utils.verifyToken(authorization.split(" ")[1]);
  if (!val) {
    return res.status(403).send({ message: "Access expired, login first" });
  }
  req.userID = val.payload.userID;
  const user = await UserService.getUserById(req.userID);
  if(!user) return sendFailedRequest(res, "Forbidden access");
  req.user = user;
  next();
};
const validateKey =  async (req, res, next) => {
    const headers = req.headers;
    const authorization = headers.authorization;
    if (!authorization) {
      return res.status(403).send({ message: "Forbidden access, login first" });
    }
    const key = authorization;
    //validate the key itself

    next();
  };
app.get("/", (_, res) => {
  res.sendStatus(200);
});
app.get("/json/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) return sendFailedRequest(res, "ID missing");
  try {
    const data = await JS.getJSONdataById(id);
    if (!data) return sendFailedRequest(res, "JSON does not exist");
    if (!data.public) return sendFailedRequest(res, "JSON does not exist");
    const json = {
      json: data.jsonData,
      status: data.status,
      public: data.public,
      jsonKey: data.jsonKey,
      version: data.version
    };
    res.send(json);
  } catch {
    sendFailedRequest(res, "Not found");
  }
});
app.get("/haschanged/json/:id/:version", async (req, res) => {
  const id = req.params.id;
  const version = req.params.version;
  if (!id) return sendFailedRequest(res, "ID missing");
  try {
    const data = await JS.getJSONdataById(id);
    if (!data) return sendFailedRequest(res, "JSON does not exist");
    var changed = false;
    if(data.version != version) {
       changed = true;
    }
    console.log(version, data.version)
    return res.sendStatus(changed ? 200 : 400);
  } catch (err){
    console.log(err);
    sendFailedRequest(res, "Not found");
  }
});
app.post("/json", async (req, res) => {
  const body = req.body;
  body.jsonID = utils.generateID();
  if (body.jsonData === "" || body.jsonData === undefined)
    return sendFailedRequest(res, "JSON data field is empty");
    if (body.jsonKey === "" || body.jsonKey === undefined)
    return sendFailedRequest(res, "jsonKey is required");
  //body.jsonData = JSON.stringify(body.jsonData)
  // if (!utils.isValidObject(body.jsonData))
  //   return sendFailedRequest(res, "JSONdATA is not a valid JSON object");

  try {
    const data = await JS.createJSONdata(body);
    const json = {
      json: data.jsonData,
      status: data.status,
      public: data.public,
      id: data.jsonID,
    };
    res.send(json);
  } catch (err) {
    sendFailedRequest(res, "Failed to create json data");
  }
});
app.get("/key/:jsonkey", async (req, res)=> {
    const key = req.params.jsonkey;
    try {
      const isKey =  await JS.getDataByKey(key);
      if(!isKey) return sendFailedRequest(res, "Data does not exist");
      res.send(isKey);
    }
    catch (err) {
      return sendFailedRequest(res, "Data does not exist or error occured")
    }
})
app.put("/json", async (req, res) => {});
app.post("/auth", async (req, res) => {
  const body = req.body;
  const { email, password, login } = body;
  if (!email || email === "") return sendFailedRequest(res, "Invalid email");
  if (!password || password.length < 5)
    return sendFailedRequest(res, "Invalid password");
  try {
    if (!utils.isValidEmail(email))
      return sendFailedRequest(
        res,
        "Invalid email address or email address unreachable"
      );
    //check if user exist
    var user = await UserService.getUserByEmail(email);
    if (login) {
      if (!user) return sendFailedRequest(res, "Incorrect email or password");
      const hashedPassword = user.password;
      const validatePassword = await utils.validateHash(
        hashedPassword,
        password
      );
      if (!validatePassword)
        return sendFailedRequest(res, "Incorrect email or password");
    } else {
      if (user) return sendFailedRequest(res, "User already exist");
      //sign the mf up
      const newuser = {
        email,
        userID: utils.generateID(),
      };
      newuser.password = await utils.createHash(password);
      newuser.keys = {
        public: utils.generateID(),
        private: utils.generateID(),
      };
      const createUser = await UserService.createUser(newuser);
      user = createUser;
    }

    const response = {
      email: user.email,
      userID: user.userID,
      status: user.status,
      message: "Successful",
    };
    response.token = await utils.signToken(response);
    //fetch all user buckets
    response.buckets = [];
    response.json = await JS.getDefaultUserJSON(user.userID);
    res.status(200).send(response);
  } catch (err) {
    return sendFailedRequest(res, "Failed to authenticate");
  }
});
app.post("/app/json", validateUser, async (req, res) => {
  const body = req.body;
  body.userID = req.userID;
  body.jsonID = utils.generateID();
  if (body.jsonData === "" || body.jsonData === undefined)
    return sendFailedRequest(res, "JSON data field is empty");
  try {
    const data = await JS.createJSONdata(body);
    const json = {
      json: data.jsonData,
      status: data.status,
      public: data.public,
      id: data.jsonID,
    };
    res.send(json);
  } catch (err) {
    console.log(err);
    sendFailedRequest(res, "Failed to create json data");
  }
});
app.get("/app/json/:id", validateUser, async (req, res) => {
  const id = req.params.id;
  if (!id) return sendFailedRequest(res, "ID missing");
  try {
    const data = await JS.getJSONdataById(id);
    if (!data) return sendFailedRequest(res, "JSON does not exist");
    if (!data.public) {
      if (data.userID !== req.userID)
        return sendFailedRequest(res, "JSON does not exist.");
    }
    const json = {
      json: data.jsonData,
      status: data.status,
      public: data.public,
      version: data.version,
    };
    res.send(json);
  } catch {
    sendFailedRequest(res, "Not found");
  }
});
app.put("/app/json/:id", validateUser, async (req, res) => {
  const id = req.params.id;
  const newJSON = req.body;
  if (!id) return sendFailedRequest(res, "ID missing");
  try {
    const data = await JS.getJSONdataById(id);
    if (!data) return sendFailedRequest(res, "JSON does not exist");
    if (!data.public) {
      if (data.userID !== req.userID)
        return sendFailedRequest(res, "JSON does not exist.");
    }
    const t = data.tracks
    t.push(data.jsonData)
    const json = {
      _id: data._id,
      tracks: t,
      version:data.version + 1,
      jsonData: newJSON.jsonData,
      updatedAt: Date.now()
    };
    const update = await JS.updateJSON(json);
    const jsonresponse = {
      json: newJSON.jsonData,
      status: data.status,
      public: data.public,
      id: data.jsonID,
      version: data.version,
    };
    res.send(jsonresponse);
  } catch {
    sendFailedRequest(res, "Not found");
  }
});
app.post("/api/json", validateKey, async(req, res)=> {
    const headers = req.headers;
    res.sendStatus(200);
})
app.get("*", (_, res) => {
  return res.status(404).send("Not found");
});
app.post("*", (_, res) => {
  return res.status(404).send("Not found");
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).send("Something went wrong!");
});

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/CRUD", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "jsonace", // specify the database name here
  })
  .then(() => console.log("connected to mongodb"))
  .catch(() => console.log("error occured connecting to mongodb"));

app.listen(process.env.PORT || 3001, () => {
  console.log("Server is running on port 3001");
});
module.exports = app;
