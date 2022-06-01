var express = require("express");
const Joi = require("joi");
const moment = require("moment");
var router = express.Router();
const db = require("../../../model/models");
const config = require("../../../config/config");
const { Op } = require("sequelize");

/* GET home page. */

router.get("/", async function (req, res) {
  let response = {};
  try {
    let data = await db.user.findAll({
      where: {
        is_active: true,
        username: {
          [Op.ne]: "admin",
        },
      },
    });
    response = { code: "SUCCESS", message: "SUCCESS", data: data, error: null };
  } catch (error) {
    console.log({ error });
    response = {
      code: "FAILED",
      message: "Something Went Wrong, Please Connect to APP Admin",
      data: null,
      error: error,
    };
  }
  res.send(response);
});

router.get("/:id", async function (req, res) {
  let response = {};
  try {
    let schema = Joi.object({
      id: Joi.number().required(),
    });
    let { error } = schema.validate(req.params);
    if (error) {
      response = { code: "FAILED", message: error.details[0].message };
    } else {
      let where = req.params.id ? { id: req.params.id, is_active: true } : {};
      let data = await db.user.findAll({ where });
      if (data.length > 0) {
        response = {
          code: "SUCCESS",
          message: "SUCCESS",
          data: data,
          error: null,
        };
      } else {
        response = {
          code: "SUCCESS",
          message: "No Data Found",
          data: data,
          error: null,
        };
      }
    }
  } catch (error) {
    console.log({ error });
    response = {
      code: "FAILED",
      message: "Something Went Wrong, Please Connect to APP Admin",
      data: null,
      error: error,
    };
  }
  res.send(response);
});

router.post("/signup", async function (req, res) {
  let response = {};
  let payload = req.body;
  try {
    let schema = Joi.object({
      username: Joi.string()
        .required()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
      password: Joi.string().required().min(3).max(15),
      repeat_password: Joi.any()
        .valid(Joi.ref("password"))
        .required()
        .options({ messages: { "any.only": "{{#label}} does not match" } }),

      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      is_active: Joi.boolean().required(),
      created_by: Joi.number().required(),
    });

    let { error } = schema.validate(payload);
    if (error) {
      response = { code: "FAILED", message: error.details[0].message };
    } else {
      let finalCreateData = {
        ...payload,
        created_date: moment().format("YYYY-MM-DD HH:mm:ss"),
      };
      try {
        let exists = await db.user.findOne({
          where: { username: payload.username },
        });
        if (exists) {
          response = {
            code: "FAILED",
            message: "User Already Exists, Please try Logging In",
            data: null,
            error: null,
          };
        } else {
          let data = await db.user.create(finalCreateData);
          if (data) {
            response = {
              code: "SUCCESS",
              message: "SUCCESS",
              data: data,
              error: null,
            };
          } else {
            response = {
              code: "FAILED",
              message: "Unable to create",
              data: data,
              error: null,
            };
          }
        }
      } catch (error) {
        console.log({ error });

        response = {
          code: "FAILED",
          message: "Something Went Wrong, Please Connect to APP Admin",
          data: null,
          error: error,
        };
      }
    }
  } catch (error) {
    console.log({ error });
    response = {
      code: "FAILED",
      message: "Something Went Wrong, Please Connect to APP Admin",
      data: null,
      error: error,
    };
  }
  res.send(response);
});

router.post("/signin", async function (req, res) {
  let response = {};
  let payload = req.body;
  try {
    let schema = Joi.object({
      username: Joi.string().required(),
      // .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
      password: Joi.string().required().min(3).max(15),
    });

    let { error } = schema.validate(payload);
    if (error) {
      response = { code: "FAILED", message: error.details[0].message };
    } else {
      try {
        let where = { username: payload.username };
        let data = await db.user.findOne({ where });
        // console.log({ data });
        if (data) {
          if (data.password === payload.password) {
            response = {
              code: "SUCCESS",
              message: "SUCCESS",
              data: { AccessAllowed: true },
              error: null,
            };

            if (data.username == config.username) {
              response.data = {
                ...response.data,
                admintoken: config.admintoken,
              };
            } else {
              console.log({ data: data.username, config: config.username });
            }
          } else {
            response = {
              code: "FAILED",
              message: "Invalid UserName or Password",
              data: { AccessAllowed: false },
              error: null,
            };
          }
        } else {
          response = {
            code: "SUCCESS",
            message: `User ${payload.username} does not exists`,
            data: data,
            error: null,
          };
        }
      } catch (error) {
        response = {
          code: "FAILED",
          message: "Something Went Wrong, Please Connect to APP Admin",
          data: null,
          error: error,
        };
      }
    }
  } catch (error) {
    console.log({ error });
    response = {
      code: "FAILED",
      message: "Something Went Wrong, Please Connect to APP Admin",
      data: null,
      error: error,
    };
  }
  res.send(response);
});

