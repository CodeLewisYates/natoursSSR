const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have no more than 40 characters'],
      minlength: [10, 'A tour name must have no less than 10 characters'],
      //validate: [validator.isAlpha, 'Tour name must only contain letters'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current document on NEW document creations -NOT updates
          return val < this.price;
        },
        message:
          'Discount price ({VALUE}) greater than regular price - validation failure',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    slug: {
      type: String,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // geoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

toursSchema.index({ price: 1, ratingsAverage: -1 });
toursSchema.index({ slug: 1 });
toursSchema.index({ startLocation: '2dsphere' });

toursSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate
toursSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// document middleware, runs before .save() and .create()
toursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// EMBEDDING USERS WITH TOURS --- WE DONT WANT
// toursSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (el) => await User.findById(el));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
// toursSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

// Query middleware
toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); //.select('-secretTour');
  this.start = Date.now();
  next();
});

toursSchema.post(/^find/, function (docs, next) {
  console.log(Date.now() - this.start);
  //console.log(docs);
  next();
});

toursSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

//aggregation middleware
toursSchema.pre('aggregate', function (next) {
  const aggregationVar = this.pipeline()[0];
  if (Object.keys(aggregationVar)[0] !== '$geoNear') {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  }
  next();
});

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
