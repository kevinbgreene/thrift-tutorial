namespace js com.content

include 'identity/UserService.thrift'

struct PublishedDate {
  1: i32 month
  2: i32 day
  3: i32 year
}

struct Post {
  1: required i32 id
  2: required UserService.User author
  3: required PublishedDate date
  4: required string title
  5: optional string body
}

exception ContentServiceException {
  1: required string message
}

service ContentService {
  Post getPost(1: i32 postId) throws (1: ContentServiceException exp)
}