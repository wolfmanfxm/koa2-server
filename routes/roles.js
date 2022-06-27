/**
 * 用户管理模块
 */

const router = require('koa-router')()
const Role = require('./../models/roleSchema')
const util = require('./../utils/util')

router.prefix('/roles')

router.get('/list', async (ctx) => {
    const { roleName } = ctx.request.query;  // get 与 post 不同
    const { page, skipIndex } = util.pager(ctx.request.query)
    let params = {}
    if (roleName) params.roleName = roleName;

    try {
        const query = Role.find(params)
        // query API : skip - 指定跳过的文档条数 ; limit - 指定查询结果的最大条数
        const list = await query.skip(skipIndex).limit(page.pageSize)
        // countDocuments : 计数，满足条件的总条数;
        const total = await Role.countDocuments(params);

        ctx.body = util.success({
            page: {
                ...page,
                total
            },
            list
        })
    } catch (err) {
        ctx.body = util.fail(`查询异常:${err.stack}`)
    }
})

router.post('/operate', async (ctx) => {
    const { _id, action, ...params } = ctx.request.body;
    let res, info;
    try {
        if (action == 'add') {
            res = await Role.create(params)
            info = '新增成功'
        } else if (action == 'edit') {
            params.updateTime = new Date()
            res = await Role.findByIdAndUpdate(_id, params)
            info = '编辑成功'
        } else {
            res = await Role.findByIdAndRemove(_id)
            info = '删除成功'
        }
        ctx.body = util.success(res, info)
    } catch (err) {
        ctx.body = util.fail(`操作失败${err.stack}`)
    }
})


module.exports = router
