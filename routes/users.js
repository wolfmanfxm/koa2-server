/**
 * 用户管理模块
 */

const router = require('koa-router')()
const User = require('./../models/userSchema')
const util = require('./../utils/util')
const jwt = require('jsonwebtoken')

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

module.exports = router
