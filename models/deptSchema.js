const mongoose = require('mongoose')

const deptSchema = mongoose.Schema({
    deptName: String,
    leaderName: String,
    leaderEmail: String,
    parentId: [String],
    createTime: {
        type: Date,
        default: Date.now()
    },
    updateTime: {
        type: Date,
        default: Date.now()
    },
})


module.exports = mongoose.model('dept', deptSchema)
