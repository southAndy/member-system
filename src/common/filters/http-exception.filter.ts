// TODO: 實作統一錯誤回應格式 exception filter
// 目標格式: { status: 'error', data: null, message: '錯誤訊息' }
//
// 實作方式：
// 1. 建立一個 ExceptionFilter，實作 catch() 方法
// 2. 從 exception 取得 status code 和錯誤訊息，包裝成統一格式回傳
// 3. 在 app.module.ts 用 APP_FILTER 註冊為全域 filter
//
// 參考：
// - NestJS Exception Filters: https://docs.nestjs.com/exception-filters
// - APP_FILTER: https://docs.nestjs.com/exception-filters#binding-filters
