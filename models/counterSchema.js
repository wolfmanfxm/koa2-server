/**
 * 计数器，维护用户id自增表；否则遍历users表增加id，性能体验较差
 */

const mongoose = require('mongoose')

const counterSchema = mongoose.Schema({
    "_id": String,
    "sequence_id": Number
})

module.exports = mongoose.model('counter', counterSchema)

