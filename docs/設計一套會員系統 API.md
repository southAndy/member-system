
1. 需包含以下 api 但不限於

		登入
		登出
		查看會員資料
		修改密碼
		忘記密碼
		驗證 Email

2. 規劃各 API 的 Request & Response Body，以及各 API 的主要流程
	1. 例如：註冊帳號時應驗證帳號真實性、密碼格式驗證、資料表設計、程式碼跟資料表之間的互動等（能畫出流程圖佳）

3. (可選) 舉出會員系統還可以有哪些功能


## 實作

|          |        |                                                              |                                                                                                                         |                                                                          |                                                                                                                                                                                        |
| -------- | ------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 功能       | 方法     | 進入點                                                          | Request header                                                                                                          | Request body（JSON）                                                       | Response body (JSON)                                                                                                                                                                   |
| 註冊       | `POST` | `//before   ``api/v1/auth/register``      //after   api/v1/` | {  <br>Content-Type:application/json  <br>Accept: application/json  <br>}                                               | {  <br>userName: ==String==  <br>password: String  <br>//視需求添加其他值  <br>} | {  <br>status: “success”,  <br>data:{  <br>  <br>}  <br>}                                                                                                                              |
| 登入       | `POST` | `api/v1/auth/login`                                          | {  <br>Content-Type:application/json  <br>Accept: application/json  <br>}                                               | {  <br>userName: String  <br>password: String  <br>}                     | {  <br>status: “success”,  <br>data:{  <br>access_token: String,  <br>refresh_token: String,  <br>name: String,  <br>email: String,  <br>id: String  <br>}  <br>message: “登入成功”  <br>} |
| 登出       | `POST` | `api/v1/auth/logout`                                         | {  <br>Content-Type:application/json  <br>Accept: application/json  <br>==Authorization: Bearer <Access_Token>==  <br>} | {  <br>refresh_token: String  <br>}                                      | {  <br>status: “success”,  <br>message: “登出成功”  <br>}                                                                                                                                  |
| 刷新 token | `POST` | `api/v1/auth/refresh`                                        | {  <br>Content-Type:application/json  <br>Accept: application/json  <br>==Authorization: Bearer <Access_Token>==  <br>} | {  <br>refresh_token: String  <br>}                                      | {  <br>status: “success”,  <br>data:{  <br>access_token: String  <br>}  <br>message: “更新成功”  <br>}                                                                                     |
| 忘記密碼     | `POST` | `api/v1/auth/``forget`                                       | {  <br>Content-Type:application/json  <br>Accept: application/json  <br>==Authorization: Bearer <Access_Token>==  <br>} | {  <br>}                                                                 | {  <br>status: “success”,  <br>data:{  <br>access_token: String  <br>}  <br>message: “更新成功”  <br>}                                                                                     |

|        |          |                          |                                                                           |               |
| ------ | -------- | ------------------------ | ------------------------------------------------------------------------- | ------------- |
| 功能     | 方法       | 進入點                      | Request header                                                            | Response body |
| 編輯會員資料 | `PATCH`  | `api/v1/``member``/{id}` | {  <br>Content-Type:application/json  <br>Accept: application/json  <br>} |               |
| 刪除會員資料 | `DELETE` | `api/v1/member/{id}`     | {  <br>Content-Type:application/json  <br>Accept: application/json  <br>} |               |
| 查詢會員資料 | `GET`    | `api/v1/member/{id}`     | {  <br>Content-Type:application/json  <br>Accept: application/json  <br>} |               |
| 修改會員資料 | `PATCH`  |                          | {  <br>Content-Type:application/json  <br>Accept: application/json  <br>} |               |
## 資料表設計

```
model User {
  id             String    [PK]
  email          String    
  name           String                       
  password       String                        
  
  isVerified     Boolean   
  verificationToken String?                    
  
  // 時間戳記
  createdAt      DateTime  
  updatedAt      DateTime  
  lastLoginAt    DateTime  
  
  // 時間戳記 v2
  create_at      DateTime
  update_at      DateTime
  last_login_at. DateTime
  
  }
  
  model Token {
	token         String 
	user_id

}
```



