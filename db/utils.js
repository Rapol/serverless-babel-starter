module.exports = {
    createTableifNotExist: (knex, name, createTableFn) => {
        return knex.schema.hasTable(name)
            .then(function(exists) {
                if(!exists){
                    return knex.schema.createTable(name, createTableFn);
                }
            });
    }
}