const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

module.exports.chatMessageSchema = Joi.object({
  text: Joi.string().required().escapeHTML(),
});

module.exports.roomSchema = Joi.object({
  name: Joi.string().max(20).required().escapeHTML(),
  chatMessages: Joi.array(),
  gameFen: Joi.string(),
});
