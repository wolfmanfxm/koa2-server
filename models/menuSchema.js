const mongoose = require('mongoose')

const menuSchema = mongoose.Schema({
    // parentId: [mongoose.Types.ObjectId],
    parentId: [String],
    menuType: String,
    menuState: String,
    menuName: String,
    menuCode: String,
    path: String,
    icon: String,
    order: String,
    component: String,
    createTime: {
        type: Date,
        default: Date.now()
    },
    updateTime: {
        type: Date,
        default: Date.now()
    },
})

module.exports = mongoose.model('menu', menuSchema)
