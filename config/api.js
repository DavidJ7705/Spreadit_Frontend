// API Configuration for Spreadit Microservices

// Base URLs for each microservice
export const API_BASE_URLS = {
  USER_SERVICE: 'http://localhost:8001',
  COURSE_SERVICE: 'http://localhost:8002',
  MODULE_SERVICE: 'http://localhost:8003',
  POST_SERVICE: 'http://localhost:8004',
};

// User Service Endpoints
export const USER_API = {
  SIGN_UP: `${API_BASE_URLS.USER_SERVICE}/api/sign-up`,
  LOGIN: `${API_BASE_URLS.USER_SERVICE}/api/login`,
  GET_ALL_USERS: `${API_BASE_URLS.USER_SERVICE}/api/all-users`,
  GET_USER_BY_ID: (userId) => `${API_BASE_URLS.USER_SERVICE}/api/user-by-userid/${userId}`,
  GET_USER_BY_DB_ID: (userId) => `${API_BASE_URLS.USER_SERVICE}/api/user-by-db-id/${userId}`,
  UPDATE_USER: (userId) => `${API_BASE_URLS.USER_SERVICE}/api/update-user-by-userid/${userId}`,
  DELETE_USER: (userId) => `${API_BASE_URLS.USER_SERVICE}/api/delete-user-by-userid/${userId}`,
  PROXY_COURSES: `${API_BASE_URLS.USER_SERVICE}/api/proxy/courses`,
  PROXY_POSTS: `${API_BASE_URLS.USER_SERVICE}/api/proxy/posts`,
};

// Course Service Endpoints
export const COURSE_API = {
  GET_ALL_COURSES: `${API_BASE_URLS.COURSE_SERVICE}/api/get-all-courses`,
  GET_COURSE_BY_USER: (userId) => `${API_BASE_URLS.COURSE_SERVICE}/api/course-by-user-id/${userId}`,
  GET_COURSE_BY_ID: (courseId) => `${API_BASE_URLS.COURSE_SERVICE}/api/get-course-by-id/${courseId}`,
  ADD_COURSE: `${API_BASE_URLS.COURSE_SERVICE}/api/add-course`,
  UPDATE_COURSE: (courseId) => `${API_BASE_URLS.COURSE_SERVICE}/api/update-course-by-id/${courseId}`,
  PATCH_COURSE: (courseId) => `${API_BASE_URLS.COURSE_SERVICE}/api/patch-course-by-id/${courseId}`,
  DELETE_COURSE: (courseId) => `${API_BASE_URLS.COURSE_SERVICE}/api/delete-course-by-id/${courseId}`,
  ENROLL_USER: (courseId, userId) => `${API_BASE_URLS.COURSE_SERVICE}/api/courses/${courseId}/enroll/${userId}`,
  UNENROLL_USER: (courseId, userId) => `${API_BASE_URLS.COURSE_SERVICE}/api/courses/${courseId}/unenroll/${userId}`,
  PROXY_MODULES: `${API_BASE_URLS.COURSE_SERVICE}/api/proxy/modules`,
};

// Module Service Endpoints
export const MODULE_API = {
  GET_ALL_MODULES: `${API_BASE_URLS.MODULE_SERVICE}/api/module`,
  GET_MODULE_BY_ID: (moduleId) => `${API_BASE_URLS.MODULE_SERVICE}/api/module/${moduleId}`,
  CREATE_MODULE: `${API_BASE_URLS.MODULE_SERVICE}/api/module`,
  UPDATE_MODULE: (moduleId) => `${API_BASE_URLS.MODULE_SERVICE}/api/module/${moduleId}`,
  PATCH_MODULE: (moduleId) => `${API_BASE_URLS.MODULE_SERVICE}/api/module/${moduleId}`,
  DELETE_MODULE: (moduleId) => `${API_BASE_URLS.MODULE_SERVICE}/api/module/${moduleId}`,
  ENROLL_USER: (moduleId, userId) => `${API_BASE_URLS.MODULE_SERVICE}/api/modules/${moduleId}/enroll/${userId}`,
  UNENROLL_USER: (moduleId, userId) => `${API_BASE_URLS.MODULE_SERVICE}/api/modules/${moduleId}/unenroll/${userId}`,
  PROXY_POSTS: `${API_BASE_URLS.MODULE_SERVICE}/api/proxy/posts`,
};

// Post Service Endpoints
export const POST_API = {
  GET_ALL_POSTS: `${API_BASE_URLS.POST_SERVICE}/api/get-all-posts`,
  GET_POST_BY_ID: (postId) => `${API_BASE_URLS.POST_SERVICE}/api/post-by-id/${postId}`,
  GET_POSTS_BY_USER: (userId) => `${API_BASE_URLS.POST_SERVICE}/api/post-by-user_id/${userId}`,
  GET_POSTS_BY_MODULE: (moduleId) => `${API_BASE_URLS.POST_SERVICE}/api/post-by-module_id/${moduleId}`,
  ADD_POST: `${API_BASE_URLS.POST_SERVICE}/api/add-post`,
  UPDATE_POST: (postId) => `${API_BASE_URLS.POST_SERVICE}/api/update-post-by-id/${postId}`,
  DELETE_POST: (postId) => `${API_BASE_URLS.POST_SERVICE}/api/delete-post-by-id/${postId}`,

  // Likes
  GET_ALL_LIKES: `${API_BASE_URLS.POST_SERVICE}/api/likes`,
  ADD_LIKE: `${API_BASE_URLS.POST_SERVICE}/api/likes`,
  REMOVE_LIKE: (userId, postId) => `${API_BASE_URLS.POST_SERVICE}/api/likes?user_id=${userId}&post_id=${postId}`,

  // Comments
  GET_ALL_COMMENTS: `${API_BASE_URLS.POST_SERVICE}/api/comments`,
  GET_COMMENTS_FOR_POST: (postId) => `${API_BASE_URLS.POST_SERVICE}/api/comments/${postId}`,
  GET_COMMENTS_BY_USER: (userId) => `${API_BASE_URLS.POST_SERVICE}/api/comments-by-user/${userId}`,
  ADD_COMMENT: `${API_BASE_URLS.POST_SERVICE}/api/comments`,
  UPDATE_COMMENT: (commentId) => `${API_BASE_URLS.POST_SERVICE}/api/comments/${commentId}`,
  DELETE_COMMENT: (commentId) => `${API_BASE_URLS.POST_SERVICE}/api/comments/${commentId}`,
};
