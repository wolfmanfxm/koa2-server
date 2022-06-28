const router = require('koa-router')()
const Dept = require('./../models/deptSchema')
const util = require('./../utils/util')
const log4js = require('./../utils/logs4js')

router.prefix('/dept')

router.get('/list', async (ctx) => {
    const { deptName } = ctx.request.query;
    let params = {}
    if (deptName) params.deptName = deptName;

    const res = await Dept.find(params)
    if (deptName) {
        ctx.body = util.success(res, '查询成功')
    } else {
        const treeList = getTreeDept(res, null, [])
        ctx.body = util.success(treeList, '查询成功')
    }
})

// 菜单树结构递归拼接
function getTreeDept(rootList, id, father) {
    for (let i of rootList) {
        // 若 Schema 中定义 parentId 数组中的元素数据类型为 ObjectId，则此处对比需要做类型转换, 即：
        // if (String(i.parentId[i.parentId.length - 1]) == String(id) {
        if (i.parentId[i.parentId.length - 1] == id) {
            // i 是查回来的 model , _doc 是它的文档表数据内容
            father.push(i._doc)
        }
    }
    father.map(item => {
        item.children = []
        getTreeDept(rootList, item._id, item.children)

        if (item.children.length == 0) {
            delete item.children;
        }
    })
    return father
}

router.post('/operate', async (ctx) => {
    const { _id, action, ...params } = ctx.request.body;
    let res, info;
    try {
        if (action == 'add') {
            res = await Dept.create(params)
            info = '新增成功'
        } else if (action == 'edit') {
            params.updateTime = new Date()
            res = await Dept.findByIdAndUpdate(_id, params)
            info = '编辑成功'
        } else {
            res = await Dept.findByIdAndRemove(_id)
            // $all : 包含;
            await Dept.deleteMany({ parentId: { $all: [_id] } })
            info = '删除成功'
        }
        ctx.body = util.success(res, info)
    } catch (err) {
        ctx.body = util.fail(`操作失败${err.stack}`)
    }
})


module.exports = router