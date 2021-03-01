class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const exclusions = ['page', 'sort', 'limit', 'fields'];
    exclusions.forEach((el) => delete queryObj[el]);

    // 2 advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  fieldLimit() {
    if (this.queryString.fields) {
      const field = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(field); // mongoDB Projection
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const pageNum = +this.queryString.page || 1;
    const limitNum = +this.queryString.limit || 100;
    const skip = (pageNum - 1) * limitNum;
    this.query = this.query.skip(skip).limit(limitNum);

    return this;
  }
}
module.exports = APIFeatures;
