class QueryBuilder {
  constructor(query) {
    this.query = query;
  }

  get() {
    return this.query;
  }

  breakspace(args) {
    return args.split(',').join(' ');
  }

  filter(filter = {}) {
    this.query = this.query.find(filter);

    return this;
  }

  sort(extra = null) {
    if (extra && extra.sort) {
      this.query = this.query.sort(this.breakspace(extra.sort));
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  select(extra = null) {
    if (extra && extra.select) {
      this.query = this.query.select(this.breakspace(extra.select));
    }

    return this;
  }

  paginate(extra = null) {
    const page = (extra && extra.page) ? parseInt(extra.page) : 1;
    const perpage = (extra && extra.perpage) ? parseInt(extra.perpage) : 10;

    const skip = (page - 1) * perpage;

    this.query = this.query.skip(skip).limit(perpage);

    return this;
  }
};

exports.QueryBuilder = QueryBuilder;

exports.catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  }
};