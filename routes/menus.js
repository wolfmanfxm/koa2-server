const router = require('koa-router')()
const Menu = require('./../models/menuSchema')
const Role = require('./../models/roleSchema')
const util = require('./../utils/util')
const jwt = require('jsonwebtoken')
const log4js = require('./../utils/logs4js')

router.prefix('/menu')

router.get('/list', async (ctx) => {
    const { menuName, menuState } = ctx.request.query;
    let params = {}
    if (menuName) params.menuName = menuName;
    if (menuState && menuState != 0) params.menuState = menuState;

    const res = await Menu.find(params)
    const treeList = getTreeMenu(res, null, [])
    log4js.info(JSON.stringify(treeList))

    ctx.body = util.success(treeList, '查询成功')
})

// 菜单树结构递归拼接
function getTreeMenu(rootList, id, father) {
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
        getTreeMenu(rootList, item._id, item.children)

        if (item.children.length == 0) {
            delete item.children;
        } else if (item.children[0].menuType == 2) {
            // 快速区分父级菜单或可操作功能菜单，用于后期做菜单按钮权限控制
            item.action = item.children;
        }
    })
    return father
}

router.post('/operate', async (ctx) => {
    const { _id, action, ...params } = ctx.request.body;
    let res, info;
    try {
        if (action == 'add') {
            res = await Menu.create(params)
            info = '新增成功'
        } else if (action == 'edit') {
            params.updateTime = new Date()
            res = await Menu.findByIdAndUpdate(_id, params)
            info = '编辑成功'
        } else {
            res = await Menu.findByIdAndRemove(_id)
            // $all : 包含;
            await Menu.deleteMany({ parentId: { $all: [_id] } })
            info = '删除成功'
        }
        ctx.body = util.success(res, info)
    } catch (err) {
        ctx.body = util.fail(`操作失败${err.stack}`)
    }
})

router.get('/accessList', async (ctx) => {
    let authorization = ctx.request.headers.authorization;
    if (authorization) {
        let token = authorization.split(' ')[1];
        let { data } = jwt.verify(token, 'secret')             // 解密 key 与 登陆 sign 加密时相同

        let res = null, treeList = [];
        if (data.role == 0) {
            res = await Menu.find({})
        } else {
            const roles = await Role.find({ _id: { $in: data.roleList } })
            let actionList = [];
            // 所有角色功能合并
            roles.map(role => {
                actionList = actionList.concat([...role.accessAction, ...role.halfAction])
            })
            // 去重
            actionList = [...new Set(actionList)]
            res = await Menu.find({ _id: { $in: actionList } })
        }
        treeList = getTreeMenu(res, null, [])
        log4js.info(JSON.stringify(treeList))

        ctx.body = util.success(treeList, '权限列表查询成功')
    } else {
        ctx.body = util.fail('Token无效', util.CODE.AUTH_ERROR)
    }
})


module.exports = router