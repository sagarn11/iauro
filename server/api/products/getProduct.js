var express = require("express");
const Joi = require("joi");
const moment = require("moment");
var router = express.Router();
const db = require("../../../model/models");
const config = require("../../../config/config");

/* GET home page. */

router.get("/", async function (req, res) {
  let response = {};
  try {
    let data = await db.products.findAll({});
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

router.get("/website", async function (req, res) {
  let response = {};
  try {
    let data = await db.products.findAll({ where: { is_active: true } });
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
      let data = await db.products.findAll({ where });
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

router.post("/", async function (req, res) {
  let response = {};
  let payload = req.body;
  try {
    let schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      price: Joi.number().required().min(1).max(10000000),
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
        let data = await db.products.create(finalCreateData);
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
      name: Joi.string().required(),
      description: Joi.string().required(),
      price: Joi.number().required().min(1).max(10000000),
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
        let data = await db.products.findAll({ where });
        if (data.length > 0) {
          try {
            let finalUpdateData = {
              ...payload,
              updated_date: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            let updatedData = await db.products.update(finalUpdateData, {
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
        let data = await db.products.findAll({ where });
        if (data.length > 0) {
          try {
            let deletedData = await db.products.destroy({ where });
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
