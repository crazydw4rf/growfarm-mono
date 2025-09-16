# Login user
POST http://localhost:3000/v1/auth/login
{
  "email": "ucup123@xyz.com",
  "password": "ucup123456"
}
HTTP 200
[Asserts]
cookie "token" matches "ey.+"
cookie "refresh_token" matches "ey.+"
cookie "token[Path]" == "/"
cookie "refresh_token[Path]" == "/v1/auth/refresh"

# Get projects
GET http://localhost:3000/v1/projects
{
  "skip": 0,
  "take": 2
}
HTTP 200
[Asserts]
jsonpath "$.data" count == 2
jsonpath "$.data[0].project_name" exists

