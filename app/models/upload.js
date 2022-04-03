var mongoose = require('mongoose');

var schema = mongoose.Schema({
    name: String,
    size: Number,
    key: String,
    url: String,
    createdAt: {
        type: Date,
        default: Date.now,
    }
});
/*schema.pre('save', function() {
    if (!this.url) {
        this.url = `${process.env.APP_URL}/files/${this.key}`
    }
}); */

mongoose.model('Upload', schema);