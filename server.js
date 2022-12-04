const express = require('express');
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const userService = require("./user-service.js");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJWT = require('passport-jwt');

const HTTP_PORT = process.env.PORT || 8080;

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
jwtOptions.secretOrKey = '8J*6830J&Out';

app.use(express.json());
app.use(cors());

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {

      if (jwt_payload) {
        next(null, {
          _id: jwt_payload._id,
          userName: jwt_payload.userName      
        });
      } else {
        next(null, false);
      }
    });
passport.use(strategy);
app.use(passport.initialize);

app.post("/api/user/register", (req, res) => {
    userService.registerUser(req.body)
    .then((msg) => {
        res.json({ "message": msg });
    }).catch((msg) => {
        res.status(422).json({ "message": msg });
    });
});

app.post("/api/user/login", (req, res) => {
    userService.checkUser(req.body)
    .then((user) => {
        const payload = {
            _id: user._id,
            userName: user.userName
       };
       const token = jwt.sign(payload.env.secretOrKey);
       res.json({ "message": "login successful",token});
    }).catch(msg => {
        res.status(422).json({ "message": msg });
    });
});

app.get("/api/user/favourites", (req, res) => {
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        userService.getFavourites(req.user._id)
        .then(data => {
            res.json(data);
        }).catch(msg => {
            res.status(422).json({ error: msg });
        })
    }

});

app.put("/api/user/favourites/:id", (req, res) => {
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        userService.addFavourite(req.user._id, req.params.id)
        .then(data => {
            res.json(data)
        }).catch(msg => {
            res.status(422).json({ error: msg });
        })
    }
});

app.delete("/api/user/favourites/:id", (req, res) => {
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        userService.removeFavourite(req.user._id, req.params.id)
        .then(data => {
            res.json(data)
        }).catch(msg => {
            res.status(422).json({ error: msg });
        })
    }
});

app.get("/api/user/history", (req, res) => {
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        userService.getHistory(req.user._id)
        .then(data => {
            res.json(data);
        }).catch(msg => {
            res.status(422).json({ error: msg });
        })
    }

});

app.put("/api/user/history/:id", (req, res) => {
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        userService.addHistory(req.user._id, req.params.id)
        .then(data => {
            res.json(data)
        }).catch(msg => {
            res.status(422).json({ error: msg });
        })
    }
});

app.delete("/api/user/history/:id", (req, res) => {
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        userService.removeHistory(req.user._id, req.params.id)
        .then(data => {
            res.json(data)
        }).catch(msg => {
            res.status(422).json({ error: msg });
        })
    }
});

userService.connect()
.then(() => {
    app.listen(HTTP_PORT, () => { console.log("API listening on: " + HTTP_PORT) });
})
.catch((err) => {
    console.log("unable to start the server: " + err);
    process.exit();
});