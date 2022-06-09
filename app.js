const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const log4js = require('./utils/logs4js')

const router = require('koa-router')()
const users = require('./routes/users')

const koajwt = require('koa-jwt')
const util = require('./utils/util')

// error handler
onerror(app)

// 加载数据库配置
require('./config/db')

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  if (ctx.method == 'POST')
    log4js.info(`params:${JSON.stringify(ctx.request.body)}`)
  else
    log4js.info(`params:${JSON.stringify(ctx.request.query)}`)

  await next().catch(err => {
    if (err.status == 401) {  // koajwt 拦截解密认证失败时，会报 401
      ctx.status = 200;
      ctx.body = util.fail('', 'Token认证失败', util.CODE.AUTH_ERROR)
    } else {
      throw err
    }
  })
})

// 若放在上方 logger 前面，会先验证，失败后不会继续往后走，logger 中的代码不执行
app.use(koajwt({ secret: 'secret' }).unless({
  path: [/^\/api\/users\/login/]
}))

router.prefix('/api')

// routes
router.use(users.routes(), users.allowedMethods())

app.use(router.routes(), router.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  log4js.error(err, ctx)
});

module.exports = app
