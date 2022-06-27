/**
 * 计数器，维护用户id自增表；否则遍历users表增加id，性能体验较差
 */

const mongoose = require('mongoose')

const roleSchema = mongoose.Schema({
    roleName: String,
    remark: String,
    accessAction: [],
    halfAction: [],
    createTime: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('role', roleSchema)
