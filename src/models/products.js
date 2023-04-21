const { Schema, model, models } = require('mongoose')

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 40,
  },
  synonyms: {
    type: [String],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
  },
  stock: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  }
},
{
  timestamps: true,
  versionKey: false
})

module.exports = models.Product || model('Product', productSchema)