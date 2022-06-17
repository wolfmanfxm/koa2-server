/**
 * 用户管理模块
 */

const router = require('koa-router')()
const User = require('./../models/userSchema')
const Counter = require('./../models/counterSchema')
const util = require('./../utils/util')
const jwt = require('jsonwebtoken')
const md5 = require('md5')

router.prefix('/users')

router.post('/login', async (ctx, next) => {
  try {
    const { userName, userPwd } = ctx.request.body;
    const query = await User.findOne({
      userName,
      userPwd
    }, 'userId userName')    // 设置查询后只返回 userId 和 userName 字段
    const res = query._doc

    const token = jwt.sign({
      data: res
    }, 'secret', { expiresIn: '1h' })

    if (res) {
      res.token = token
      ctx.body = util.success(res)
    } else {
      ctx.body = util.fail("账号或密码错误")
    }
  } catch (err) {
    ctx.body = util.fail(err.msg)
  }
})

router.get('/list', async (ctx) => {
  const { userId, userName, state } = ctx.request.query;  // get 与 post 不同
  const { page, skipIndex } = util.pager(ctx.request.query)
  let params = {}
  if (userId) params.userId = userId;
  if (userName) params.userName = userName;
  if (state && state != 0) params.state = state;

  try {
    const query = User.find(params, { _id: 0, userPwd: 0 })
    const list = await query.skip(skipIndex).limit(page.pageSize)
    const total = await User.countDocuments(params);

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

router.post('/delete', async (ctx) => {
  const { userIds } = ctx.request.body
  // $in : 在其中; $or : 或者
  // User.updateMany({ $or: [{ userId: userIds[0] }, { userId: userIds[1] }] }, { state: 2 })
  const res = await User.updateMany({ userId: { $in: userIds } }, { state: 2 })
  console.log(res)
  if (res.modifiedCount) {
    ctx.body = util.success(res, `删除成功${res.modifiedCount}条`)
    return
  }
  ctx.body = util.fail('delete failed')
})

router.post('/operate', async (ctx) => {
  const { userId, userName, userEmail, mobile, job, state, roleList, deptId, action } = ctx.request.body

  if (!userName || !userEmail || !mobile || !deptId) {
    ctx.body = util.fail('缺少必要参数', util.CODE.PARAM_ERROR)
    return
  }

  if (action == 'add') {
    // $or : 或者
    const res = await User.findOne({ $or: [{ userEmail }, { mobile }] }, 'userName userId')
    console.log('res==>' + res)
    if (res) {
      ctx.body = util.fail(`该用户${res.userName}已存在,用户编号为${res.userId}`)
    } else {
      // $inc : 自增长; { new: true } : 返回最新值
      try {
        const doc = await Counter.findOneAndUpdate({ _id: 'userId' }, { $inc: { sequence_id: 1 } }, { new: true })
        const user = new User({
          userId: doc.sequence_id,
          userPwd: md5('888888'),
          role: 1,  // 默认普通用户
          userName, userEmail, mobile, job, state, roleList, deptId
        })
        user.save();
        ctx.body = util.success({}, '新增用户成功')
      } catch (err) {
        ctx.body = util.fail(`add failed: ${err.stack}`)
      }
    }
  } else {
    try {
      const res = await User.findOneAndUpdate({ userId }, { userName, userEmail, mobile, job, state, roleList, deptId })
      ctx.body = util.success(res, `编辑成功`)
    } catch (err) {
      ctx.body = util.fail(`edit failed: ${err.stack}`)
    }
  }
})




module.exports = router
