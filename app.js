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

  // const start = new Date()
  await next()
  // const ms = new Date() - start
  // console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// 未定义abc，触发 error 监听
// app.use(() => {
//   console.log(abc)
// })

router.prefix('/api')

// routes
router.use(users.routes(), users.allowedMethods())

app.use(router.routes(), router.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  log4js.error(err, ctx)
});

module.exports = app
