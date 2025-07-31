export const constants = {

  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB

//   ROLES: {
//     ADMIN: 'admin',
//     USER: 'user',
//   },
}

export default app => {
  app.provide('constants', constants)
}
