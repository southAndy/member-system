// TODO: 實作統一回應格式 interceptor
// 目標回應格式: { status: 'success' | 'error', data: {} }
//
// 實作方式：
// 1. 建立一個 NestInterceptor，在 intercept() 中用 RxJS 的 map() 包裝 response
// 2. 在 app.module.ts 用 APP_INTERCEPTOR 註冊為全域 interceptor
//
// 參考：
// - NestJS Interceptors: https://docs.nestjs.com/interceptors
// - APP_INTERCEPTOR: https://docs.nestjs.com/interceptors#binding-interceptors
