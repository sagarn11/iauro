let config = {
    development: {
      username: "root",
      password: "password",
      database: "iauro",
      host: "127.0.0.1",
      dialect: "mysql",
      // timezone: 'Asia/Kolkata',
      logging:false
    },  
    test: {
      username: "root",
      password: "password",
      database: "iauro",
      host: "127.0.0.1",
      dialect: "mysql",
      // timezone: 'Asia/Kolkata',
      logging:false
    },
    production: {
      username: "root",
      password: "password",
      database: "iauro",
      host: "127.0.0.1",
      dialect: "mysql",
      // timezone: 'Asia/Kolkata',
      logging:false
    }
  }

  module.exports = config;;