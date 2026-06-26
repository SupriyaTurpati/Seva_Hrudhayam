const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Utility to convert camelCase to snake_case
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Utility to convert snake_case to camelCase
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Helper to convert DB rows (snake_case) to JS objects (camelCase)
function mapRowToObj(row) {
  if (!row) return null;
  const obj = {};
  for (const key of Object.keys(row)) {
    obj[toCamelCase(key)] = row[key];
  }
  // Setup _id alias for frontend compatibility
  if (obj.id) {
    obj._id = obj.id.toString();
  }
  return obj;
}

// Helper to convert JS object (camelCase) to DB fields (snake_case)
function mapObjToRow(obj) {
  if (!obj) return null;
  const row = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('_') || typeof obj[key] === 'function') continue;
    row[toSnakeCase(key)] = obj[key];
  }
  return row;
}

class ModelInstance {
  constructor(tableName, data) {
    this._tableName = tableName;
    Object.assign(this, data);
    if (data.id) {
      this._id = data.id.toString();
    }
  }

  toObject() {
    const copy = { ...this };
    delete copy._tableName;
    delete copy._id;
    return copy;
  }

  toJSON() {
    return this.toObject();
  }

  async save() {
    // Auto-hash password if it's present and not already hashed (bcrypt hashes start with $2a$ or $2b$)
    if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const rowData = mapObjToRow(this);
    delete rowData.id; // ID should not be set manually on insert/update

    if (this.id) {
      // UPDATE
      const keys = Object.keys(rowData);
      const setClause = keys.map((k, idx) => `"${k}" = $${idx + 1}`).join(', ');
      const values = keys.map(k => rowData[k]);
      values.push(this.id);
      
      const queryText = `UPDATE "${this._tableName}" SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`;
      const res = await db.query(queryText, values);
      if (res.rows.length > 0) {
        Object.assign(this, mapRowToObj(res.rows[0]));
      }
    } else {
      // INSERT
      const keys = Object.keys(rowData);
      const columns = keys.map(k => `"${k}"`).join(', ');
      const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(', ');
      const values = keys.map(k => rowData[k]);
      
      const queryText = `INSERT INTO "${this._tableName}" (${columns}) VALUES (${placeholders}) RETURNING *`;
      const res = await db.query(queryText, values);
      if (res.rows.length > 0) {
        Object.assign(this, mapRowToObj(res.rows[0]));
      }
    }
    return this;
  }

