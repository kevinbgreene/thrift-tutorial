namespace js com.identity

struct User {
  1: required i32 id
  2: required string name
}

exception UserServiceException {
  1: required string message
}

service UserService {
  User getUser(1: i32 id) throws (1: UserServiceException exp)
}