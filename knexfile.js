module.exports = {
    dev: {
        client: 'mysql',
        connection: {
            "host": "127.0.0.1",
            "port": "9999",
            "database": "foo",
            "user": "bar",
            "password": "hunter"
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './db/migrations'
        },
        seeds: {
            directory: './db/seeds'
        },
        debug: true
    },
};