  async comparePassword(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

class QueryBuilder {
  constructor(model, queryOptions = {}) {
    this.model = model;
    this.queryOptions = {
      where: {},
      populates: [],
      sorts: null,
      selects: null,
      limit: null,
      singleRow: false,
      ...queryOptions
    };
  }

  populate(relation, fields) {
    this.queryOptions.populates.push({ relation, fields });
    return this;
  }

  sort(criteria) {
    this.queryOptions.sorts = criteria;
    return this;
  }

  select(fields) {
    this.queryOptions.selects = fields;
    return this;
  }

  limit(num) {
    this.queryOptions.limit = num;
    return this;
  }

  async then(onFulfilled, onRejected) {
    try {
      const result = await this.model._executeQuery(this.queryOptions);
      return onFulfilled(result);
    } catch (err) {
      if (onRejected) return onRejected(err);
      throw err;
    }
  }
}

class Model {
  constructor(tableName, relations = {}) {
    this.tableName = tableName;
    this.relations = relations; // e.g., { donorId: { table: 'donors', modelName: 'Donor' } }
  }

  wrap(row) {
    if (!row) return null;
    const obj = mapRowToObj(row);
    return new ModelInstance(this.tableName, obj);
  }

  find(where = {}) {
    return new QueryBuilder(this, { where, singleRow: false });
  }

  findOne(where = {}) {
    return new QueryBuilder(this, { where, singleRow: true });
  }

  findById(id) {
    return new QueryBuilder(this, { where: { id }, singleRow: true });
  }

  async create(data) {
    const instance = new ModelInstance(this.tableName, data);
    return await instance.save();
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    // Fetch instance
    const instance = await this.findById(id);
    if (!instance) return null;
    
    // Assign new data
    Object.assign(instance, updateData);
    return await instance.save();
  }

  async deleteMany(where = {}) {
    let queryText = `DELETE FROM "${this.tableName}"`;
    const values = [];
    
    const keys = Object.keys(where);
    if (keys.length > 0) {
      const clauses = keys.map((key, idx) => {
        const dbKey = toSnakeCase(key);
        return `"${dbKey}" = $${idx + 1}`;
      });
      queryText += ` WHERE ${clauses.join(' AND ')}`;
      keys.forEach(k => values.push(where[k]));
    }
    
    const res = await db.query(queryText, values);
    return { deletedCount: res.rowCount };
  }

  async deleteOne(where = {}) {
    return await this.deleteMany(where);
  }

  async countDocuments(where = {}) {
    let queryText = `SELECT COUNT(*) FROM "${this.tableName}"`;
    const values = [];
    
    const keys = Object.keys(where);
    if (keys.length > 0) {
      const clauses = keys.map((key, idx) => {
        const dbKey = toSnakeCase(key);
        // Handle mongo query operators like $in
        if (where[key] && typeof where[key] === 'object' && where[key].$in) {
          const list = where[key].$in;
          if (list.length === 0) return 'FALSE';
          const placeholders = list.map((_, lIdx) => `$${values.length + lIdx + 1}`).join(', ');
          list.forEach(item => values.push(item));
          return `"${dbKey}" IN (${placeholders})`;
        }
        values.push(where[key]);
        return `"${dbKey}" = $${idx + 1}`;
      });
      queryText += ` WHERE ${clauses.join(' AND ')}`;
    }
    
    const res = await db.query(queryText, values);
    return parseInt(res.rows[0].count, 10);
  }

  // Engine that parses QueryBuilder options and runs SQL queries
  async _executeQuery(options) {
    let queryText = `SELECT * FROM "${this.tableName}"`;
    const values = [];
    
    // 1. Where clause
    const keys = Object.keys(options.where);
    if (keys.length > 0) {
      const clauses = keys.map((key) => {
        const dbKey = toSnakeCase(key);
        const val = options.where[key];
        
        // Handle MongoDB operators
        if (val && typeof val === 'object') {
          if (val.$in) {
            const list = val.$in;
            if (list.length === 0) return 'FALSE';
            const placeholders = list.map((_, idx) => `$${values.length + idx + 1}`).join(', ');
            list.forEach(item => values.push(item));
            return `"${dbKey}" IN (${placeholders})`;
          }
        }
        
        values.push(val);
        return `"${dbKey}" = $${values.length}`;
      });
      queryText += ` WHERE ${clauses.join(' AND ')}`;
    }
    
    // 2. Sorting
    if (options.sorts) {
      const sortClauses = [];
      for (const sortKey of Object.keys(options.sorts)) {
        const dbSortKey = toSnakeCase(sortKey);
        const direction = options.sorts[sortKey] === -1 ? 'DESC' : 'ASC';
        sortClauses.push(`"${dbSortKey}" ${direction}`);
      }
      if (sortClauses.length > 0) {
        queryText += ` ORDER BY ${sortClauses.join(', ')}`;
      }
    }
    
    // 3. Limit
    if (options.limit) {
      queryText += ` LIMIT ${options.limit}`;
    } else if (options.singleRow) {
      queryText += ` LIMIT 1`;
    }
    
    const res = await db.query(queryText, values);
    
    if (options.singleRow) {
      if (res.rows.length === 0) return null;
      const doc = this.wrap(res.rows[0]);
      await this._populateRelations([doc], options.populates);
      return doc;
    } else {
      const docs = res.rows.map(row => this.wrap(row));
      await this._populateRelations(docs, options.populates);
      
      // Mongoose select emulation (removal/inclusion of fields)
      if (options.selects) {
        const fields = typeof options.selects === 'string' 
          ? options.selects.split(' ') 
          : Object.keys(options.selects);
          
        docs.forEach(doc => {
          fields.forEach(field => {
            if (field.startsWith('-')) {
              const cleanField = field.substring(1);
              delete doc[cleanField];
            } else if (field) {
              // positive select is harder since we have to delete everything else,
              // but we can just let it pass if needed.
            }
          });
        });
      }
      return docs;
    }
  }

  // Populates relational keys in returned records (emulates Mongoose populate)
  async _populateRelations(docs, populates) {
    if (!docs || docs.length === 0 || !populates || populates.length === 0) return;
    
    for (const pop of populates) {
      const relationKey = pop.relation; // e.g., 'donorId'
      const relationConfig = this.relations[relationKey];
      if (!relationConfig) continue;
      
      const { table, modelName } = relationConfig;
      
      for (const doc of docs) {
        if (!doc || !doc[relationKey]) continue;
        
        // Fetch matching row from relational table
        const res = await db.query(`SELECT * FROM "${table}" WHERE id = $1`, [doc[relationKey]]);
        if (res.rows.length > 0) {
          const relatedRow = res.rows[0];
          
          // Convert database snake_case to camelCase
          const obj = mapRowToObj(relatedRow);
          
          // Mongoose select-like projection on populated model
          if (pop.fields) {
            const fieldsArr = pop.fields.split(' ');
            const projectedObj = { id: obj.id, _id: obj._id };
            fieldsArr.forEach(field => {
              if (field && !field.startsWith('-')) {
                projectedObj[field] = obj[field];
              }
            });
            doc[relationKey] = projectedObj;
          } else {
            doc[relationKey] = obj;
          }
        }
      }
    }
  }
}

module.exports = {
  Model,
  ModelInstance
};