router.patch("/:id", async function (req, res) {
  let response = {};
  let payload = req.body;
  try {
    let schema = Joi.object({
      username: Joi.string()
        .required()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
      password: Joi.string().required().min(3).max(15),
      repeat_password: Joi.any()
        .valid(Joi.ref("password"))
        .required()
        .options({ messages: { "any.only": "{{#label}} does not match" } }),

      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      is_active: Joi.boolean().required(),
      updated_by: Joi.number().required(),
    });

    let headerSchema = Joi.object({
      admintoken: Joi.string().required(),
    }).options({ allowUnknown: true });

    let { error } = schema.validate(payload);
    let { error: headerError } = headerSchema.validate(req.headers);
    if (error || headerError) {
      response = {
        code: "FAILED",
        message: headerError?.details[0]?.message || error?.details[0]?.message,
      };
    } else {
      if (config.admintoken !== req.headers.admintoken) {
        response = {
          code: "FAILED",
          message: "Invaid Token",
        };
      } else {
        let where = req.params.id ? { id: req.params.id } : {};
        let data = await db.user.findAll({ where });
        if (data.length > 0) {
          try {
            let finalUpdateData = {
              ...payload,
              updated_date: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            let updatedData = await db.user.update(finalUpdateData, {
              where,
            });
            if (updatedData) {
              response = {
                code: "SUCCESS",
                message: `${req.params.id} Updated`,
                data: null,
                error: error,
              };
            } else {
              response = {
                code: "FAILED",
                message: "UNABLE TO UPDATE DATA",
                data: null,
                error: error,
              };
            }
          } catch (error) {
            console.log({ error });
            response = {
              code: "FAILED",
              message: "Something Went Wrong, Please Connect to APP Admin",
              data: null,
              error: error,
            };
          }
          response = {
            code: "SUCCESS",
            message: "SUCCESS",
            data: data,
            error: null,
          };
        } else {
          response = {
            code: "FAILED",
            message: `Data Does Not Exists for ${req.params.id}`,
            data: data,
            error: null,
          };
        }
      }
    }
  } catch (error) {
    console.log({ error });
    response = {
      code: "FAILED",
      message: "Something Went Wrong, Please Connect to APP Admin",
      data: null,
      error: error,
    };
  }
  res.send(response);
});

router.delete("/:id", async function (req, res) {
  let response = {};
  try {
    let headerSchema = Joi.object({
      admintoken: Joi.string().required().valid(),
    }).options({ allowUnknown: true });

    let { error: headerError } = headerSchema.validate(req.headers);
    console.log(req.headers);
    if (headerError) {
      response = {
        code: "FAILED",
        message: headerError?.details[0]?.message,
      };
    } else {
      if (config.admintoken !== req.headers.admintoken) {
        response = {
          code: "FAILED",
          message: "Invaid Token",
        };
      } else {
        let where = req.params.id ? { id: req.params.id } : {};
        let data = await db.user.findAll({ where });
        if (data.length > 0) {
          try {
            let deletedData = await db.user.destroy({ where });
            if (deletedData) {
              response = {
                code: "SUCCESS",
                message: `${req.params.id} Deleted`,
                data: null,
                error: error,
              };
            } else {
              response = {
                code: "FAILED",
                message: "UNABALE TO DELETE DATA",
                data: null,
                error: error,
              };
            }
          } catch (error) {
            console.log({ error });
            response = {
              code: "FAILED",
              message: "Something Went Wrong, Please Connect to APP Admin",
              data: null,
              error: error,
            };
          }
          response = {
            code: "SUCCESS",
            message: "SUCCESS",
            data: data,
            error: null,
          };
        } else {
          response = {
            code: "FAILED",
            message: `Data Does Not Exists for ${req.params.id}`,
            data: data,
            error: null,
          };
        }
      }
    }
  } catch (error) {
    response = {
      code: "FAILED",
      message: "Something Went Wrong, Please Connect to APP Admin",
      data: null,
      error: error,
    };
  }
  res.send(response);
});

module.exports = { router };
