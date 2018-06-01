exports.up = function (knex, Promise) {
    return knex.schema
        .createTableIfNotExists("account", function (t) {
            t.string('accountId', 55).notNull();
            t.string('email', 254).notNull();

            t.integer('createdAt').unsigned().notNull();
            t.integer('updatedAt').unsigned().nullable();

            t.primary('accountId');
            t.index('email');
        });
};


exports.down = function (knex, Promise) {
    return knex.schema
        .dropTableIfExists('account');
};